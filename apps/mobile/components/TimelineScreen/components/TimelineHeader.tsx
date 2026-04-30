import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  unreadCount: number;
};

export function TimelineHeader({ unreadCount }: Props) {
  return (
    <BlurView intensity={20} tint="light" style={styles.header}>
      <Ionicons name="water" size={22} color={Colors.primary} />
      <Text style={styles.headerTitle}>Pond</Text>
      <View style={styles.spacer} />
      <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notifications')}>
        <Ionicons name="notifications-outline" size={20} color={Colors.onSurfaceVariant} />
        {unreadCount > 0 && <View style={styles.notifDot} />}
      </TouchableOpacity>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 22,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  spacer: { flex: 1 },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 9,
    height: 9,
    borderRadius: Radius.full,
    backgroundColor: '#e05c7b',
    borderWidth: 1.5,
    borderColor: Colors.surfaceContainerLow,
  },
});
