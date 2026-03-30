import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AvatarSprite } from '@/components/avatar-sprite';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { Post, Comment } from '@/models/timeline';

type Props = {
  post: Post | null;
  myAvatarId: string;
  onClose: () => void;
  onAddComment: (postId: string, content: string) => void;
  tabBarHeight?: number;
};

export function CommentModal({ post, myAvatarId, onClose, onAddComment, tabBarHeight = 0 }: Props) {
  const [text, setText] = useState('');
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setLocalComments(post?.comments ?? []);
    setText('');
  }, [post?.id]);

  const handleSend = () => {
    if (!post || text.trim().length === 0) return;
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      postId: post.id,
      user: 'あなた',
      avatarId: myAvatarId,
      content: text.trim(),
      time: 'たった今',
    };
    setLocalComments((prev) => [...prev, newComment]);
    onAddComment(post.id, text.trim());
    setText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  if (!post) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheet}
      >
        {/* ヘッダー */}
        <BlurView intensity={30} tint="light" style={styles.header}>
          <View style={styles.handle} />
          <Text style={styles.headerTitle}>コメント</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        </BlurView>

        {/* 元投稿 */}
        <View style={styles.originalPost}>
          <Text style={styles.originalUser}>{post.user}</Text>
          <Text style={styles.originalContent} numberOfLines={2}>{post.content}</Text>
        </View>

        {/* コメント一覧 */}
        <ScrollView
          ref={scrollRef}
          style={styles.commentList}
          contentContainerStyle={styles.commentListContent}
          showsVerticalScrollIndicator={false}
        >
          {localComments.length === 0 && (
            <Text style={styles.emptyText}>まだコメントはありません</Text>
          )}
          {localComments.map((c) => (
            <View key={c.id} style={styles.commentItem}>
              <View style={styles.commentAvatar}>
                <AvatarSprite presetId={c.avatarId} size={36} />
              </View>
              <View style={styles.commentBody}>
                <View style={styles.commentMeta}>
                  <Text style={styles.commentUser}>{c.user}</Text>
                  <Text style={styles.commentTime}>{c.time}</Text>
                </View>
                <Text style={styles.commentContent}>{c.content}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* 入力エリア */}
        <View style={[styles.inputRow, { paddingBottom: Spacing.md + tabBarHeight }]}>
          <AvatarSprite presetId={myAvatarId} size={36} />
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="コメントを追加..."
            placeholderTextColor={Colors.onSurfaceVariant}
            multiline
            maxLength={200}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={text.trim().length === 0}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={text.trim().length > 0
                ? [Colors.primary, Colors.primaryContainer]
                : [Colors.surfaceContainerLow, Colors.surfaceContainerLow]}
              style={styles.sendBtn}
            >
              <Ionicons name="send" size={18} color={text.trim().length > 0 ? '#fff' : Colors.onSurfaceVariant} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    minHeight: 400,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    overflow: 'hidden',
  },
  handle: {
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.outlineVariant,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: Colors.onSurface,
    marginTop: Spacing.sm,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  originalPost: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerLow,
  },
  originalUser: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    color: Colors.primary,
    marginBottom: 2,
  },
  originalContent: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerLow,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.onSurface,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
