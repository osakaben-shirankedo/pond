import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AvatarSprite } from '@/components/avatar-sprite';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { Comment } from '@/models/timeline';

type Props = {
  comments: Comment[];
  scrollRef: React.RefObject<ScrollView | null>;
};

export function CommentList({ comments, scrollRef }: Props) {
  return (
    <ScrollView
      ref={scrollRef}
      style={styles.commentList}
      contentContainerStyle={styles.commentListContent}
      showsVerticalScrollIndicator={false}
    >
      {comments.length === 0 && <Text style={styles.emptyText}>まだコメントはありません</Text>}
      {comments.map((comment) => (
        <View key={comment.id} style={styles.commentItem}>
          <View style={styles.commentAvatar}>
            <AvatarSprite presetId={comment.avatarId} size={36} />
          </View>
          <View style={styles.commentBody}>
            <View style={styles.commentMeta}>
              <Text style={styles.commentUser}>{comment.user}</Text>
              <Text style={styles.commentTime}>{comment.time}</Text>
            </View>
            <Text style={styles.commentContent}>{comment.content}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  commentList: {
    flex: 1,
    minHeight: 100,
  },
  commentListContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    paddingVertical: Spacing.xl,
  },
  commentItem: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  commentAvatar: {
    flexShrink: 0,
  },
  commentBody: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  commentUser: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: Colors.onSurface,
  },
  commentTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.outlineVariant,
  },
  commentContent: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.onSurface,
    lineHeight: 20,
  },
});
