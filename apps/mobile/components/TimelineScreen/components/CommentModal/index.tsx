import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { Post, Comment } from '@/models/timeline';
import { CommentList } from './CommentList';
import { CommentComposer } from './CommentComposer';

type Props = {
  post: Post | null;
  myAvatarId: string;
  onClose: () => void;
  onAddComment: (postId: string, content: string) => void;
  tabBarHeight?: number;
};

export function CommentModal({
  post,
  myAvatarId,
  onClose,
  onAddComment,
  tabBarHeight = 0,
}: Props) {
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
        <BlurView intensity={30} tint="light" style={styles.header}>
          <View style={styles.handle} />
          <Text style={styles.headerTitle}>コメント</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        </BlurView>

        <View style={styles.originalPost}>
          <Text style={styles.originalUser}>{post.user}</Text>
          <Text style={styles.originalContent} numberOfLines={2}>
            {post.content}
          </Text>
        </View>

        <CommentList comments={localComments} scrollRef={scrollRef} />

        <CommentComposer
          value={text}
          myAvatarId={myAvatarId}
          tabBarHeight={tabBarHeight}
          onChangeText={setText}
          onSend={handleSend}
        />
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
});
