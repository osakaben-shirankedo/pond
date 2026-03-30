import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { AvatarSprite } from '@/components/avatar-sprite';

const { width } = Dimensions.get('window');

export default function UserProfileScreen() {
  const { userName, avatarId } = useLocalSearchParams<{ userName: string; avatarId: string }>();

  return (
    <View style={styles.container}>
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      <BlurView intensity={20} tint="light" style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>プロフィール</Text>
        <View style={{ width: 36 }} />
      </BlurView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={[Colors.primaryFixed, Colors.surfaceContainerHigh]}
            style={styles.avatarLarge}
          >
            <AvatarSprite presetId={avatarId ?? 'fishbowl'} size={56} />
          </LinearGradient>
          <Text style={styles.displayName}>{userName ?? '名無しさん'}</Text>
          <Text style={styles.handle}>@pond_member</Text>
          <Text style={styles.bio}>一緒に学習中のメンバーです</Text>
        </View>

        <BlurView intensity={20} tint="light" style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>ポイント</Text>
          </View>
          <View style={[styles.statItem, styles.statItemBorder]}>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>チャレンジ</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>連続日数</Text>
          </View>
        </BlurView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  blob: { position: 'absolute', borderRadius: Radius.full, opacity: 0.3 },
  blob1: { top: -40, left: -40, width: width * 0.5, height: width * 0.5, backgroundColor: Colors.primaryFixed },
  blob2: { bottom: 200, right: -50, width: width * 0.45, height: width * 0.45, backgroundColor: Colors.secondaryFixed },
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
  content: { padding: Spacing.lg, gap: Spacing.xl, paddingTop: Spacing.xl },
  profileHeader: { alignItems: 'center', gap: Spacing.sm },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayName: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: Colors.onSurface },
  handle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant },
  bio: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant, textAlign: 'center' },
  statsCard: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    flexDirection: 'row',
    paddingVertical: Spacing.lg,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statItemBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  statValue: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22, color: Colors.primary },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.onSurfaceVariant },
});
