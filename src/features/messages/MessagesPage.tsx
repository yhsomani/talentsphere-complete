/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Input, Avatar, Badge, LoadingSpinner } from '@/components/ui';
import { createBrowserClient } from '@/lib/supabase';
import {
  messageService,
  ConversationWithDetails,
  MessageRecord,
} from '@/services/message.service';
import {
  Search,
  Send,
  Plus,
  MessageSquare,
  Paperclip,
  CheckCheck,
  X,
  Sparkles,
} from 'lucide-react';

export function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [, startTransition] = useTransition();

  // New Chat Modal state
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [initialMessageText, setInitialMessageText] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<any | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user & conversations
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setCurrentUser({ id: user.id, email: user.email });
          const convs = await messageService.getConversations(user.id);
          setConversations(convs);
          if (convs.length > 0) {
            setActiveConversation(convs[0]);
          }
        }
      } catch (err) {
        console.error('Error loading conversations:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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
        }
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        setMessagesLoading(false);
      }
    }

    loadConvMessages();
  }, [activeConversation, currentUser]);

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
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? sent : m))
      );
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

  // Helper to find other participant in direct chat
  const getOtherParticipant = (conv: ConversationWithDetails) => {
    if (!currentUser) return conv.participants[0]?.user;
    const other = conv.participants.find((p) => p.user_id !== currentUser.id);
    return other?.user || conv.participants[0]?.user;
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
                </div>

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
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    placeholder="Type your message... (Press Enter to send)"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!inputText.trim()}
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
    </DashboardLayout>
  );
}
