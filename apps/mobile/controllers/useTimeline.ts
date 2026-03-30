import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { type Post, type Comment, SEED_POSTS } from '@/models/timeline';
import { addNotification } from '@/models/notifications';
import { type PondEntry } from '@/models/new-post';
import { FIELD_LABELS } from '@/models/field';
import { assignPondId } from '@/models/pond-instance';

export function useTimeline() {
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [myPonds, setMyPonds] = useState<PondEntry[]>([]);
  const [myAvatarId, setMyAvatarId] = useState('fishbowl');
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [menuPostId, setMenuPostId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useFocusEffect(useCallback(() => {
    Promise.all([
      AsyncStorage.getItem('pond_user_posts'),
      AsyncStorage.getItem('pond_ponds'),
      AsyncStorage.getItem('pond_avatar'),
    ]).then(([userPostsStored, pondsStored, avatarStored]) => {
      const effectiveAvatarId = avatarStored ?? 'fishbowl';
      const rawUserPosts: Post[] = userPostsStored ? JSON.parse(userPostsStored) : [];
      const userPosts = rawUserPosts.map((p) => ({
        ...p,
        avatarId: p.avatarId || effectiveAvatarId,
        comments: p.comments ?? [],
      }));
      setPosts([...userPosts, ...SEED_POSTS]);

      const rawPonds: Array<{ field: string; level: string; pondId?: string }> = pondsStored
        ? JSON.parse(pondsStored)
        : [];
      // 旧データ (pondId なし) への後方互換
      const ponds: PondEntry[] = rawPonds.map((p) => ({
        ...p,
        pondId: p.pondId ?? assignPondId(p.field, p.level),
      })) as PondEntry[];
      setMyPonds(ponds);

      if (avatarStored) setMyAvatarId(avatarStored);
    });
  }, []));

  const myFields = myPonds.map((p) => p.field);
  const myPondIds = new Set(myPonds.map((p) => p.pondId).filter(Boolean));

  const filters = [
    { id: 'all', label: 'すべて' },
    ...(myPonds.length > 0 ? [{ id: 'my_ponds', label: 'マイ池' }] : []),
    ...myPonds.map((p) => ({ id: p.field, label: FIELD_LABELS[p.field] ?? p.field })),
  ];

  const filtered = (() => {
    if (activeFilter === 'all') {
      // 参加している分野の投稿のみ（未参加なら全表示）
      return myFields.length > 0
        ? posts.filter((p) => myFields.includes(p.field) || p.user === 'あなた')
        : posts;
    }
    if (activeFilter === 'my_ponds') {
      // 同じ池インスタンスの仲間の投稿 + 自分の投稿
      return posts.filter(
        (p) => p.user === 'あなた' || (p.pondId !== undefined && myPondIds.has(p.pondId))
      );
    }
    return posts.filter((p) => p.field === activeFilter);
  })();

  const toggleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const openComments = (postId: string) => {
    setMenuPostId(null);
    setCommentPostId(postId);
  };
  const closeComments = () => setCommentPostId(null);

  const addComment = async (postId: string, content: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      postId,
      user: 'あなた',
      avatarId: myAvatarId,
      content,
      time: 'たった今',
    };
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: [...p.comments, newComment] }
          : p
      )
    );
    // 自分以外の投稿へのコメントは通知
    const targetPost = posts.find((p) => p.id === postId);
    if (targetPost && targetPost.user !== 'あなた') {
      await addNotification({
        type: 'comment',
        fromUser: 'あなた',
        fromAvatarId: myAvatarId,
        text: `${targetPost.user}の投稿にコメントしました`,
      });
    }
  };

  const openMenu = (postId: string) => setMenuPostId(postId);
  const closeMenu = () => setMenuPostId(null);

  const deletePost = async (postId: string) => {
    setMenuPostId(null);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    const stored = await AsyncStorage.getItem('pond_user_posts');
    const existing: Post[] = stored ? JSON.parse(stored) : [];
    await AsyncStorage.setItem(
      'pond_user_posts',
      JSON.stringify(existing.filter((p) => p.id !== postId))
    );
  };

  const startEdit = (post: Post) => {
    setMenuPostId(null);
    setEditingPost(post);
  };

  const saveEdit = async (postId: string, newContent: string) => {
    setEditingPost(null);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, content: newContent } : p))
    );
    const stored = await AsyncStorage.getItem('pond_user_posts');
    const existing: Post[] = stored ? JSON.parse(stored) : [];
    await AsyncStorage.setItem(
      'pond_user_posts',
      JSON.stringify(
        existing.map((p) => (p.id === postId ? { ...p, content: newContent } : p))
      )
    );
  };

  const cancelEdit = () => setEditingPost(null);

  const selectedPost = posts.find((p) => p.id === commentPostId) ?? null;

  const handleNewPost = () => router.push('/new-post');

  return {
    filters,
    filtered,
    activeFilter,
    setActiveFilter,
    toggleLike,
    handleNewPost,
    myAvatarId,
    openComments,
    closeComments,
    commentPostId,
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
  };
}
