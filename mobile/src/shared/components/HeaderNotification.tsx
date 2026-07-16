import React, { useState, useEffect, useRef } from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  Platform,
  Modal,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';
import { colors, spacing } from '../theme';
import { MOCK_NOTIFICATIONS } from '../mock/notifications';

const HEADER_BAR_HEIGHT = 56;

type Props = { onPress?: () => void; count?: number };

const initialReadIds = () =>
  new Set(MOCK_NOTIFICATIONS.filter((n) => n.read).map((n) => n.id));

export default function HeaderNotification({ onPress, count: countProp = 0 }: Props) {
  const [showList, setShowList] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(initialReadIds);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const slideAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const topOffset = insets.top + HEADER_BAR_HEIGHT;

  const displayedNotifications = MOCK_NOTIFICATIONS.filter((n) => !dismissedIds.has(n.id));
  const unreadCount = displayedNotifications.filter((n) => !readIds.has(n.id)).length;
  const showBadge = unreadCount > 0;
  const count = showBadge ? unreadCount : countProp;

  const markAllAsRead = () => {
    const allIds = new Set(MOCK_NOTIFICATIONS.map((n) => n.id));
    setReadIds(allIds);
    setDismissedIds(allIds);
  };

  const isRead = (id: string) => readIds.has(id);

  const handleOpen = () => {
    if (onPress) onPress();
    else setShowList(true);
  };

  useEffect(() => {
    if (showList) {
      slideAnim.setValue(0);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 20,
      }).start();
    }
  }, [showList, slideAnim]);

  const close = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => setShowList(false));
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 0],
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <>
      <Pressable
        onPress={handleOpen}
        style={({ pressed }) => [styles.container, pressed && styles.pressed]}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <View style={styles.iconBox}>
          <Bell size={24} color={colors.text} strokeWidth={2} />
          {showBadge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText} allowFontScaling={false}>
                {count > 99 ? '99+' : count}
              </Text>
            </View>
          )}
        </View>
      </Pressable>

      <Modal
        visible={showList}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable style={styles.modalOverlay} onPress={close}>
          <Animated.View
            style={[
              styles.submenuAnchor,
              {
                top: topOffset,
                right: spacing.md,
                height: '72%',
                maxHeight: 420,
                opacity,
                transform: [{ translateY }],
              },
            ]}
            pointerEvents="box-none"
          >
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Notificações</Text>
                <View style={styles.headerActions}>
                  {displayedNotifications.some((n) => !readIds.has(n.id)) && (
                    <TouchableOpacity
                      onPress={markAllAsRead}
                      hitSlop={8}
                      style={styles.markReadBtn}
                    >
                      <Text style={styles.markReadBtnText}>Marcar como lidas</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={close}
                    hitSlop={12}
                    style={styles.closeBtn}
                  >
                    <Text style={styles.closeBtnText}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
                bounces={true}
                nestedScrollEnabled={true}
              >
                {displayedNotifications.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhuma notificação.</Text>
                ) : (
                  displayedNotifications.map((item) => (
                    <View
                      key={item.id}
                      style={[styles.notifRow, !isRead(item.id) && styles.notifRowUnread]}
                    >
                      <Text style={styles.notifTitle}>{item.title}</Text>
                      <Text style={styles.notifMessage}>{item.message}</Text>
                      <Text style={styles.notifTime}>{item.time}</Text>
                    </View>
                  ))
                )}
              </ScrollView>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.6,
  },
  iconBox: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: '700',
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  submenuAnchor: {
    position: 'absolute',
    width: '100%',
    maxWidth: 340,
  },
  modalCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  markReadBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  markReadBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  closeBtn: {
    padding: spacing.sm,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  notifRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  notifRowUnread: {
    backgroundColor: colors.primary + '08',
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  notifMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.xl,
  },
});
