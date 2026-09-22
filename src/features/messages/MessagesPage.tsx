/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useRef, useTransition, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Input, Avatar, Badge, LoadingSpinner } from '@/components/ui';
import { createBrowserClient } from '@/lib/supabase';
import {
  messageService,
  ConversationWithDetails,
  MessageRecord,
} from '@/services/message.service';
import { networkService } from '@/services/network.service';
import {
  Search,
  Send,
  Plus,
  MessageSquare,
  Paperclip,
  CheckCheck,
  X,
  Sparkles,
  UserX,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';

export function MessagesPage() {
  const searchParams = useSearchParams();
  const recipientIdParam = searchParams?.get('recipientId');
  const jobTitleParam = searchParams?.get('jobTitle');
  const initialMessageParam = searchParams?.get('initialMessage');

  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [, startTransition] = useTransition();

  // Helper to find other participant in direct chat
  const getOtherParticipant = useCallback((conv: ConversationWithDetails) => {
    if (!currentUser) return conv.participants[0]?.user;
    const other = conv.participants.find((p) => p.user_id !== currentUser.id);
    return other?.user || conv.participants[0]?.user;
  }, [currentUser]);

  // New Chat Modal state
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [initialMessageText, setInitialMessageText] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<any | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);

  // User Blocking state (NET-005)
  const [blockStatus, setBlockStatus] = useState<{ iBlockedThem: boolean; theyBlockedMe: boolean }>({
    iBlockedThem: false,
    theyBlockedMe: false,
  });
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('Inappropriate behavior or spam');
  const [isBlockingUser, setIsBlockingUser] = useState(false);
  const [unblocking, setUnblocking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check block status whenever activeConversation changes (NET-005)
  useEffect(() => {
    async function checkBlock() {
      if (!activeConversation || !currentUser) {
        setBlockStatus({ iBlockedThem: false, theyBlockedMe: false });
        return;
      }
      const other = getOtherParticipant(activeConversation);
      if (other?.id) {
        try {
          const status = await networkService.getBlockStatus(other.id);
          setBlockStatus(status);
        } catch (err) {
          console.error('Error checking block status:', err);
        }
      }
    }
    checkBlock();
  }, [activeConversation, currentUser, getOtherParticipant]);

  const handleBlockActiveUser = async () => {
    const other = activeConversation ? getOtherParticipant(activeConversation) : null;
    if (!other?.id) return;

    try {
      setIsBlockingUser(true);
      await networkService.blockUser({
        blockedUserId: other.id,
        reason: blockReason,
      });
      setBlockStatus((prev) => ({ ...prev, iBlockedThem: true }));
      setShowBlockModal(false);
    } catch (err) {
      console.error('Failed to block user:', err);
    } finally {
      setIsBlockingUser(false);
    }
  };

  const handleUnblockActiveUser = async () => {
    const other = activeConversation ? getOtherParticipant(activeConversation) : null;
    if (!other?.id) return;

    try {
      setUnblocking(true);
      await networkService.unblockUser(other.id);
      setBlockStatus((prev) => ({ ...prev, iBlockedThem: false }));
    } catch (err) {
      console.error('Failed to unblock user:', err);
    } finally {
      setUnblocking(false);
    }
  };

  // Load user & conversations with URL param support (RECRUIT-004)
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setCurrentUser({ id: user.id, email: user.email });
          let convs = await messageService.getConversations(user.id);

          if (recipientIdParam && recipientIdParam !== user.id) {
            let targetConv = convs.find(
              (c) =>
                c.type === 'direct' &&
                c.participants.some((p) => p.user_id === recipientIdParam)
            );

            if (!targetConv) {
              const created = await messageService.getOrCreateConversation({
                creatorId: user.id,
                recipientId: recipientIdParam,
                subject: jobTitleParam ? `Application: ${jobTitleParam}` : undefined,
                initialMessage: initialMessageParam || undefined,
              });
              if (created) {
                convs = [created, ...convs];
                targetConv = created;
              }
            }

            setConversations(convs);
            if (targetConv) {
              setActiveConversation(targetConv);
            } else if (convs.length > 0) {
              setActiveConversation(convs[0]);
            }
          } else {
            setConversations(convs);
            if (convs.length > 0) {
              setActiveConversation(convs[0]);
            }
          }
        }
      } catch (err) {
        console.error('Error loading conversations:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [recipientIdParam, jobTitleParam, initialMessageParam]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    async function loadConvMessages() {
      setMessagesLoading(true);
      try {
        const msgs = await messageService.getConversationMessages(activeConversation!.id);
        setMessages(msgs);
        if (currentUser) {
          messageService.markConversationRead(activeConversation!.id, currentUser.id);
          setConversations((prev) =>
            prev.map((c) => (c.id === activeConversation!.id ? { ...c, unread_count: 0 } : c))
          );
        }
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        setMessagesLoading(false);
      }
    }

    loadConvMessages();
  }, [activeConversation, currentUser]);

  // Real-time WebSocket: Active Conversation Message Delivery & Deduplication (MSG-002)
  useEffect(() => {
    if (!activeConversation?.id) return;

    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`chat:${activeConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConversation.id}`,
        },
        async (payload) => {
          const newMsg = payload.new as any;
          if (!newMsg) return;

          // Deduplication & optimistic reconciliation
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;

            const optimisticIndex = prev.findIndex(
              (m) =>
                m.id.startsWith('temp-') &&
                m.sender_id === newMsg.sender_id &&
                m.content === newMsg.content
            );

            let senderInfo = newMsg.sender;
            if (!senderInfo && currentUser) {
              if (newMsg.sender_id === currentUser.id) {
                senderInfo = {
                  id: currentUser.id,
                  email: currentUser.email || '',
                  first_name: 'You',
                  last_name: '',
                };
              } else {
                const other = getOtherParticipant(activeConversation);
                senderInfo = other;
              }
            }

            const formatted: MessageRecord = {
              ...newMsg,
              sender: senderInfo,
            };

            let nextMessages: MessageRecord[];
            if (optimisticIndex !== -1) {
              nextMessages = [...prev];
              nextMessages[optimisticIndex] = formatted;
            } else {
              nextMessages = [...prev, formatted];
            }

            return nextMessages.sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          });

          // Mark message read immediately if received while active
          if (currentUser && newMsg.sender_id !== currentUser.id) {
            messageService.markConversationRead(activeConversation.id, currentUser.id);
          }

          // Update sidebar conversation snippet
          setConversations((prev) =>
            prev.map((c) =>
              c.id === activeConversation.id
                ? {
                    ...c,
                    last_message: newMsg,
                    updated_at: newMsg.created_at,
                    unread_count: 0,
                  }
                : c
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation, currentUser, getOtherParticipant]);

  // Real-time WebSocket: User-level inbox updates across all conversations (MSG-002 & MSG-004)
  useEffect(() => {
    if (!currentUser?.id) return;

    const supabase = createBrowserClient();
    const userChannel = supabase
      .channel(`user-inbox:${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as any;
          if (!newMsg) return;

          setConversations((prev) => {
            const targetIndex = prev.findIndex((c) => c.id === newMsg.conversation_id);
            if (targetIndex === -1) return prev;

            const targetConv = prev[targetIndex];
            const isActive = activeConversation?.id === newMsg.conversation_id;
            const isFromMe = newMsg.sender_id === currentUser.id;

            const updatedConv: ConversationWithDetails = {
              ...targetConv,
              last_message: newMsg,
              updated_at: newMsg.created_at,
              unread_count:
                isActive || isFromMe
                  ? targetConv.unread_count || 0
                  : (targetConv.unread_count || 0) + 1,
            };

            const remaining = prev.filter((_, i) => i !== targetIndex);
            return [updatedConv, ...remaining];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
    };
  }, [currentUser?.id, activeConversation?.id]);

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConversation || !currentUser) return;

    const content = inputText.trim();
    setInputText('');

    // Optimistic UI update
    const optimisticMsg: MessageRecord = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConversation.id,
      sender_id: currentUser.id,
      content,
      message_type: 'text',
      attachments: [],
      is_edited: false,
      edited_at: null,
      is_deleted: false,
      created_at: new Date().toISOString(),
      sender: {
        id: currentUser.id,
        email: currentUser.email || '',
        first_name: 'You',
        last_name: '',
      },
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    const sent = await messageService.sendMessage({
      conversationId: activeConversation.id,
      senderId: currentUser.id,
      content,
    });

    if (sent) {
      setMessages((prev) => {
        const hasReal = prev.some((m) => m.id === sent.id);
        if (hasReal) {
          return prev.filter((m) => m.id !== optimisticMsg.id);
        }
        return prev.map((m) => (m.id === optimisticMsg.id ? sent : m));
      });
      // Update sidebar conversation snippet
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? { ...c, last_message: sent, updated_at: sent.created_at }
            : c
        )
      );
    }
  };

  // Search users for new chat modal
  useEffect(() => {
    if (!showNewChatModal || !currentUser) return;
    const timer = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const results = await messageService.searchUsers(userSearchTerm, currentUser.id);
        setSearchResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchingUsers(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearchTerm, showNewChatModal, currentUser]);

  // Create new conversation
  const handleCreateNewChat = async () => {
    if (!selectedRecipient || !currentUser) return;

    setCreatingChat(true);
    try {
      const newConv = await messageService.createConversation({
        creatorId: currentUser.id,
        recipientId: selectedRecipient.id,
        subject: `Conversation with ${selectedRecipient.first_name || selectedRecipient.email}`,
        initialMessage: initialMessageText.trim() || 'Hello!',
      });

      if (newConv) {
        setConversations((prev) => [newConv, ...prev]);
        setActiveConversation(newConv);
        setShowNewChatModal(false);
        setSelectedRecipient(null);
        setInitialMessageText('');
      }
    } catch (err) {
      console.error('Failed to create chat:', err);
    } finally {
      setCreatingChat(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const other = getOtherParticipant(conv);
    const name = `${other?.first_name || ''} ${other?.last_name || ''} ${other?.email || ''}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <DashboardLayout userRole="candidate">
      <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Main Messenger Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Conversation List */}
          <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col bg-gray-50/50">
            {/* Conversations Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                  {conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0) > 0 && (
                    <Badge variant="info" size="sm">
                      {conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0)} new
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setShowNewChatModal(true)}
                  className="gap-1 rounded-full px-3"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Chat</span>
                </Button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Conversation Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                  <LoadingSpinner size="md" />
                  <p className="mt-2 text-xs">Loading conversations...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  <MessageSquare className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="font-medium text-sm text-gray-700">No conversations</p>
                  <p className="text-xs text-gray-500 mt-1 mb-4">
                    Connect with recruiters, team members, or instructors.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowNewChatModal(true)}
                  >
                    Start a Conversation
                  </Button>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const other = getOtherParticipant(conv);
                  const isSelected = activeConversation?.id === conv.id;
                  const name =
                    other?.first_name || other?.last_name
                      ? `${other.first_name || ''} ${other.last_name || ''}`.trim()
                      : other?.email || 'TalentSphere Member';
                  const unread = conv.unread_count || 0;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => {
                        startTransition(() => {
                          setActiveConversation(conv);
                        });
                      }}
                      className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                        isSelected
                          ? 'bg-blue-50/80 border-r-4 border-blue-600'
                          : 'hover:bg-gray-100/70 bg-white'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar
                          alt={name}
                          fallback={name.substring(0, 2).toUpperCase()}
                          size="md"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm text-gray-900 truncate">
                            {name}
                          </h4>
                          {conv.last_message?.created_at && (
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-1">
                              {new Date(conv.last_message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 truncate max-w-[180px]">
                            {conv.last_message?.content || conv.subject || 'No messages yet'}
                          </p>
                          {unread > 0 && (
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                              {unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Active Chat Area */}
          <div className="hidden md:flex flex-1 flex-col bg-white">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-3.5 border-b border-gray-200 flex items-center justify-between bg-white shadow-xs">
                  <div className="flex items-center gap-3">
                    <Avatar
                      alt={
                        getOtherParticipant(activeConversation)?.first_name ||
                        getOtherParticipant(activeConversation)?.email ||
                        'Member'
                      }
                      fallback={(
                        getOtherParticipant(activeConversation)?.first_name?.[0] || 'M'
                      ).toUpperCase()}
                      size="md"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {getOtherParticipant(activeConversation)?.first_name ||
                        getOtherParticipant(activeConversation)?.last_name
                          ? `${getOtherParticipant(activeConversation)?.first_name || ''} ${
                              getOtherParticipant(activeConversation)?.last_name || ''
                            }`.trim()
                          : getOtherParticipant(activeConversation)?.email || 'Member'}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-green-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span>Online</span>
                        {getOtherParticipant(activeConversation)?.user_role && (
                          <span className="text-gray-400 capitalize">
                            • {getOtherParticipant(activeConversation)?.user_role}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Header Actions (Block User - NET-005) */}
                  {activeConversation.type === 'direct' && (
                    <div className="flex items-center gap-2">
                      {blockStatus.iBlockedThem ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={unblocking}
                          onClick={handleUnblockActiveUser}
                          className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
                        >
                          {unblocking ? 'Unblocking...' : 'Unblock User'}
                        </Button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowBlockModal(true)}
                          title="Block this user (NET-005)"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200/80 transition-colors"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Block</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* User Blocked Warning Banners (NET-005) */}
                {blockStatus.iBlockedThem && (
                  <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>You have blocked this user. Unblock them to resume messaging.</span>
                    </div>
                    <button
                      onClick={handleUnblockActiveUser}
                      disabled={unblocking}
                      className="font-bold underline hover:text-amber-950 ml-2"
                    >
                      {unblocking ? 'Unblocking...' : 'Unblock'}
                    </button>
                  </div>
                )}

                {blockStatus.theyBlockedMe && (
                  <div className="px-6 py-2.5 bg-rose-50 border-b border-rose-200 flex items-center gap-2 text-xs text-rose-900 animate-in fade-in duration-150">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>You cannot send messages to this user because they have blocked interactions.</span>
                  </div>
                )}

                {/* Contextual Requisition Banner (RECRUIT-004) */}
                {activeConversation.subject && (
                  <div className="px-6 py-2 bg-indigo-50/80 border-b border-indigo-100 flex items-center justify-between animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-950 min-w-0">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate">{activeConversation.subject}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200 shrink-0 ml-2">
                      Requisition Thread
                    </span>
                  </div>
                )}

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/40">
                  {messagesLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <LoadingSpinner size="md" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-12">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <p className="font-medium text-gray-700">No messages in this chat yet</p>
                      <p className="text-xs text-gray-500 max-w-sm mt-1">
                        Say hello to start the conversation! You can discuss job openings, requirements, or assessments.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === currentUser?.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isMe && (
                            <Avatar
                              alt="Sender"
                              fallback="M"
                              size="sm"
                              className="mb-1"
                            />
                          )}

                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                              isMe
                                ? 'bg-blue-600 text-white rounded-br-xs shadow-sm'
                                : 'bg-white border border-gray-200 text-gray-900 rounded-bl-xs shadow-xs'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words leading-relaxed">
                              {msg.content}
                            </p>
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                                isMe ? 'text-blue-100' : 'text-gray-400'
                              }`}
                            >
                              <span>
                                {new Date(msg.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {isMe && <CheckCheck className="w-3 h-3" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Footer */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 bg-white border-t border-gray-200 flex items-center gap-2"
                >
                  <button
                    type="button"
                    title="Attach file"
                    disabled={blockStatus.iBlockedThem || blockStatus.theyBlockedMe}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    disabled={blockStatus.iBlockedThem || blockStatus.theyBlockedMe}
                    placeholder={
                      blockStatus.iBlockedThem
                        ? 'You have blocked this user. Unblock to send messages.'
                        : blockStatus.theyBlockedMe
                        ? 'Messaging disabled because this user blocked interactions.'
                        : 'Type your message... (Press Enter to send)'
                    }
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!inputText.trim() || blockStatus.iBlockedThem || blockStatus.theyBlockedMe}
                    className="px-4 py-2.5 gap-2 rounded-xl"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Select a Conversation
                </h3>
                <p className="text-sm text-gray-500 max-w-sm mb-6">
                  Pick a chat from the list or start a new direct conversation to collaborate.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowNewChatModal(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Message
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Start New Conversation</h3>
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setSelectedRecipient(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* User Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Recipient
                </label>
                {selectedRecipient ? (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        {(selectedRecipient.first_name?.[0] || selectedRecipient.email[0]).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedRecipient.first_name || selectedRecipient.last_name
                            ? `${selectedRecipient.first_name || ''} ${selectedRecipient.last_name || ''}`.trim()
                            : selectedRecipient.email}
                        </p>
                        <p className="text-xs text-gray-500">{selectedRecipient.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedRecipient(null)}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div>
                    <Input
                      placeholder="Search by name or email..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                    />
                    <div className="mt-2 max-h-48 overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-xl">
                      {searchingUsers ? (
                        <div className="p-4 text-center text-xs text-gray-400">Searching...</div>
                      ) : searchResults.length === 0 ? (
                        <div className="p-4 text-center text-xs text-gray-400">
                          {userSearchTerm ? 'No users found' : 'Type to search members'}
                        </div>
                      ) : (
                        searchResults.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => setSelectedRecipient(u)}
                            className="w-full text-left p-2.5 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                          >
                            <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-medium text-xs">
                              {(u.first_name?.[0] || u.email[0]).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {u.first_name || u.last_name
                                  ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
                                  : u.email}
                              </p>
                              <p className="text-xs text-gray-500 truncate capitalize">
                                {u.user_role || 'member'} • {u.email}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Initial Message */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Message
                </label>
                <textarea
                  rows={3}
                  value={initialMessageText}
                  onChange={(e) => setInitialMessageText(e.target.value)}
                  placeholder="Say hello or introduce yourself..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowNewChatModal(false);
                  setSelectedRecipient(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!selectedRecipient || creatingChat}
                isLoading={creatingChat}
                onClick={handleCreateNewChat}
              >
                Start Chat
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Block User Confirmation Modal (NET-005) */}
      {showBlockModal && activeConversation && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Block {getOtherParticipant(activeConversation)?.first_name || 'User'}?
                  </h3>
                  <p className="text-xs text-gray-500">Prevent future messages & interactions</p>
                </div>
              </div>
              <button
                onClick={() => setShowBlockModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                Blocking this user will prevent them from sending you messages or interacting with your profile.
                You can manage or unblock them anytime from your <strong>Settings &gt; Network &amp; Privacy</strong>.
              </p>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason for blocking (optional)
                </label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800 cursor-pointer"
                >
                  <option value="Inappropriate behavior or harassment">Inappropriate behavior or harassment</option>
                  <option value="Spam or unwanted advertising">Spam or unwanted advertising</option>
                  <option value="Suspected fraudulent or impersonation activity">Suspected fraudulent or impersonation activity</option>
                  <option value="Unsolicited recruiting messages">Unsolicited recruiting messages</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowBlockModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isBlockingUser}
                onClick={handleBlockActiveUser}
                className="gap-1.5"
              >
                <UserX className="w-4 h-4" />
                <span>Confirm Block</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
