import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SectionList,
  StatusBar,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { BottomNavigation, Tab, EmptyState } from '../components';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const isWeb = Platform.OS === 'web';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;
type TabItem = { id: string; label: string };

interface Notification {
  id: string;
  type: 'message' | 'offer' | 'sale' | 'rating' | 'favorite' | 'delivery' | 'shipped';
  title: string;
  description: string;
  time: string;
  read: boolean;
  icon: string;
}

interface NotificationSection {
  title: string;
  data: Notification[];
}

// Mock data
const MOCK_NOTIFICATIONS: NotificationSection[] = [];

export default function NotificationsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = isWeb && width > 768;
  const isTablet = isWeb && width > 480 && width <= 768;
  const [activeTab, setActiveTab] = useState<string>('all');
  const [notifications, setNotifications] = useState<NotificationSection[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.reduce(
    (acc, section) => acc + section.data.filter((n) => !n.read).length,
    0
  );
  const totalCount = notifications.reduce(
    (acc, section) => acc + section.data.length,
    0
  );

  const filteredNotifications = notifications.map((section) => ({
    ...section,
    data: activeTab === 'unread' ? section.data.filter((n) => !n.read) : section.data,
  })).filter((section) => section.data.length > 0);

  const handleMarkAllRead = () => {
    const updatedNotifications = notifications.map((section) => ({
      ...section,
      data: section.data.map((n) => ({ ...n, read: true })),
    }));
    setNotifications(updatedNotifications);
  };

  const handleNotificationPress = (notification: Notification) => {
    // Navigate to appropriate screen based on notification type
    console.log('Notification pressed:', notification);
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.read && styles.notificationUnread,
        {
          marginHorizontal: isDesktop ? 60 : isTablet ? 40 : SPACING.md,
          padding: isDesktop ? SPACING.lg : SPACING.md,
        }
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.notificationIcon,
        isDesktop && { fontSize: 40 }
      ]}>{item.icon}</Text>
      <View style={styles.notificationContent}>
        <Text
          style={[
            styles.notificationTitle,
            !item.read && styles.notificationTitleUnread,
            isDesktop && { fontSize: TYPOGRAPHY.sizes.lg }
          ]}
        >
          {item.title}
        </Text>
        <Text style={[
          styles.notificationDescription,
          isDesktop && { fontSize: TYPOGRAPHY.sizes.base, lineHeight: 22 }
        ]}>{item.description}</Text>
        <Text style={[
          styles.notificationTime,
          isDesktop && { fontSize: TYPOGRAPHY.sizes.sm }
        ]}>{item.time}</Text>
      </View>
      <Ionicons name="chevron-forward" size={isDesktop ? 24 : 20} color={COLORS.textTertiary} />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: NotificationSection }) => (
    <View style={[
      styles.sectionHeader,
      { paddingHorizontal: isDesktop ? 60 : isTablet ? 40 : SPACING.md }
    ]}>
      <Text style={[
        styles.sectionTitle,
        isDesktop && { fontSize: TYPOGRAPHY.sizes.sm }
      ]}>{section.title}</Text>
    </View>
  );

  const tabs: TabItem[] = [
    { id: 'all', label: `todas (${totalCount})` },
    { id: 'unread', label: `não lidas (${unreadCount})` },
  ];

  const hasNotifications = filteredNotifications.length > 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={[
        styles.header,
        {
          paddingTop: insets.top + SPACING.sm,
          paddingHorizontal: isDesktop ? 60 : isTablet ? 40 : SPACING.md,
        }
      ]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          isDesktop && { fontSize: TYPOGRAPHY.sizes.xl }
        ]}>notificações</Text>
        {hasNotifications ? (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllButton}>
            <Ionicons name="checkmark-done-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <Tab
        items={tabs}
        activeTab={activeTab}
        onTabPress={setActiveTab}
        scrollable={false}
      />

      {hasNotifications ? (
        <SectionList
          sections={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={[
            styles.listContent,
            { maxWidth: isDesktop ? 800 : isTablet ? 600 : '100%' }
          ]}
          stickySectionHeadersEnabled
        />
      ) : (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <EmptyState
            icon="notifications-off-outline"
            title="nenhuma notificação"
            description="você será avisada sobre mensagens, ofertas, vendas e atualizações"
          />
        </ScrollView>
      )}

      <BottomNavigation navigation={navigation} activeRoute="Notifications" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  markAllButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 80,
    alignSelf: 'center',
    width: '100%',
  },
  sectionHeader: {
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.xs,
  },
  notificationUnread: {
    backgroundColor: COLORS.primaryLight,
  },
  notificationIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  notificationTitleUnread: {
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  notificationDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 80,
  },
});
