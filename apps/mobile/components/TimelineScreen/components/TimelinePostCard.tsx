import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { LikeButton } from '@/components/like-button';
import { AvatarSprite } from '@/components/avatar-sprite';
import { LEVEL_COLORS, type Post } from '@/models/timeline';

type Props = {
  post: Post;
  onToggleLike: (postId: string) => void;
  onOpenComments: (postId: string) => void;
  onOpenMenu: (postId: string) => void;
};

export function TimelinePostCard({ post, onToggleLike, onOpenComments, onOpenMenu }: Props) {
  const profileParams = {
    pathname: '/user-profile' as const,
    params: { userName: post.user, avatarId: post.avatarId ?? 'fishbowl' },
  };

  return (
    <View style={styles.card}>
      <View style={styles.postHeader}>
        <TouchableOpacity
          activeOpacity={0.75}
          disabled={post.user === 'あなた'}
          onPress={() => router.push(profileParams)}
        >
          {post.avatarId ? (
            <AvatarSprite presetId={post.avatarId} size={44} />
          ) : (
            <LinearGradient
              colors={[Colors.primaryFixed, Colors.surfaceContainerHigh]}
              style={styles.avatarContainer}
            >
              <Text style={styles.avatar}>{post.avatar}</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <TouchableOpacity
            activeOpacity={0.75}
            disabled={post.user === 'あなた'}
            onPress={() => router.push(profileParams)}
          >
            <Text style={styles.userName}>{post.user}</Text>
          </TouchableOpacity>
          <View style={styles.badges}>
            <View
              style={[
                styles.levelBadge,
                { backgroundColor: LEVEL_COLORS[post.level] ?? Colors.primaryFixed },
              ]}
            >
              <Text style={styles.levelBadgeText}>{post.level}</Text>
            </View>
            <Text style={styles.pondBadgeText}>{post.pond}</Text>
          </View>
        </View>
        <Text style={styles.postTime}>{post.time}</Text>

        {post.user === 'あなた' && (
          <TouchableOpacity style={styles.menuBtn} onPress={() => onOpenMenu(post.id)} hitSlop={8}>
            <Ionicons name="ellipsis-vertical" size={18} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.postContent}>{post.content}</Text>
      <View style={styles.actions}>
        <LikeButton liked={post.liked} count={post.likes} onPress={() => onToggleLike(post.id)} />
        <TouchableOpacity
          style={styles.commentBtn}
          onPress={() => onOpenComments(post.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={20} color={Colors.onSurfaceVariant} />
          {post.comments.length > 0 && <Text style={styles.commentCount}>{post.comments.length}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  userInfo: { flex: 1, gap: 4 },
  userName: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: Colors.onSurface,
  },
  badges: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  levelBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
  levelBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: Colors.primary },
  pondBadgeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  postTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.outlineVariant,
  },
  menuBtn: { padding: 4 },
  postContent: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.onSurface,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  commentBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 },
  commentCount: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
});
