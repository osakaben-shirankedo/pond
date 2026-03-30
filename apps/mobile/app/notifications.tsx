import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { AvatarSprite } from '@/components/avatar-sprite';
import { useNotifications } from '@/controllers/useNotifications';
import { type NotificationType } from '@/models/notifications';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');

const NOTIF_ICON: Record<NotificationType, { name: string; color: string }> = {
  like: { name: 'heart', color: '#e05c7b' },
  comment: { name: 'chatbubble', color: Colors.primary },
  challenge_join: { name: 'people', color: Colors.secondary },
  challenge_pass: { name: 'trophy', color: '#F4A500' },
};

export default function NotificationsScreen() {
  const { notifications, markAllRead } = useNotifications();

  useEffect(() => {
    markAllRead();
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.blob, styles.blob1]} />

      <BlurView intensity={20} tint="light" style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>通知</Text>
        <View style={{ width: 36 }} />
      </BlurView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={Colors.outlineVariant} />
            <Text style={styles.emptyText}>通知はありません</Text>
          </View>
        ) : (
          notifications.map((n) => {
            const icon = NOTIF_ICON[n.type];
            return (
              <View key={n.id} style={[styles.item, !n.read && styles.itemUnread]}>
                <View style={styles.avatarWrap}>
                  <AvatarSprite presetId={n.fromAvatarId} size={44} />
                  <View style={[styles.typeIcon, { backgroundColor: icon.color }]}>
                    <Ionicons name={icon.name as any} size={10} color="#fff" />
                  </View>
                </View>
                <View style={styles.itemBody}>
                  <Text style={styles.itemUser}>{n.fromUser}</Text>
                  <Text style={styles.itemText}>{n.text}</Text>
                  <Text style={styles.itemTime}>{n.time}</Text>
                </View>
                {!n.read && <View style={styles.unreadDot} />}
              </View>
            );
          })
        )}
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  blob: { position: 'absolute', borderRadius: Radius.full, opacity: 0.3 },
  blob1: { top: -40, right: -40, width: width * 0.5, height: width * 0.5, backgroundColor: Colors.primaryFixed },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: Colors.onSurface },
  content: { padding: Spacing.lg, gap: Spacing.xs },
  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.md },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.onSurfaceVariant },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.md,
  },
  itemUnread: { backgroundColor: `${Colors.primaryFixed}cc` },
  avatarWrap: { position: 'relative' },
  typeIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  itemBody: { flex: 1, gap: 2 },
  itemUser: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.onSurface },
  itemText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant },
  itemTime: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.outlineVariant },
  unreadDot: { width: 8, height: 8, borderRadius: Radius.full, backgroundColor: '#e05c7b' },
});
