/**
 * Message Service - Refactored Version
 * 
 * Data access layer for messaging operations.
 * Handles all Supabase interactions for conversations and messages.
 * Uses DatabaseAdapter for loose coupling and testability.
 */

import type { Database } from '@/types/database.types';
import { DatabaseAdapter } from '@/lib/database/adapter';
import { AppErrors, isAppError } from '@/lib/errors';

type ConversationInsert = Database['public']['Tables']['conversations']['Insert'];
type ConversationUpdate = Database['public']['Tables']['conversations']['Update'];
type MessageInsert = Database['public']['Tables']['messages']['Insert'];
type MessageUpdate = Database['public']['Tables']['messages']['Update'];

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

export interface UserSearchResult {
  id: string;
  email: string;
  full_name?: string | null;
  first_name: string | null;
  last_name: string | null;
  user_role: string;
  avatar_url?: string | null;
}

/**
 * MessageService class with dependency injection
 */
export class MessageService {
  constructor(private readonly db: DatabaseAdapter) {}

  /**
   * Helper to format user data
   */
  private formatUser(user: any): UserSearchResult | null {
    if (!user) return null;
    const [firstName = '', ...rest] = (user.full_name || '').split(' ');
    const lastName = rest.join(' ');
    return {
      id: user.id,
      email: user.email || '',
      full_name: user.full_name || null,
      first_name: firstName || null,
      last_name: lastName || null,
      user_role: user.role || 'candidate',
      avatar_url: user.avatar_url || null,
    };
  }

  /**
   * Get all conversations for a user
   */
  async getConversations(userId: string): Promise<ConversationWithDetails[]> {
    try {
      // 1. Find all conversation_ids where user is participant
      const partResult = await this.db.list<any>('conversation_participants', {
        filters: [{ field: 'user_id', operator: 'eq', value: userId }],
      });

      if (partResult.error || !partResult.data || partResult.data.length === 0) {
        return [];
      }

      const myParticipations = partResult.data;
      const conversationIds = myParticipations.map((p: any) => p.conversation_id);
      const readAtMap = new Map<string, string | null>(
        myParticipations.map((p: any) => [p.conversation_id, p.last_read_at])
      );

      // 2. Fetch conversations
      const convResult = await this.db.list<any>('conversations', {
        filters: [{ field: 'id', operator: 'in', value: conversationIds }],
        pagination: { orderBy: 'updated_at', ascending: false },
      });

      if (convResult.error || !convResult.data) {
        return [];
      }

      const conversations = convResult.data;

      // 3. Fetch all participants for these conversations
      const participantsResult = await this.db.list<any>('conversation_participants', {
        filters: [{ field: 'conversation_id', operator: 'in', value: conversationIds }],
      });

      // Group participants by conversation_id
      const participantsByConv = new Map<string, ParticipantInfo[]>();
      (participantsResult.data || []).forEach((p: any) => {
        const formattedParticipant: ParticipantInfo = {
          ...p,
          user: this.formatUser(p.user),
        };
        const list = participantsByConv.get(p.conversation_id) || [];
        list.push(formattedParticipant);
        participantsByConv.set(p.conversation_id, list);
      });

      // 4. Fetch latest message for each conversation
      const messagesResult = await this.db.list<any>('messages', {
        filters: [{ field: 'conversation_id', operator: 'in', value: conversationIds }],
        pagination: { orderBy: 'created_at', ascending: false },
      });

      const lastMessageByConv = new Map<string, MessageRecord>();
      const unreadCountByConv = new Map<string, number>();

      (messagesResult.data || []).forEach((m: any) => {
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
      const error = isAppError(err) ? err : AppErrors.UNKNOWN;
      throw error;
    }
  }

  /**
   * Get all messages in a conversation
   */
  async getConversationMessages(conversationId: string): Promise<MessageRecord[]> {
    try {
      const result = await this.db.list<any>('messages', {
        filters: [{ field: 'conversation_id', operator: 'eq', value: conversationId }],
        pagination: { orderBy: 'created_at', ascending: true },
      });

      if (result.error) {
        console.error('Error fetching messages:', result.error);
        return [];
      }

      return (result.data || []).map((m: any) => ({
        ...m,
        sender: this.formatUser(m.sender),
      }));
    } catch (err) {
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
      const insertData: MessageInsert = {
        conversation_id: params.conversationId,
        sender_id: params.senderId,
        content: params.content,
        message_type: params.messageType || 'text',
        attachments: params.attachments || [],
      };

      const result = await this.db.create<any>('messages', insertData);

      if (result.error) {
        console.error('Error sending message:', result.error);
        return null;
      }

      // Update conversation updated_at and last_message_at
      await this.db.update<any>('conversations', params.conversationId, {
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      return {
        ...result.data,
        sender: this.formatUser(result.data?.sender),
      };
    } catch (err) {
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
      const convData: ConversationInsert = {
        type: 'direct',
        subject: params.subject || null,
        created_by: params.creatorId,
        last_message_at: new Date().toISOString(),
      };

      const convResult = await this.db.create<any>('conversations', convData);

      if (convResult.error || !convResult.data) {
        console.error('Error creating conversation:', convResult.error);
        return null;
      }

      const conv = convResult.data;

      // 2. Add participants
      await this.db.bulkCreate('conversation_participants', [
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

      // Fetch participant details
      const [recipientUser, creatorUser] = await Promise.all([
        this.db.get<any>('users', params.recipientId),
        this.db.get<any>('users', params.creatorId),
      ]);

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
            user: this.formatUser(creatorUser?.data),
          },
          {
            id: 'p2',
            conversation_id: conv.id,
            user_id: params.recipientId,
            joined_at: new Date().toISOString(),
            last_read_at: null,
            is_muted: false,
            user: this.formatUser(recipientUser?.data),
          },
        ],
        last_message: firstMsg,
        unread_count: 0,
      };
    } catch (err) {
      console.error('Error in createConversation:', err);
      return null;
    }
  }

  /**
   * Mark conversation as read for user
   */
  async markConversationRead(conversationId: string, userId: string): Promise<void> {
    try {
      await this.db.update('conversation_participants', undefined, {
        last_read_at: new Date().toISOString(),
      }, {
        filters: [
          { field: 'conversation_id', operator: 'eq', value: conversationId },
          { field: 'user_id', operator: 'eq', value: userId },
        ],
      });
    } catch (err) {
      console.error('Error marking conversation read:', err);
    }
  }

  /**
   * Search available users to message
   */
  async searchUsers(query: string, currentUserId: string): Promise<UserSearchResult[]> {
    try {
      const filters: any[] = [{ field: 'id', operator: 'neq', value: currentUserId }];
      
      if (query.trim()) {
        // Note: Complex OR queries may need custom handling
        filters.push({ field: 'email', operator: 'ilike', value: `%${query}%` });
      }

      const result = await this.db.list<any>('users', {
        filters,
        pagination: { pageSize: 10 },
      });

      if (result.error) {
        return [];
      }

      return (result.data || []).map(this.formatUser).filter(Boolean) as UserSearchResult[];
    } catch {
      return [];
    }
  }

  /**
   * Archive a conversation
   */
  async archiveConversation(conversationId: string): Promise<boolean> {
    try {
      const result = await this.db.update<any>('conversations', conversationId, {
        is_archived: true,
        updated_at: new Date().toISOString(),
      });

      return !result.error;
    } catch (err) {
      console.error('Error archiving conversation:', err);
      return false;
    }
  }

  /**
   * Delete a conversation (soft delete via archive)
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    return this.archiveConversation(conversationId);
  }

  /**
   * Mute/unmute a conversation for a user
   */
  async toggleMute(conversationId: string, userId: string, isMuted: boolean): Promise<boolean> {
    try {
      const result = await this.db.update('conversation_participants', undefined, {
        is_muted: isMuted,
      }, {
        filters: [
          { field: 'conversation_id', operator: 'eq', value: conversationId },
          { field: 'user_id', operator: 'eq', value: userId },
        ],
      });

      return !result.error;
    } catch (err) {
      console.error('Error toggling mute:', err);
      return false;
    }
  }

  /**
   * Edit a message
   */
  async editMessage(messageId: string, content: string): Promise<MessageRecord | null> {
    try {
      const result = await this.db.update<any>('messages', messageId, {
        content,
        is_edited: true,
        edited_at: new Date().toISOString(),
      });

      if (result.error) {
        return null;
      }

      return {
        ...result.data,
        sender: this.formatUser(result.data?.sender),
      };
    } catch (err) {
      console.error('Error editing message:', err);
      return null;
    }
  }

  /**
   * Delete a message (soft delete)
   */
  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const result = await this.db.update<any>('messages', messageId, {
        is_deleted: true,
        content: '[Message deleted]',
      });

      return !result.error;
    } catch (err) {
      console.error('Error deleting message:', err);
      return false;
    }
  }
}

// Backward compatible exports
let defaultMessageService: MessageService | null = null;

export function initMessageService(db: DatabaseAdapter): MessageService {
  defaultMessageService = new MessageService(db);
  return defaultMessageService;
}

export const messageService = new Proxy<MessageService>({} as MessageService, {
  get(_target, prop) {
    if (!defaultMessageService) {
      throw new Error('MessageService not initialized. Call initMessageService() first.');
    }
    return (defaultMessageService as any)[prop];
  },
});
