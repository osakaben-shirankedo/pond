import { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useTimeline } from '@/controllers/useTimeline';
import { useNotifications } from '@/controllers/useNotifications';
import { type Post } from '@/models/timeline';
import { TimelineHeader } from './components/TimelineHeader';
import { FilterChips } from './components/FilterChips';
import { TimelinePostCard } from './components/TimelinePostCard';
import { PostActionMenu } from './components/PostActionMenu';
import { EditPostSheet } from './components/EditPostSheet';
import { CommentModal } from './components/CommentModal';

const { width } = Dimensions.get('window');

export function TimelineScreen() {
  const {
    filters,
    filtered,
    activeFilter,
    setActiveFilter,
    toggleLike,
    handleNewPost,
    myAvatarId,
    openComments,
    closeComments,
    selectedPost,
    addComment,
    menuPostId,
    openMenu,
    closeMenu,
    deletePost,
    editingPost,
    startEdit,
    saveEdit,
    cancelEdit,
  } = useTimeline();

  const { unreadCount } = useNotifications();
  const [editText, setEditText] = useState('');
  const tabBarHeight = useBottomTabBarHeight();

  const handleStartEdit = (post: Post) => {
    setEditText(post.content);
    startEdit(post);
  };

  const handleSaveEdit = () => {
    if (!editingPost) return;
    saveEdit(editingPost.id, editText.trim());
  };

  return (
    <View style={styles.container}>
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      <TimelineHeader unreadCount={unreadCount} />

      <FilterChips filters={filters} activeFilter={activeFilter} onSelect={setActiveFilter} />

      <ScrollView
        style={styles.feed}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((post) => (
          <TimelinePostCard
            key={post.id}
            post={post}
            onToggleLike={toggleLike}
            onOpenComments={openComments}
            onOpenMenu={openMenu}
          />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity onPress={handleNewPost} style={styles.fab} activeOpacity={0.85}>
        <LinearGradient colors={[Colors.primary, Colors.primaryContainer]} style={styles.fabGradient}>
          <Ionicons name="pencil" size={22} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      <CommentModal
        post={selectedPost}
        myAvatarId={myAvatarId}
        onClose={closeComments}
        onAddComment={addComment}
        tabBarHeight={tabBarHeight}
      />

      <PostActionMenu
        visible={menuPostId !== null}
        menuPostId={menuPostId}
        posts={filtered}
        bottomInset={tabBarHeight}
        onClose={closeMenu}
        onStartEdit={handleStartEdit}
        onDelete={deletePost}
      />

      <EditPostSheet
        visible={editingPost !== null}
        value={editText}
        bottomInset={tabBarHeight}
        onChangeText={setEditText}
        onCancel={cancelEdit}
        onSave={handleSaveEdit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  blob: { position: 'absolute', borderRadius: Radius.full, opacity: 0.35 },
  blob1: {
    top: -50,
    left: -40,
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: Colors.primaryFixed,
  },
  blob2: {
    top: 200,
    right: -60,
    width: width * 0.45,
    height: width * 0.45,
    backgroundColor: Colors.secondaryFixed,
  },
  feed: { flex: 1 },
  feedContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, gap: Spacing.md },
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
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
