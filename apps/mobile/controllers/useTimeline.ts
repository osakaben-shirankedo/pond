import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { type Post, type Comment, SEED_POSTS } from '@/models/timeline';
import { addNotification } from '@/models/notifications';
import { type PondEntry } from '@/models/new-post';
import { FIELD_LABELS } from '@/models/field';
import { assignPondId } from '@/models/pond-instance';
import { api } from '@/services/api';
import { authStorage } from '@/services/auth';

// サーバーから返ってくる形式
type ServerPost = {
  id: string;
  user_id: string;
  ike_id: string;
  ike_category: string;
  content: string;
  reply_to_id: string | null;
  likes_count: number;
  liked_by_me: boolean;
  replies: ServerPost[];
  created_at: string;
  updated_at: string;
};

function serverPostToPost(sp: ServerPost, myUserId: string, myAvatarId: string): Post {
  const isMe = sp.user_id === myUserId;
  return {
    id: sp.id,
    user: isMe ? 'あなた' : sp.user_id.slice(0, 6),
    avatar: isMe ? 'あ' : sp.user_id.slice(0, 1),
    avatarId: isMe ? myAvatarId : undefined,
    pond: FIELD_LABELS[sp.ike_category] ?? sp.ike_category,
    level: '',
    field: sp.ike_category,
    pondId: sp.ike_id,
    content: sp.content,
    likes: sp.likes_count,
    liked: sp.liked_by_me,
    time: new Date(sp.created_at).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    comments: sp.replies.map((r) => ({
      id: r.id,
      postId: sp.id,
      user: r.user_id === myUserId ? 'あなた' : r.user_id.slice(0, 6),
      avatarId: r.user_id === myUserId ? myAvatarId : 'fishbowl',
      content: r.content,
      time: new Date(r.created_at).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    })),
  };
}

export function useTimeline() {
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [myPonds, setMyPonds] = useState<PondEntry[]>([]);
  const [myAvatarId, setMyAvatarId] = useState('fishbowl');
  const [myUserId, setMyUserId] = useState('');
  const [isServerMode, setIsServerMode] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [menuPostId, setMenuPostId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useFocusEffect(useCallback(() => {
    Promise.all([
      AsyncStorage.getItem('pond_user_posts'),
      AsyncStorage.getItem('pond_ponds'),
      AsyncStorage.getItem('pond_avatar'),
      authStorage.getToken(),
      authStorage.getUserId(),
    ]).then(async ([userPostsStored, pondsStored, avatarStored, token, userId]) => {
      const effectiveAvatarId = avatarStored ?? 'fishbowl';
      const effectiveUserId = userId ?? '';
      if (avatarStored) setMyAvatarId(effectiveAvatarId);
      if (userId) setMyUserId(effectiveUserId);

      const rawPonds: Array<{ field: string; level: string; pondId?: string }> = pondsStored
        ? JSON.parse(pondsStored)
        : [];
      const ponds: PondEntry[] = rawPonds.map((p) => ({
        ...p,
        pondId: p.pondId ?? assignPondId(p.field, p.level),
      })) as PondEntry[];
      setMyPonds(ponds);

      if (token && userId) {
        // サーバーモード: タイムラインを取得
        setIsServerMode(true);
        const categories = ponds.map((p) => p.field).join(',');
        const { data } = await api.get<ServerPost[]>(
          `/timeline${categories ? `?categories=${categories}` : ''}`,
          token,
        );
        if (data) {
          const serverPosts = data.map((sp) => serverPostToPost(sp, userId, effectiveAvatarId));
          // ローカルの自分の投稿と合わせる
          const rawUserPosts: Post[] = userPostsStored ? JSON.parse(userPostsStored) : [];
          const localUserPosts = rawUserPosts
            .filter((p) => p.user === 'あなた')
            .map((p) => ({ ...p, avatarId: p.avatarId || effectiveAvatarId, comments: p.comments ?? [] }));
          // サーバー投稿を優先（ローカル投稿はサーバーにないものだけ）
          const serverIds = new Set(serverPosts.map((p) => p.id));
          const localOnly = localUserPosts.filter((p) => !serverIds.has(p.id));
          setPosts([...serverPosts, ...localOnly]);
        }
      } else {
        // ローカルモード
        setIsServerMode(false);
        const rawUserPosts: Post[] = userPostsStored ? JSON.parse(userPostsStored) : [];
        const userPosts = rawUserPosts.map((p) => ({
          ...p,
          avatarId: p.avatarId || effectiveAvatarId,
          comments: p.comments ?? [],
        }));
        setPosts([...userPosts, ...SEED_POSTS]);
      }
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
      return myFields.length > 0
        ? posts.filter((p) => myFields.includes(p.field) || p.user === 'あなた')
        : posts;
    }
    if (activeFilter === 'my_ponds') {
      return posts.filter(
        (p) => p.user === 'あなた' || (p.pondId !== undefined && myPondIds.has(p.pondId))
      );
    }
    return posts.filter((p) => p.field === activeFilter);
  })();

  const toggleLike = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    // 楽観的更新
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );

    if (isServerMode) {
      const token = await authStorage.getToken();
      if (token) {
        const endpoint = post.liked ? `/timeline/unlike/${id}` : `/timeline/like/${id}`;
        await api.post(endpoint, {}, token);
      }
    }
  };

  const openComments = (postId: string) => {
    setMenuPostId(null);
    setCommentPostId(postId);
  };
  const closeComments = () => setCommentPostId(null);

  const addComment = async (postId: string, content: string) => {
    const token = await authStorage.getToken();

    if (isServerMode && token) {
      const { data } = await api.post<{ id: string; content: string; created_at: string }>(
        `/timeline/reply/${postId}`,
        { content },
        token,
      );
      if (data) {
        const newComment: Comment = {
          id: data.id,
          postId,
          user: 'あなた',
          avatarId: myAvatarId,
          content: data.content,
          time: 'たった今',
        };
        setPosts((prev) =>
          prev.map((p) => p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p)
        );
        return;
      }
    }

    // ローカルフォールバック
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      postId,
      user: 'あなた',
      avatarId: myAvatarId,
      content,
      time: 'たった今',
    };
    setPosts((prev) =>
      prev.map((p) => p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p)
    );
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
