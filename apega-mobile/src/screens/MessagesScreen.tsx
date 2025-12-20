import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import BottomNavigation from '../components/BottomNavigation';
import Header from '../components/Header';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isDesktop = isWeb && width > 768;

interface MessagesScreenProps {
  navigation: any;
}

interface Conversation {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isMine: boolean;
  type?: 'text' | 'system' | 'offer';
  offer?: {
    amount: number;
    status: 'pending' | 'accepted' | 'rejected';
  };
}

const MOCK_CONVERSATIONS: Conversation[] = [];

const MOCK_MESSAGES: Message[] = [];

export default function MessagesScreen({ navigation }: MessagesScreenProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleConversationPress = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log('Send message:', messageText);
      setMessageText('');
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        item.unread && styles.conversationUnread,
      ]}
      onPress={() => handleConversationPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Ionicons name="person" size={24} color={COLORS.textTertiary} />
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text
            style={[
              styles.conversationName,
              item.unread && styles.conversationNameUnread,
            ]}
          >
            {item.user.name}
          </Text>
          <Text style={styles.conversationTime}>{item.timestamp}</Text>
        </View>
        <Text
          style={[
            styles.conversationMessage,
            item.unread && styles.conversationMessageUnread,
          ]}
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
      </View>

      {item.unread && <View style={styles.unreadIndicator} />}
      <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
    </TouchableOpacity>
  );

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.type === 'system') {
      return (
        <View style={styles.systemMessageContainer}>
          <View style={styles.systemMessage}>
            <Text style={styles.systemMessageText}>{item.text}</Text>
            <Text style={styles.messageTime}>{item.timestamp}</Text>
          </View>
        </View>
      );
    }

    if (item.type === 'offer' && item.offer) {
      return (
        <View style={[styles.messageContainer, !item.isMine && styles.messageContainerOther]}>
          <View style={[styles.messageBubble, !item.isMine && styles.messageBubbleOther]}>
            <Text style={[styles.messageText, !item.isMine && styles.messageTextOther]}>
              {item.text}
            </Text>
            <Text style={[styles.messageTime, !item.isMine && styles.messageTimeOther]}>
              {item.timestamp}
            </Text>

            <View style={styles.offerCard}>
              <Text style={styles.offerIcon}>💰</Text>
              <Text style={styles.offerLabel}>oferta recebida</Text>
              <Text style={styles.offerAmount}>R$ {(item.offer?.amount || 0).toFixed(2)}</Text>
              {item.offer.status === 'pending' && (
                <View style={styles.offerActions}>
                  <TouchableOpacity style={styles.offerReject}>
                    <Text style={styles.offerRejectText}>recusar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.offerAccept}>
                    <Text style={styles.offerAcceptText}>aceitar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.messageContainer, !item.isMine && styles.messageContainerOther]}>
        <View style={[styles.messageBubble, !item.isMine && styles.messageBubbleOther]}>
          <Text style={[styles.messageText, !item.isMine && styles.messageTextOther]}>
            {item.text}
          </Text>
          <Text style={[styles.messageTime, !item.isMine && styles.messageTimeOther]}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  // Conversation List View
  if (!selectedConversation) {
    return (
      <View style={styles.container}>
        <Header
          navigation={navigation}
          title="mensagens"
          variant="simple"
          showBack
        />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="buscar mensagens"
            placeholderTextColor={COLORS.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Conversations List */}
        <FlatList
          data={MOCK_CONVERSATIONS}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.conversationsList}
        />

        <BottomNavigation navigation={navigation} activeRoute="Profile" />
      </View>
    );
  }

  // Individual Conversation View
  const conversation = MOCK_CONVERSATIONS.find(c => c.id === selectedConversation);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Chat Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.chatHeaderUser}>
          <View style={styles.avatarSmall}>
            <Ionicons name="person" size={20} color={COLORS.textTertiary} />
          </View>
          <View>
            <Text style={styles.chatHeaderName}>{conversation?.user.name}</Text>
            <Text style={styles.chatHeaderStatus}>online agora</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Product Context Card */}
      <View style={styles.contextCard}>
        <Text style={styles.contextLabel}>sobre este produto:</Text>
        <View style={styles.contextProduct}>
          <View style={styles.contextImage}>
            <Ionicons name="image" size={24} color={COLORS.textTertiary} />
          </View>
          <View style={styles.contextInfo}>
            <Text style={styles.contextProductName}>Vestido floral midi</Text>
            <Text style={styles.contextProductPrice}>R$ 65,00</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.contextLink}>ver</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        data={MOCK_MESSAGES}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        inverted={false}
      />

      {/* Typing Indicator */}
      {isTyping && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>digitando...</Text>
        </View>
      )}

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="camera" size={24} color={COLORS.textTertiary} />
        </TouchableOpacity>
        <View style={styles.messageInput}>
          <TextInput
            style={styles.messageInputField}
            placeholder="digite sua mensagem..."
            placeholderTextColor={COLORS.textTertiary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <Ionicons
            name="arrow-up"
            size={24}
            color={messageText.trim() ? COLORS.white : COLORS.textTertiary}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    marginHorizontal: isDesktop ? 60 : SPACING.md,
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    height: 44,
    borderRadius: BORDER_RADIUS.lg,
    maxWidth: isDesktop ? 600 : '100%',
    alignSelf: isDesktop ? 'center' : undefined,
    width: isDesktop ? '100%' : undefined,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textPrimary,
  },
  conversationsList: {
    paddingBottom: 80,
    maxWidth: isDesktop ? 600 : '100%',
    alignSelf: isDesktop ? 'center' : undefined,
    width: isDesktop ? '100%' : undefined,
    paddingHorizontal: isDesktop ? 60 : 0,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: isDesktop ? 0 : SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.xs,
  },
  conversationUnread: {
    backgroundColor: COLORS.primaryLight,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textPrimary,
  },
  conversationNameUnread: {
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  conversationTime: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
  },
  conversationMessage: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  conversationMessageUnread: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: SPACING.sm,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  chatHeaderUser: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  chatHeaderName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  chatHeaderStatus: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.success,
  },
  contextCard: {
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  contextLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  contextProduct: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contextImage: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  contextInfo: {
    flex: 1,
  },
  contextProductName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  contextProductPrice: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  contextLink: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
  },
  messagesList: {
    padding: SPACING.md,
  },
  messageContainer: {
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
  },
  messageContainerOther: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: COLORS.gray[100],
    borderBottomRightRadius: BORDER_RADIUS.lg,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.white,
    marginBottom: 4,
  },
  messageTextOther: {
    color: COLORS.textPrimary,
  },
  messageTime: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    alignSelf: 'flex-end',
  },
  messageTimeOther: {
    color: COLORS.textTertiary,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  systemMessage: {
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    maxWidth: '80%',
    alignItems: 'center',
  },
  systemMessageText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  offerCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  offerIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  offerLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  offerAmount: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  offerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
  },
  offerReject: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  offerRejectText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.white,
  },
  offerAccept: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  offerAcceptText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
  },
  typingContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  typingText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  attachButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageInput: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    maxHeight: 100,
    marginHorizontal: SPACING.sm,
  },
  messageInputField: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray[200],
  },
});
