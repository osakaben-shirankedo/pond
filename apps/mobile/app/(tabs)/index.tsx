import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { LikeButton } from '@/components/like-button';
import { AvatarSprite } from '@/components/avatar-sprite';
import { CommentModal } from '@/components/CommentModal';
import { useTimeline } from '@/controllers/useTimeline';
import { useNotifications } from '@/controllers/useNotifications';
import { LEVEL_COLORS, type Post } from '@/models/timeline';

const { width } = Dimensions.get('window');

export default function TimelineScreen() {
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

  // 編集開始時にテキストをセット
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

      {/* Header */}
      <BlurView intensity={20} tint="light" style={styles.header}>
        <Ionicons name="water" size={22} color={Colors.primary} />
        <Text style={styles.headerTitle}>Pond</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={20} color={Colors.onSurfaceVariant} />
          {unreadCount > 0 && <View style={styles.notifDot} />}
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
              <TouchableOpacity
                activeOpacity={0.75}
                disabled={post.user === 'あなた'}
                onPress={() => router.push({ pathname: '/user-profile', params: { userName: post.user, avatarId: post.avatarId ?? 'fishbowl' } })}
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
                  onPress={() => router.push({ pathname: '/user-profile', params: { userName: post.user, avatarId: post.avatarId ?? 'fishbowl' } })}
                >
                  <Text style={styles.userName}>{post.user}</Text>
                </TouchableOpacity>
                <View style={styles.badges}>
                  <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[post.level] ?? Colors.primaryFixed }]}>
                    <Text style={styles.levelBadgeText}>{post.level}</Text>
                  </View>
                  <Text style={styles.pondBadgeText}>{post.pond}</Text>
                </View>
              </View>
              <Text style={styles.postTime}>{post.time}</Text>

              {/* 自分の投稿のみ三本線メニュー */}
              {post.user === 'あなた' && (
                <TouchableOpacity
                  style={styles.menuBtn}
                  onPress={() => openMenu(post.id)}
                  hitSlop={8}
                >
                  <Ionicons name="ellipsis-vertical" size={18} color={Colors.onSurfaceVariant} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.postContent}>{post.content}</Text>
            <View style={styles.actions}>
              <LikeButton
                liked={post.liked}
                count={post.likes}
                onPress={() => toggleLike(post.id)}
              />
              <TouchableOpacity
                style={styles.commentBtn}
                onPress={() => openComments(post.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="chatbubble-outline" size={20} color={Colors.onSurfaceVariant} />
                {post.comments.length > 0 && (
                  <Text style={styles.commentCount}>{post.comments.length}</Text>
                )}
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

      {/* コメントモーダル */}
      <CommentModal
        post={selectedPost}
        myAvatarId={myAvatarId}
        onClose={closeComments}
        onAddComment={addComment}
        tabBarHeight={tabBarHeight}
      />

      {/* 三本線メニュー */}
      {menuPostId !== null && (
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayBackdrop} activeOpacity={1} onPress={closeMenu} />
          <View style={[styles.menuSheet, { paddingBottom: tabBarHeight }]}>
            <Text style={styles.menuTitle}>投稿の操作</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                const post = filtered.find((p) => p.id === menuPostId);
                if (post) handleStartEdit(post);
              }}
            >
              <Ionicons name="create-outline" size={20} color={Colors.onSurface} />
              <Text style={styles.menuItemText}>編集する</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemDanger]}
              onPress={() => deletePost(menuPostId)}
            >
              <Ionicons name="trash-outline" size={20} color="#e05c7b" />
              <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>削除する</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 編集モーダル */}
      {editingPost !== null && (
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayBackdrop} activeOpacity={1} onPress={cancelEdit} />
          <View style={[styles.editSheet, { paddingBottom: tabBarHeight }]}>
            <View style={styles.editHeader}>
              <TouchableOpacity onPress={cancelEdit}>
                <Text style={styles.editCancel}>キャンセル</Text>
              </TouchableOpacity>
              <Text style={styles.editTitle}>投稿を編集</Text>
              <TouchableOpacity onPress={handleSaveEdit} disabled={editText.trim().length === 0}>
                <Text style={[styles.editSave, editText.trim().length === 0 && styles.editSaveDisabled]}>
                  保存
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.editInput}
              value={editText}
              onChangeText={setEditText}
              multiline
              autoFocus
              maxLength={300}
              placeholderTextColor={Colors.onSurfaceVariant}
            />
            <Text style={styles.editCharCount}>{300 - editText.length}</Text>
          </View>
        </View>
      )}
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
  menuBtn: { padding: 4 },
  postContent: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurface, lineHeight: 22, marginBottom: Spacing.md },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  commentBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 },
  commentCount: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Colors.onSurfaceVariant },
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

  // オーバーレイ共通
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  // 三本線メニュー
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

  // 編集モーダル
  editSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '70%',
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerLow,
  },
  editTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: Colors.onSurface,
  },
  editCancel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Colors.onSurfaceVariant,
  },
  editSave: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 15,
    color: Colors.primary,
  },
  editSaveDisabled: { opacity: 0.4 },
  editInput: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.onSurface,
    lineHeight: 24,
    padding: Spacing.lg,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  editCharCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    textAlign: 'right',
    paddingRight: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
});
