import api from './config';

export interface Conversation {
  id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar?: string;
  product_id?: string;
  product_title?: string;
  product_image?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export const messagesService = {
  async getConversations(): Promise<{ success: boolean; conversations: Conversation[] }> {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  async getOrCreateConversation(data: {
    other_user_id: string;
    product_id?: string;
  }): Promise<{ success: boolean; conversation: any }> {
    const response = await api.post('/messages/conversations', data);
    return response.data;
  },

  async getMessages(conversationId: string): Promise<{ success: boolean; messages: Message[] }> {
    const response = await api.get(`/messages/conversations/${conversationId}/messages`);
    return response.data;
  },

  async sendMessage(conversationId: string, content: string): Promise<{ success: boolean; message: Message }> {
    const response = await api.post(`/messages/conversations/${conversationId}/messages`, { content });
    return response.data;
  },

  async markAsRead(conversationId: string): Promise<{ success: boolean }> {
    // Backend marks as read automatically when fetching messages
    return { success: true };
  },

  async getUnreadCount(): Promise<{ success: boolean; count: number }> {
    const response = await api.get('/messages/unread/count');
    return response.data;
  },
};

export default messagesService;
