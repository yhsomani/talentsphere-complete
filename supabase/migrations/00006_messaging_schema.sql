-- TalentSphere Migration: 00006_messaging_schema.sql
-- Direct Messaging schema: message_threads, thread_participants, messages with clientMessageId deduplication and RLS.
-- Conforms to: WF-10 (WIT-010), BR-214.

-- 1. Message Threads Table
CREATE TABLE IF NOT EXISTS public.message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_threads_last_message ON public.message_threads(last_message_at DESC);

-- 2. Thread Participants Table
CREATE TABLE IF NOT EXISTS public.thread_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (thread_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_thread_participants_user_id ON public.thread_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_thread_participants_thread_id ON public.thread_participants(thread_id);

-- 3. Messages Table (client_message_id dedupe per WF-10)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  content TEXT NOT NULL,
  client_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (thread_id, client_message_id)
);

CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Threads RLS: Only thread participants can view threads
CREATE POLICY message_threads_select_policy ON public.message_threads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.thread_participants tp
      WHERE tp.thread_id = message_threads.id
      AND tp.user_id = auth.uid()
    )
  );

-- Thread Participants RLS: Participants can view members of their threads
CREATE POLICY thread_participants_select_policy ON public.thread_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.thread_participants tp
      WHERE tp.thread_id = thread_participants.thread_id
      AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY thread_participants_insert_policy ON public.thread_participants
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.thread_participants tp
      WHERE tp.thread_id = thread_participants.thread_id
      AND tp.user_id = auth.uid()
    )
  );

-- Messages RLS: Only participants can read messages
CREATE POLICY messages_select_policy ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.thread_participants tp
      WHERE tp.thread_id = messages.thread_id
      AND tp.user_id = auth.uid()
    )
  );

-- Messages RLS: Only participants can insert messages with sender_id = auth.uid()
CREATE POLICY messages_insert_policy ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.thread_participants tp
      WHERE tp.thread_id = messages.thread_id
      AND tp.user_id = auth.uid()
    )
  );
