import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { type Post, type Comment, SEED_POSTS } from '@/models/timeline';
import { addNotification } from '@/models/notifications';
import { type PondEntry } from '@/models/new-post';
import { FIELD_LABELS } from '@/models/field';
import { assignPondId } from '@/models/pond-instance';
import { authStorage } from '@/services/auth';
import {
  useTimelineQuery,
  useLikePostMutation,
  useUnlikePostMutation,
  useReplyToPostMutation,
  queryKeys,
  type TimelinePostView,
} from '@/api';

// ─── サーバー型 → UI型の変換 ────────────────────────────────────────────
function serverPostToPost(sp: TimelinePostView, myUserId: string, myAvatarId: string): Post {
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
    time: new Date(sp.created_at).toLocaleString('ja-JP', {
      month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
    }),
    comments: sp.replies.map((r) => ({
      id: r.id,
      postId: sp.id,
      user: r.user_id === myUserId ? 'あなた' : r.user_id.slice(0, 6),
      avatarId: r.user_id === myUserId ? myAvatarId : 'fishbowl',
      content: r.content,
      time: new Date(r.created_at).toLocaleString('ja-JP', {
        month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
      }),
    })),
  };
}

// ─────────────────────────────────────────────────────────────────────────

export function useTimeline() {
  const [myPonds, setMyPonds] = useState<PondEntry[]>([]);
  const [myAvatarId, setMyAvatarId] = useState('fishbowl');
  const [myUserId, setMyUserId] = useState('');
  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [menuPostId, setMenuPostId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const qc = useQueryClient();

  // ユーザー設定・ローカルデータの読み込み（画面フォーカス時）
  useFocusEffect(useCallback(() => {
    Promise.all([
      AsyncStorage.getItem('pond_user_posts'),
      AsyncStorage.getItem('pond_ponds'),
      AsyncStorage.getItem('pond_avatar'),
      authStorage.getUserId(),
    ]).then(([userPostsStored, pondsStored, avatarStored, userId]) => {
      if (avatarStored) setMyAvatarId(avatarStored);
      if (userId) setMyUserId(userId);

      const rawPonds: Array<{ field: string; level: string; pondId?: string }> =
        pondsStored ? JSON.parse(pondsStored) : [];
      const ponds: PondEntry[] = rawPonds.map((p) => ({
        ...p,
        pondId: p.pondId ?? assignPondId(p.field, p.level),
      })) as PondEntry[];
      setMyPonds(ponds);

      const rawUserPosts: Post[] = userPostsStored ? JSON.parse(userPostsStored) : [];
      setLocalPosts(
        rawUserPosts.map((p) => ({
          ...p,
          avatarId: p.avatarId || (avatarStored ?? 'fishbowl'),
          comments: p.comments ?? [],
        }))
      );

      // フォーカス時にタイムラインを再取得
      qc.invalidateQueries({ queryKey: queryKeys.timeline.all() });
    });
  }, [])); // eslint-disable-line react-hooks/exhaustive-deps

  // サーバーからのタイムライン（TanStack Query が自動キャッシュ＆再取得）
  const categories = useMemo(() => myPonds.map((p) => p.field).join(','), [myPonds]);
  const { data: serverData } = useTimelineQuery(categories);

  // サーバー投稿 → UI型に変換
  const serverPosts = useMemo(
    () => (serverData ?? []).map((sp) => serverPostToPost(sp, myUserId, myAvatarId)),
    [serverData, myUserId, myAvatarId],
  );

  // サーバー投稿を優先し、ローカルのみの投稿を末尾に追加
  const posts = useMemo(() => {
    if (serverPosts.length === 0) {
      return localPosts.length > 0 ? [...localPosts, ...SEED_POSTS] : SEED_POSTS;
    }
    const serverIds = new Set(serverPosts.map((p) => p.id));
    const localOnly = localPosts.filter((p) => !serverIds.has(p.id));
    return [...serverPosts, ...localOnly];
  }, [serverPosts, localPosts]);

  // ─── ミューテーション ──────────────────────────────────────────────────
  const likeMutation = useLikePostMutation();
  const unlikeMutation = useUnlikePostMutation();
  const replyMutation = useReplyToPostMutation();

  // ─── フィルター ────────────────────────────────────────────────────────
  const myFields = myPonds.map((p) => p.field);
  const myPondIds = new Set(myPonds.map((p) => p.pondId).filter(Boolean));

  const filters = [
    { id: 'all', label: 'すべて' },
    ...(myPonds.length > 0 ? [{ id: 'my_ponds', label: 'マイ池' }] : []),
    ...myPonds.map((p) => ({ id: p.field, label: FIELD_LABELS[p.field] ?? p.field })),
  ];

  const filtered = useMemo(() => {
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
  }, [posts, activeFilter, myFields, myPondIds]);

  // ─── アクション ────────────────────────────────────────────────────────

  /** いいね切り替え（楽観的更新 → mutation） */
  const toggleLike = useCallback(async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    // 楽観的更新: クエリキャッシュを直接書き換える
    qc.setQueryData<TimelinePostView[]>(
      queryKeys.timeline.list(categories),
      (prev) =>
        prev?.map((sp) =>
          sp.id === id
            ? {
                ...sp,
                liked_by_me: !sp.liked_by_me,
                likes_count: sp.liked_by_me ? sp.likes_count - 1 : sp.likes_count + 1,
              }
            : sp
        ),
    );

    const token = await authStorage.getToken();
    if (!token) return;

    const mutation = post.liked ? unlikeMutation : likeMutation;
    mutation.mutate(id, {
      onError: () => {
        // エラー時はキャッシュを戻す
        qc.invalidateQueries({ queryKey: queryKeys.timeline.list(categories) });
      },
    });
  }, [posts, qc, categories, likeMutation, unlikeMutation]);

  const openComments = useCallback((postId: string) => {
    setMenuPostId(null);
    setCommentPostId(postId);
  }, []);
  const closeComments = useCallback(() => setCommentPostId(null), []);

  const addComment = useCallback(async (postId: string, content: string) => {
    const token = await authStorage.getToken();

    if (token && serverPosts.length > 0) {
      replyMutation.mutate({ postId, content }, {
        onSuccess: (data) => {
          qc.setQueryData<TimelinePostView[]>(
            queryKeys.timeline.list(categories),
            (prev) =>
              prev?.map((sp) =>
                sp.id === postId
                  ? {
                      ...sp,
                      replies: [
                        ...sp.replies,
                        {
                          id: data.id,
                          user_id: myUserId,
                          ike_id: sp.ike_id,
                          ike_category: sp.ike_category,
                          content: data.content,
                          reply_to_id: postId,
                          likes_count: 0,
                          liked_by_me: false,
                          replies: [],
                          created_at: data.created_at,
                          updated_at: data.created_at,
                        },
                      ],
                    }
                  : sp
              ),
          );
        },
      });
      return;
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
    setLocalPosts((prev) =>
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
  }, [serverPosts, replyMutation, qc, categories, myUserId, myAvatarId, posts]);

  const openMenu = useCallback((postId: string) => setMenuPostId(postId), []);
  const closeMenu = useCallback(() => setMenuPostId(null), []);

  const deletePost = useCallback(async (postId: string) => {
    setMenuPostId(null);
    setLocalPosts((prev) => prev.filter((p) => p.id !== postId));
    const stored = await AsyncStorage.getItem('pond_user_posts');
    const existing: Post[] = stored ? JSON.parse(stored) : [];
    await AsyncStorage.setItem(
      'pond_user_posts',
      JSON.stringify(existing.filter((p) => p.id !== postId))
    );
  }, []);

  const startEdit = useCallback((post: Post) => {
    setMenuPostId(null);
    setEditingPost(post);
  }, []);

  const saveEdit = useCallback(async (postId: string, newContent: string) => {
    setEditingPost(null);
    setLocalPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, content: newContent } : p))
    );
    const stored = await AsyncStorage.getItem('pond_user_posts');
    const existing: Post[] = stored ? JSON.parse(stored) : [];
    await AsyncStorage.setItem(
      'pond_user_posts',
      JSON.stringify(existing.map((p) => (p.id === postId ? { ...p, content: newContent } : p)))
    );
  }, []);

  const cancelEdit = useCallback(() => setEditingPost(null), []);

  const selectedPost = posts.find((p) => p.id === commentPostId) ?? null;

  const handleNewPost = useCallback(() => router.push('/new-post'), []);

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
