import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { LikeButton } from '@/components/like-button';
import { useTimeline } from '@/controllers/useTimeline';
import { LEVEL_COLORS } from '@/models/timeline';

const { width } = Dimensions.get('window');

export default function TimelineScreen() {
  const { filters, filtered, activeFilter, setActiveFilter, toggleLike, handleNewPost } = useTimeline();

  return (
    <View style={styles.container}>
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      {/* Header */}
      <BlurView intensity={20} tint="light" style={styles.header}>
        <Ionicons name="water" size={22} color={Colors.primary} />
        <Text style={styles.headerTitle}>Pond</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={20} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
      </BlurView>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setActiveFilter(f.id)}
            style={[styles.chip, activeFilter === f.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, activeFilter === f.id && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Timeline */}
      <ScrollView
        style={styles.feed}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((post) => (
          <View key={post.id} style={styles.card}>
            <View style={styles.postHeader}>
              <LinearGradient
                colors={[Colors.primaryFixed, Colors.surfaceContainerHigh]}
                style={styles.avatarContainer}
              >
                <Text style={styles.avatar}>{post.avatar}</Text>
              </LinearGradient>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{post.user}</Text>
                <View style={styles.badges}>
                  <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[post.level] ?? Colors.primaryFixed }]}>
                    <Text style={styles.levelBadgeText}>{post.level}</Text>
                  </View>
                  <Text style={styles.pondBadgeText}>{post.pond}</Text>
                </View>
              </View>
              <Text style={styles.postTime}>{post.time}</Text>
            </View>
            <Text style={styles.postContent}>{post.content}</Text>
            <View style={styles.actions}>
              <LikeButton
                liked={post.liked}
                count={post.likes}
                onPress={() => toggleLike(post.id)}
              />
              <TouchableOpacity style={styles.commentBtn}>
                <Ionicons name="chatbubble-outline" size={20} color={Colors.onSurfaceVariant} style={{ opacity: 0.5 }} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity onPress={handleNewPost} style={styles.fab} activeOpacity={0.85}>
        <LinearGradient colors={[Colors.primary, Colors.primaryContainer]} style={styles.fabGradient}>
          <Ionicons name="pencil" size={22} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  blob: { position: 'absolute', borderRadius: Radius.full, opacity: 0.35 },
  blob1: { top: -50, left: -40, width: width * 0.6, height: width * 0.6, backgroundColor: Colors.primaryFixed },
  blob2: { top: 200, right: -60, width: width * 0.45, height: width * 0.45, backgroundColor: Colors.secondaryFixed },
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
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: { flexGrow: 0, paddingVertical: Spacing.sm },
  filterContent: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLow,
  },
  chipActive: { backgroundColor: Colors.primaryFixed },
  chipText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Colors.onSurfaceVariant },
  chipTextActive: { color: Colors.primary, fontFamily: 'Inter_600SemiBold' },
  feed: { flex: 1 },
  feedContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, gap: Spacing.md },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: Spacing.sm },
  avatarContainer: { width: 44, height: 44, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  avatar: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  userInfo: { flex: 1, gap: 4 },
  userName: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: Colors.onSurface },
  badges: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  levelBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
  levelBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: Colors.primary },
  pondBadgeText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.onSurfaceVariant },
  postTime: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.outlineVariant },
  postContent: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurface, lineHeight: 22, marginBottom: Spacing.md },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  commentBtn: { padding: 4 },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    bottom: 100,
    borderRadius: Radius.full,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },
  fabGradient: { width: 56, height: 56, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
});
