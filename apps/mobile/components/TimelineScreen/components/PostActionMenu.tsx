import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { type Post } from '@/models/timeline';

type Props = {
  visible: boolean;
  menuPostId: string | null;
  posts: Post[];
  bottomInset: number;
  onClose: () => void;
  onStartEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
};

export function PostActionMenu({
  visible,
  menuPostId,
  posts,
  bottomInset,
  onClose,
  onStartEdit,
  onDelete,
}: Props) {
  if (!visible || menuPostId === null) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.overlayBackdrop} activeOpacity={1} onPress={onClose} />
      <View style={[styles.menuSheet, { paddingBottom: bottomInset }]}>
        <Text style={styles.menuTitle}>投稿の操作</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            const post = posts.find((item) => item.id === menuPostId);
            if (post) onStartEdit(post);
          }}
        >
          <Ionicons name="create-outline" size={20} color={Colors.onSurface} />
          <Text style={styles.menuItemText}>編集する</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuItem, styles.menuItemDanger]}
          onPress={() => onDelete(menuPostId)}
        >
          <Ionicons name="trash-outline" size={20} color="#e05c7b" />
          <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>削除する</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  menuSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    overflow: 'hidden',
  },
  menuTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerLow,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerLow,
  },
  menuItemDanger: {},
  menuItemText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: Colors.onSurface,
  },
  menuItemTextDanger: { color: '#e05c7b' },
});
