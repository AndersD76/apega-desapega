import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { messagesService } from '../api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { formatPrice } from '../utils/format';

const PLACEHOLDER_AVATAR = 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200';

export function ChatScreen({ route, navigation }: any) {
  const {
    conversationId: initialConversationId,
    sellerId,
    sellerName,
    sellerAvatar,
    productId,
    productTitle,
    productImage,
    productPrice
  } = route.params || {};

  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const { user } = useAuth();
  const { socket, isConnected, onlineUsers } = useSocket();

  const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Check if seller is online
  const isSellerOnline = sellerId ? onlineUsers.has(sellerId) : false;

  const seller = {
    name: sellerName || 'Vendedor',
    avatar: sellerAvatar || PLACEHOLDER_AVATAR,
    online: isSellerOnline,
  };

  const product = {
    title: productTitle || 'Produto',
    price: productPrice || 0,
    image: productImage || 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400',
  };

  // Handle incoming real-time messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      // Only process messages for this conversation
      if (data.conversationId === conversationId) {
        const newMessage = {
          id: data.message?.id || String(Date.now()),
          text: data.message?.content || data.content,
          isMe: false,
          timestamp: new Date(data.message?.created_at || data.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });

        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    };

    const handleTyping = (data: any) => {
      if (data.conversationId === conversationId && data.userId === sellerId) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = (data: any) => {
      if (data.conversationId === conversationId && data.userId === sellerId) {
        setIsTyping(false);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
    };
  }, [socket, conversationId, sellerId]);

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      // If we already have a conversation ID, just fetch messages
      if (conversationId) {
        await fetchMessages(conversationId);
        return;
      }

      // Otherwise, create or get the conversation
      if (sellerId) {
        const response = await messagesService.getOrCreateConversation({
          other_user_id: sellerId,
          product_id: productId,
        });

        if (response.success && response.conversation) {
          setConversationId(response.conversation.id);
          await fetchMessages(response.conversation.id);
        }
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const response = await messagesService.getMessages(convId);
      if (response.success && response.messages) {
        const formattedMessages = response.messages.map((msg: any) => ({
          id: msg.id,
          text: msg.content,
          isMe: msg.sender_id === user?.id,
          timestamp: new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    // Optimistic update
    const tempMessage = {
      id: String(Date.now()),
      text: messageText,
      isMe: true,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, tempMessage]);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // If no conversation yet, create one first
      let currentConvId = conversationId;

      if (!currentConvId && sellerId) {
        const convResponse = await messagesService.getOrCreateConversation({
          other_user_id: sellerId,
          product_id: productId,
        });

        if (convResponse.success && convResponse.conversation) {
          currentConvId = convResponse.conversation.id;
          setConversationId(currentConvId);
        }
      }

      if (currentConvId) {
        await messagesService.sendMessage(currentConvId, messageText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#5D8A7D" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </Pressable>

        <Pressable
          style={styles.headerContent}
          onPress={() => sellerId && navigation.navigate('SellerProfile', { sellerId })}
        >
          <View style={styles.avatarContainer}>
            <Image source={{ uri: seller.avatar }} style={styles.headerAvatar} contentFit="cover" />
            {seller.online && <View style={styles.onlineIndicator} />}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{seller.name}</Text>
            <Text style={[styles.headerStatus, !seller.online && styles.headerStatusOffline]}>
              {isTyping ? 'Digitando...' : (seller.online ? 'Online agora' : 'Offline')}
            </Text>
          </View>
        </Pressable>

        <Pressable style={styles.moreBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color="#525252" />
        </Pressable>
      </View>

      {/* Connection Status */}
      {!isConnected && (
        <View style={styles.connectionBar}>
          <Ionicons name="cloud-offline-outline" size={16} color="#F59E0B" />
          <Text style={styles.connectionText}>Reconectando...</Text>
        </View>
      )}

      {/* Product Preview */}
      {productId && (
        <View style={styles.productBar}>
          <Image source={{ uri: product.image }} style={styles.productThumb} contentFit="cover" />
          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={1}>{product.title}</Text>
            <Text style={styles.productPrice}>R$ {formatPrice(product.price)}</Text>
          </View>
          <Pressable
            style={styles.viewBtn}
            onPress={() => navigation.navigate('ProductDetail', { productId })}
          >
            <Text style={styles.viewBtnText}>Ver</Text>
          </Pressable>
        </View>
      )}

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyMessages}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={40} color="#5D8A7D" />
            </View>
            <Text style={styles.emptyText}>Inicie a conversa</Text>
            <Text style={styles.emptySubtext}>Envie uma mensagem para o vendedor</Text>
          </View>
        ) : (
          <>
            <View style={styles.dateHeader}>
              <Text style={styles.dateText}>Hoje</Text>
            </View>

            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.isMe ? styles.myMessage : styles.theirMessage,
                ]}
              >
                <Text style={[styles.messageText, message.isMe && styles.myMessageText]}>
                  {message.text}
                </Text>
                <Text style={[styles.messageTime, message.isMe && styles.myMessageTime]}>
                  {message.timestamp}
                </Text>
              </View>
            ))}

            {isTyping && (
              <View style={[styles.messageBubble, styles.theirMessage, styles.typingBubble]}>
                <Text style={styles.typingText}>...</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={styles.attachBtn}>
          <Ionicons name="add-circle-outline" size={24} color="#5D8A7D" />
        </Pressable>

        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Digite uma mensagem..."
            placeholderTextColor="#A3A3A3"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
        </View>

        <Pressable
          style={[styles.sendBtn, inputText.trim() && styles.sendBtnActive]}
          onPress={sendMessage}
          disabled={sending}
        >
          <Ionicons name="send" size={20} color={inputText.trim() ? '#fff' : '#A3A3A3'} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { alignItems: 'center', justifyContent: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }
    ),
  } as any,
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  avatarContainer: { position: 'relative' },
  headerAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#E5E7EB' },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerInfo: { marginLeft: 12, flex: 1 },
  headerName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  headerStatus: { fontSize: 13, color: '#10B981', marginTop: 2 },
  headerStatusOffline: { color: '#EF4444' },
  moreBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  // Connection Bar
  connectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: '#FEF3C7',
  },
  connectionText: { fontSize: 13, color: '#92400E', fontWeight: '500' },

  // Product Bar
  productBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  productThumb: { width: 48, height: 48, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  productInfo: { flex: 1, marginLeft: 12 },
  productTitle: { fontSize: 14, fontWeight: '500', color: '#374151' },
  productPrice: { fontSize: 15, fontWeight: '700', color: '#5D8A7D', marginTop: 3 },
  viewBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#E8F5F0',
    borderRadius: 10,
  },
  viewBtnText: { fontSize: 14, fontWeight: '600', color: '#5D8A7D' },

  // Messages
  messagesContainer: { flex: 1, backgroundColor: '#F8F9FA' },
  messagesContent: { paddingHorizontal: 16, paddingVertical: 20, flexGrow: 1 },
  dateHeader: { alignItems: 'center', marginBottom: 20 },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: '500',
  },

  emptyMessages: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    minHeight: 300,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontSize: 17, fontWeight: '600', color: '#374151', marginTop: 20 },
  emptySubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 6, textAlign: 'center' },

  messageBubble: {
    maxWidth: '75%',
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#5D8A7D',
    borderBottomRightRadius: 6,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 1px 2px rgba(93,138,125,0.2)' }
      : { shadowColor: '#5D8A7D', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 1 }
    ),
  } as any,
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: { fontSize: 15, color: '#374151', lineHeight: 22 },
  myMessageText: { color: '#fff' },
  messageTime: { fontSize: 11, color: '#9CA3AF', marginTop: 6, alignSelf: 'flex-end' },
  myMessageTime: { color: 'rgba(255,255,255,0.75)' },

  // Typing indicator
  typingBubble: { paddingVertical: 10, paddingHorizontal: 18 },
  typingText: { fontSize: 24, color: '#9CA3AF', letterSpacing: 3 },

  // Input
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  attachBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrap: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginHorizontal: 6,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: { fontSize: 15, color: '#111827', minHeight: 24, maxHeight: 80 },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: '#5D8A7D',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 6px rgba(93,138,125,0.3)' }
      : { shadowColor: '#5D8A7D', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 }
    ),
  } as any,
});

export default ChatScreen;
