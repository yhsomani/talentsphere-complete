/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Message Service - Data access layer for messaging and chat
 * 
 * Refactored to use DatabaseAdapter for loose coupling, resilience,
 * and testability via Dependency Injection.
 */

import type { DatabaseAdapter } from '../lib/database/adapter';
import { createDatabaseAdapter } from '../lib/database/adapter';
import { AppConfig } from '../config/index';
import { AppErrors, isAppError } from '../lib/errors/index';

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

export class MessageService {
  constructor(private readonly db: DatabaseAdapter) {}

  /**
   * Get all conversations for a user
   */
  async getConversations(userId: string): Promise<ConversationWithDetails[]> {
    try {
      // 1. Find all conversation_ids where user is participant
      const { data: myParticipations, error: partError } = await (this.db as any)
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
      const { data: conversations, error: convError } = await (this.db as any)
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (convError || !conversations) {
        return [];
      }

      // 3. Fetch all participants for these conversations
      const { data: allParticipants } = await (this.db as any)
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
      const { data: recentMessages } = await (this.db as any)
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
      if (isAppError(err)) throw err;
      console.error('Error in getConversations:', err);
      return [];
    }
  }

  /**
   * Get all messages in a conversation
   */
  async getConversationMessages(conversationId: string): Promise<MessageRecord[]> {
    try {
      const { data, error } = await (this.db as any)
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
        throw AppErrors.database('Error fetching messages', { cause: error, context: { conversationId } });
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
      if (isAppError(err)) throw err;
      console.error('Error in getConversationMessages:', err);
      return [];
    }
  }

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
      const { data, error } = await (this.db as any)
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
        throw AppErrors.database('Error sending message', { cause: error, context: params });
      }

      // Update conversation updated_at and last_message_at
      await (this.db as any)
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.conversationId);

      const u = Array.isArray(data.sender) ? data.sender[0] : data.sender;
      const [firstName = '', ...rest] = (u?.full_name || '').split(' ');
      const lastName = rest.join(' ');

      // Non-blocking in-app notification to conversation recipient(s) (NOTIF-005, NOTIF-001)
      try {
        const { data: participants } = await (this.db as any)
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', params.conversationId);

        let senderDisplayName = u?.full_name;
        if (!senderDisplayName && params.senderId) {
          const { data: senderUser } = await (this.db as any)
            .from('users')
            .select('full_name')
            .eq('id', params.senderId)
            .maybeSingle();
          if (senderUser?.full_name) {
            senderDisplayName = senderUser.full_name;
          }
        }
        senderDisplayName = senderDisplayName || 'Someone';

        const snippet = params.content.length > 80 ? params.content.slice(0, 77) + '...' : params.content;

        const otherParticipants = (participants || []).filter((p: any) => p.user_id !== params.senderId);
        for (const p of otherParticipants) {
          await (this.db as any).from('notifications').insert({
            user_id: p.user_id,
            type: 'message_received',
            title: `New message from ${senderDisplayName}`,
            message: snippet,
            link_url: `/messages?conversationId=${params.conversationId}`,
            link_label: 'Reply',
            channel: 'in_app',
            metadata: {
              conversationId: params.conversationId,
              messageId: data?.id,
              senderId: params.senderId,
            },
            is_read: false,
            is_archived: false,
          });
        }
      } catch (notifErr) {
        console.warn('Non-blocking message notification failed:', notifErr);
      }

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
      if (isAppError(err)) throw err;
      console.error('Error in sendMessage:', err);
      return null;
    }
  }

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
      const { data: conv, error: convError } = await (this.db as any)
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
        throw AppErrors.database('Error creating conversation', { cause: convError, context: params });
      }

      // 2. Add participants
      await (this.db as any)
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
      const { data: recipientUser } = await (this.db as any)
        .from('users')
        .select('id, email, full_name, role, avatar_url')
        .eq('id', params.recipientId)
        .single();

      const { data: creatorUser } = await (this.db as any)
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
      if (isAppError(err)) throw err;
      console.error('Error in createConversation:', err);
      return null;
    }
  }

  /**
   * Mark conversation as read for user
   */
  async markConversationRead(conversationId: string, userId: string): Promise<void> {
    try {
      await (this.db as any)
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);
    } catch (err) {
      if (isAppError(err)) throw err;
      console.error('Error marking conversation read:', err);
    }
  }

  /**
   * Get total unread message count for a user across all conversations
   * Fulfills MSG-004 single unread semantics requirement
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const convs = await this.getConversations(userId);
      return convs.reduce((sum, c) => sum + (c.unread_count || 0), 0);
    } catch (err) {
      if (isAppError(err)) throw err;
      console.error('Error in getUnreadCount:', err);
      return 0;
    }
  }

  /**
   * Find existing direct conversation between two users or create a new one
   * Fulfills RECRUIT-004 recruiter context messaging requirement
   */
  async getOrCreateConversation(params: {
    creatorId: string;
    recipientId: string;
    subject?: string;
    initialMessage?: string;
  }): Promise<ConversationWithDetails | null> {
    try {
      const existingConvs = await this.getConversations(params.creatorId);
      const existing = existingConvs.find(
        (c) =>
          c.type === 'direct' &&
          c.participants.some((p) => p.user_id === params.recipientId)
      );

      if (existing) {
        if (params.initialMessage?.trim()) {
          const sent = await this.sendMessage({
            conversationId: existing.id,
            senderId: params.creatorId,
            content: params.initialMessage.trim(),
          });
          if (sent) {
            existing.last_message = sent;
            existing.updated_at = sent.created_at;
          }
        }
        return existing;
      }

      return this.createConversation(params);
    } catch (err) {
      if (isAppError(err)) throw err;
      console.error('Error in getOrCreateConversation:', err);
      return null;
    }
  }

  /**
   * Mark individual message as read in message_reads
   */
  async markMessageRead(messageId: string, userId: string): Promise<void> {
    try {
      await (this.db as any)
        .from('message_reads')
        .upsert(
          { message_id: messageId, user_id: userId, read_at: new Date().toISOString() },
          { onConflict: 'message_id,user_id' }
        );
    } catch (err) {
      if (isAppError(err)) throw err;
      console.error('Error marking message read:', err);
    }
  }

  /**
   * Fetch single user profile info by id
   */
  async getUser(userId: string): Promise<{
    id: string;
    email: string;
    full_name?: string | null;
    first_name: string | null;
    last_name: string | null;
    user_role: string;
    avatar_url?: string | null;
  } | null> {
    try {
      const { data, error } = await (this.db as any)
        .from('users')
        .select('id, email, full_name, role, avatar_url')
        .eq('id', userId)
        .single();

      if (error || !data) return null;
      const [firstName = '', ...rest] = (data.full_name || '').split(' ');
      const lastName = rest.join(' ');
      return {
        id: data.id,
        email: data.email,
        full_name: data.full_name || null,
        first_name: firstName || null,
        last_name: lastName || null,
        user_role: data.role || 'candidate',
        avatar_url: data.avatar_url || null,
      };
    } catch {
      return null;
    }
  }

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
    avatar_url?: string | null;
  }>> {
    try {
      let req = (this.db as any)
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
          avatar_url: u.avatar_url || null,
        };
      });
    } catch {
      return [];
    }
  }
}

// Export singleton instance for backward compatibility
const defaultAdapter = createDatabaseAdapter({
  supabaseUrl: AppConfig.supabase.url,
  supabaseKey: AppConfig.supabase.anonKey,
});
export const messageService = new MessageService(defaultAdapter);
