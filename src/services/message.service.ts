import { createBrowserClient } from '@/lib/supabase';

export interface ParticipantInfo {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string | null;
  is_muted: boolean;
  user?: {
    id: string;
    email: string;
    full_name?: string | null;
    first_name: string | null;
    last_name: string | null;
    user_role: string;
    avatar_url?: string | null;
  } | null;
}

export interface MessageRecord {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  attachments: Array<{
    name: string;
    url: string;
    size?: number;
    type?: string;
  }> | null;
  is_edited: boolean;
  edited_at: string | null;
  is_deleted: boolean;
  created_at: string;
  sender?: {
    id: string;
    email: string;
    full_name?: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url?: string | null;
  } | null;
}

export interface ConversationWithDetails {
  id: string;
  type: string;
  subject: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  is_archived: boolean;
  participants: ParticipantInfo[];
  last_message?: MessageRecord | null;
  unread_count?: number;
}

const supabase = createBrowserClient();

export const messageService = {
  /**
   * Get all conversations for a user
   */
  async getConversations(userId: string): Promise<ConversationWithDetails[]> {
    try {
      // 1. Find all conversation_ids where user is participant
      const { data: myParticipations, error: partError } = await (supabase as any)
        .from('conversation_participants')
        .select('conversation_id, last_read_at')
        .eq('user_id', userId);

      if (partError || !myParticipations || myParticipations.length === 0) {
        return [];
      }

      const conversationIds = myParticipations.map((p: any) => p.conversation_id);
      const readAtMap = new Map<string, string | null>(
        myParticipations.map((p: any) => [p.conversation_id, p.last_read_at])
      );

      // 2. Fetch conversations
      const { data: conversations, error: convError } = await (supabase as any)
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (convError || !conversations) {
        return [];
      }

      // 3. Fetch all participants for these conversations
      const { data: allParticipants } = await (supabase as any)
        .from('conversation_participants')
        .select(`
          id,
          conversation_id,
          user_id,
          joined_at,
          last_read_at,
          is_muted,
          user:users (
            id,
            email,
            full_name,
            role,
            avatar_url
          )
        `)
        .in('conversation_id', conversationIds);

      // Group participants by conversation_id
      const participantsByConv = new Map<string, ParticipantInfo[]>();
      (allParticipants || []).forEach((p: any) => {
        const u = Array.isArray(p.user) ? p.user[0] : p.user;
        const [firstName = '', ...rest] = (u?.full_name || '').split(' ');
        const lastName = rest.join(' ');
        const formattedParticipant: ParticipantInfo = {
          ...p,
          user: u ? {
            id: u.id,
            email: u.email || '',
            full_name: u.full_name || null,
            first_name: firstName || null,
            last_name: lastName || null,
            user_role: u.role || 'candidate',
            avatar_url: u.avatar_url || null,
          } : null,
        };
        const list = participantsByConv.get(p.conversation_id) || [];
        list.push(formattedParticipant);
        participantsByConv.set(p.conversation_id, list);
      });

      // 4. Fetch latest message for each conversation
      const { data: recentMessages } = await (supabase as any)
        .from('messages')
        .select('*')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false });

      const lastMessageByConv = new Map<string, MessageRecord>();
      const unreadCountByConv = new Map<string, number>();

      (recentMessages || []).forEach((m: any) => {
        if (!lastMessageByConv.has(m.conversation_id)) {
          lastMessageByConv.set(m.conversation_id, m);
        }
        const lastRead = readAtMap.get(m.conversation_id);
        if (m.sender_id !== userId && (!lastRead || new Date(m.created_at) > new Date(lastRead))) {
          unreadCountByConv.set(m.conversation_id, (unreadCountByConv.get(m.conversation_id) || 0) + 1);
        }
      });

      return conversations.map((conv: any) => ({
        ...conv,
        participants: participantsByConv.get(conv.id) || [],
        last_message: lastMessageByConv.get(conv.id) || null,
        unread_count: unreadCountByConv.get(conv.id) || 0,
      }));
    } catch (err) {
      console.error('Error in getConversations:', err);
      return [];
    }
  },

  /**
   * Get all messages in a conversation
   */
  async getConversationMessages(conversationId: string): Promise<MessageRecord[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          attachments,
          is_edited,
          edited_at,
          is_deleted,
          created_at,
          sender:users (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      return (data || []).map((m: any) => {
        const u = Array.isArray(m.sender) ? m.sender[0] : m.sender;
        const [firstName = '', ...rest] = (u?.full_name || '').split(' ');
        const lastName = rest.join(' ');
        return {
          ...m,
          sender: u ? {
            id: u.id,
            email: u.email || '',
            full_name: u.full_name || null,
            first_name: firstName || null,
            last_name: lastName || null,
            avatar_url: u.avatar_url || null,
          } : null,
        };
      });
    } catch (err) {
      console.error('Error in getConversationMessages:', err);
      return [];
    }
  },

  /**
   * Send a message
   */
  async sendMessage(params: {
    conversationId: string;
    senderId: string;
    content: string;
    messageType?: string;
    attachments?: Array<{ name: string; url: string; size?: number; type?: string }>;
  }): Promise<MessageRecord | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('messages')
        .insert({
          conversation_id: params.conversationId,
          sender_id: params.senderId,
          content: params.content,
          message_type: params.messageType || 'text',
          attachments: params.attachments || [],
        })
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          attachments,
          is_edited,
          edited_at,
          is_deleted,
          created_at,
          sender:users (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return null;
      }

      // Update conversation updated_at and last_message_at
      await (supabase as any)
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.conversationId);

      const u = Array.isArray(data.sender) ? data.sender[0] : data.sender;
      const [firstName = '', ...rest] = (u?.full_name || '').split(' ');
      const lastName = rest.join(' ');

      return {
        ...data,
        sender: u ? {
          id: u.id,
          email: u.email || '',
          full_name: u.full_name || null,
          first_name: firstName || null,
          last_name: lastName || null,
          avatar_url: u.avatar_url || null,
        } : null,
      };
    } catch (err) {
      console.error('Error in sendMessage:', err);
      return null;
    }
  },

  /**
   * Create a new direct conversation between two users
   */
  async createConversation(params: {
    creatorId: string;
    recipientId: string;
    subject?: string;
    initialMessage?: string;
  }): Promise<ConversationWithDetails | null> {
    try {
      // 1. Create conversation record
      const { data: conv, error: convError } = await (supabase as any)
        .from('conversations')
        .insert({
          type: 'direct',
          subject: params.subject || null,
          created_by: params.creatorId,
          last_message_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (convError || !conv) {
        console.error('Error creating conversation:', convError);
        return null;
      }

      // 2. Add participants
      await (supabase as any)
        .from('conversation_participants')
        .insert([
          { conversation_id: conv.id, user_id: params.creatorId, last_read_at: new Date().toISOString() },
          { conversation_id: conv.id, user_id: params.recipientId },
        ]);

      // 3. Send initial message if provided
      let firstMsg: MessageRecord | null = null;
      if (params.initialMessage?.trim()) {
        firstMsg = await this.sendMessage({
          conversationId: conv.id,
          senderId: params.creatorId,
          content: params.initialMessage.trim(),
        });
      }

      // Fetch recipient details
      const { data: recipientUser } = await (supabase as any)
        .from('users')
        .select('id, email, full_name, role, avatar_url')
        .eq('id', params.recipientId)
        .single();

      const { data: creatorUser } = await (supabase as any)
        .from('users')
        .select('id, email, full_name, role, avatar_url')
        .eq('id', params.creatorId)
        .single();

      const formatUser = (u: any) => {
        if (!u) return null;
        const [firstName = '', ...rest] = (u.full_name || '').split(' ');
        const lastName = rest.join(' ');
        return {
          id: u.id,
          email: u.email || '',
          full_name: u.full_name || null,
          first_name: firstName || null,
          last_name: lastName || null,
          user_role: u.role || 'candidate',
          avatar_url: u.avatar_url || null,
        };
      };

      return {
        ...conv,
        participants: [
          {
            id: 'p1',
            conversation_id: conv.id,
            user_id: params.creatorId,
            joined_at: new Date().toISOString(),
            last_read_at: new Date().toISOString(),
            is_muted: false,
            user: formatUser(creatorUser),
          },
          {
            id: 'p2',
            conversation_id: conv.id,
            user_id: params.recipientId,
            joined_at: new Date().toISOString(),
            last_read_at: null,
            is_muted: false,
            user: formatUser(recipientUser),
          },
        ],
        last_message: firstMsg,
        unread_count: 0,
      };
    } catch (err) {
      console.error('Error in createConversation:', err);
      return null;
    }
  },

  /**
   * Mark conversation as read for user
   */
  async markConversationRead(conversationId: string, userId: string): Promise<void> {
    try {
      await (supabase as any)
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .match({ conversation_id: conversationId, user_id: userId });
    } catch (err) {
      console.error('Error marking conversation read:', err);
    }
  },

  /**
   * Search available users to message
   */
  async searchUsers(query: string, currentUserId: string): Promise<Array<{
    id: string;
    email: string;
    full_name?: string | null;
    first_name: string | null;
    last_name: string | null;
    user_role: string;
  }>> {
    try {
      let req = (supabase as any)
        .from('users')
        .select('id, email, full_name, role, avatar_url')
        .neq('id', currentUserId)
        .limit(10);

      if (query.trim()) {
        req = req.or(`email.ilike.%${query}%,full_name.ilike.%${query}%`);
      }

      const { data, error } = await req;
      if (error) return [];
      return (data || []).map((u: any) => {
        const [firstName = '', ...rest] = (u.full_name || '').split(' ');
        const lastName = rest.join(' ');
        return {
          id: u.id,
          email: u.email,
          full_name: u.full_name || null,
          first_name: firstName || null,
          last_name: lastName || null,
          user_role: u.role || 'candidate',
        };
      });
    } catch {
      return [];
    }
  }
};
