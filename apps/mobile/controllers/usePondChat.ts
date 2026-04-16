import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { FlatList } from 'react-native';
import { type ChatMessage, SEED_MESSAGES } from '@/models/pond-chat';
import type { LevelKey } from '@/constants/levels';
import { FIELD_LABELS } from '@/models/field';
import { getPondMembers, getPondInstance, getAvatarIdByName, type PondMember } from '@/models/pond-instance';
import { getRankingForPond, type RankedMember, POND_POINTS_KEY } from '@/models/points';
import { CHALLENGES, PAST_CHALLENGES, CHALLENGE_JOINED_KEY, CHALLENGE_SUBMISSION_KEY, FIELD_ID_MAP, type Challenge } from '@/models/challenges';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authStorage } from '@/services/auth';
import { clearPondUnread } from '@/models/notifications';
import {
  useIkeMembersQuery,
  useIkeChatQuery,
  useSendMessageMutation,
  useEditMessageMutation,
  useReplyToMessageMutation,
  useDeleteMessageMutation,
  useLeaveIkeMutation,
  useAiFishMutation,
  type MemberProfile,
  type ServerMessage,
} from '@/api';

let msgCounter = 100;

function serverMsgToChatMsg(
  msg: ServerMessage,
  myUserId: string,
  level: LevelKey,
  profileMap: Map<string, MemberProfile>,
): ChatMessage {
  const isMe = msg.user_id === myUserId;
  const profile = profileMap.get(msg.user_id);
  return {
    id: msg.id,
    user: profile?.name ?? (isMe ? 'あなた' : msg.user_id.slice(0, 6)),
    avatar: isMe ? 'あ' : msg.user_id.slice(0, 1),
    avatarId: profile?.avatar || undefined,
    level,
    content: msg.content,
    time: new Date(msg.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
    isMe,
    replyToId: msg.reply_to_id ?? undefined,
  };
}

export function usePondChat(field: string, level: string, pondId: string) {
  const fieldLabel = FIELD_LABELS[field] ?? field;
  const levelKey = level as LevelKey;
  const isServerPond = pondId !== '' && !getPondInstance(pondId);

  const seedMessages = useMemo(
    () =>
      (SEED_MESSAGES[field] ?? []).map((m, i) => ({
        ...m,
        id: String(i),
        isMe: false,
        avatarId: getAvatarIdByName(m.user),
      })),
    [field],
  );

  // ローカル池: 表示専用のメッセージリスト（AsyncStorage から読んだチャレンジメッセージ等）
  const [localChatMsgs, setLocalChatMsgs] = useState<ChatMessage[]>([]);
  // ローカル池でのみ使う削除済み ID セット
  const [deletedLocalIds, setDeletedLocalIds] = useState<Set<string>>(new Set());

  const [text, setText] = useState('');
  const [myAvatarId, setMyAvatarId] = useState('fishbowl');
  const [myUserId, setMyUserId] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null);
  const [myPoints, setMyPoints] = useState(0);
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [pastChallenges, setPastChallenges] = useState<Challenge[]>([]);
  const listRef = useRef<FlatList>(null);

  // ─── TanStack Query フック ────────────────────────────────────────────
  const { data: membersData } = useIkeMembersQuery(pondId, isServerPond);
  const { data: chatData } = useIkeChatQuery(pondId, isServerPond);

  const sendMutation = useSendMessageMutation(pondId);
  const editMutation = useEditMessageMutation(pondId);
  const replyMutation = useReplyToMessageMutation(pondId);
  const deleteMutation = useDeleteMessageMutation(pondId);
  const leaveMutation = useLeaveIkeMutation();
  const aiFishMutation = useAiFishMutation();

  // ─── プロフィールマップ ────────────────────────────────────────────────
  const profileMap = useMemo(
    () => new Map((membersData ?? []).map((p) => [p.user_id, p])),
    [membersData],
  );

  // ─── AsyncStorage からローカルデータを読み込み ────────────────────────
  const loadStorage = useCallback(() => {
    Promise.all([
      AsyncStorage.getItem('pond_avatar'),
      AsyncStorage.getItem(POND_POINTS_KEY),
      AsyncStorage.getItem(CHALLENGE_JOINED_KEY),
      AsyncStorage.getItem(`challenge_chat_${pondId}`),
      AsyncStorage.getItem(CHALLENGE_SUBMISSION_KEY),
    ]).then(([avatarStored, pointsStored, joinedStr, challengeChatStr, subStr]) => {
      if (avatarStored) setMyAvatarId(avatarStored);
      if (pointsStored) setMyPoints(parseInt(pointsStored, 10));

      if (challengeChatStr) {
        const challengeMsgs: ChatMessage[] = JSON.parse(challengeChatStr);
        setLocalChatMsgs(challengeMsgs);
      }

      const joinedIds: string[] = joinedStr ? JSON.parse(joinedStr) : [];
      const submissionsMap: Record<string, { pass: boolean }> = subStr ? JSON.parse(subStr) : {};
      const fieldKey = Object.entries(FIELD_ID_MAP).find(([, v]) => v === field)?.[0];

      const matched = CHALLENGES.filter(
        (c) => joinedIds.includes(c.id) && (c.field === fieldKey || c.field === field)
          && submissionsMap[c.id]?.pass !== true
      );
      setActiveChallenges(matched.sort((a, b) => b.daysLeft - a.daysLeft));

      const clearedActive = CHALLENGES.filter(
        (c) => (c.field === fieldKey || c.field === field) && submissionsMap[c.id]?.pass === true
      );
      const pastFromField = PAST_CHALLENGES.filter(
        (c) => c.field === fieldKey || c.field === field
      );
      const pastIds = new Set(pastFromField.map((c) => c.id));
      const merged = [...clearedActive, ...pastFromField.filter((c) => !pastIds.has(c.id) || true)];
      const seen = new Set<string>();
      setPastChallenges(merged.filter((c) => { if (seen.has(c.id)) return false; seen.add(c.id); return true; }));

      if (pondId) clearPondUnread(pondId);
    });
    authStorage.getUserId().then((id) => { if (id) setMyUserId(id); });
  }, [field, pondId]);

  useEffect(() => { loadStorage(); }, [loadStorage]);
  useFocusEffect(useCallback(() => { loadStorage(); }, [loadStorage]));

  // ─── メッセージリスト（サーバー or ローカル） ─────────────────────────
  const messages = useMemo(() => {
    if (isServerPond) {
      const serverMsgs = (chatData ?? []).map((m) =>
        serverMsgToChatMsg(m, myUserId, levelKey, profileMap)
      );
      const serverIds = new Set(serverMsgs.map((m) => m.id));
      const localOnly = localChatMsgs.filter((m) => !serverIds.has(m.id));
      return [...serverMsgs, ...localOnly];
    }
    return [...seedMessages, ...localChatMsgs].filter((m) => !deletedLocalIds.has(m.id));
  }, [isServerPond, chatData, localChatMsgs, deletedLocalIds, myUserId, levelKey, profileMap]);
  // seedMessages は定数なので deps に入れない

  // ─── メッセージ送信・編集・リプライ ────────────────────────────────────
  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (isServerPond) {
      if (editingMsg) {
        await editMutation.mutateAsync({ messageId: editingMsg.id, content: trimmed });
        setEditingMsg(null);
      } else if (replyingTo) {
        await replyMutation.mutateAsync({ messageId: replyingTo.id, content: trimmed });
        setReplyingTo(null);
      } else {
        await sendMutation.mutateAsync({ content: trimmed });
      }
    } else {
      const newMsg: ChatMessage = {
        id: String(msgCounter++),
        user: 'あなた',
        avatar: 'あ',
        level: levelKey,
        content: trimmed,
        time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        replyToId: replyingTo?.id,
      };
      setLocalChatMsgs((prev) => [...prev, newMsg]);
      setReplyingTo(null);
    }

    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }, [text, levelKey, isServerPond, editingMsg, replyingTo, editMutation, replyMutation, sendMutation]);

  const handleDelete = useCallback(async (msgId: string) => {
    if (isServerPond) {
      await deleteMutation.mutateAsync(msgId);
    } else {
      setDeletedLocalIds((prev) => new Set([...prev, msgId]));
    }
  }, [isServerPond, deleteMutation]);

  // ─── メンバー・ランキング ────────────────────────────────────────────
  const members: PondMember[] = isServerPond
    ? Array.from(profileMap.values()).map((p) => ({
        id: p.user_id,
        name: p.name,
        avatarId: p.avatar || 'fishbowl',
        level: levelKey,
        isMe: p.user_id === myUserId,
      }))
    : getPondMembers(pondId, myAvatarId);
  const memberCount = members.length;
  const ranking: RankedMember[] = getRankingForPond(pondId, myPoints, myAvatarId);

  // ─── AI魚 ─────────────────────────────────────────────────────────────
  const userMessageCount = messages.filter((m) => m.isMe && m.type !== 'challenge').length;
  const isStagnant = userMessageCount === 0;

  const callAiFish = useCallback(async () => {
    if (aiFishMutation.isPending) return;

    const recentMessages = messages
      .filter((m) => m.type !== 'challenge' && m.type !== 'ai_fish')
      .slice(-5)
      .map((m) => `${m.user}: ${m.content}`);

    const result = await aiFishMutation.mutateAsync({
      field: fieldLabel,
      level: levelKey,
      recentMessages,
      memberCount,
      userMessageCount,
    });

    const fishMsg: ChatMessage = {
      id: `ai-fish-${Date.now()}`,
      user: 'AI魚',
      avatar: '🐟',
      level: levelKey,
      content: result.message,
      time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      isMe: false,
      type: 'ai_fish',
    };
    setLocalChatMsgs((prev) => [...prev, fishMsg]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }, [aiFishMutation, messages, fieldLabel, levelKey, memberCount, userMessageCount]);

  // ─── 池を退出 ─────────────────────────────────────────────────────────
  const leavePond = useCallback(async () => {
    if (isServerPond) {
      await leaveMutation.mutateAsync(pondId);
    }
    const stored = await AsyncStorage.getItem('pond_ponds');
    const ponds: { field: string; pondId?: string }[] = stored ? JSON.parse(stored) : [];
    await AsyncStorage.setItem(
      'pond_ponds',
      JSON.stringify(ponds.filter((p) => !(p.pondId === pondId || p.field === field)))
    );
  }, [isServerPond, pondId, field, leaveMutation]);

  const startEdit = useCallback((msg: ChatMessage) => {
    setEditingMsg(msg);
    setReplyingTo(null);
    setText(msg.content);
  }, []);

  const startReply = useCallback((msg: ChatMessage) => {
    setReplyingTo(msg);
    setEditingMsg(null);
  }, []);

  const cancelAction = useCallback(() => {
    setEditingMsg(null);
    setReplyingTo(null);
    setText('');
  }, []);

  return {
    fieldLabel,
    levelKey,
    messages,
    text,
    setText,
    listRef,
    handleSend,
    handleDelete,
    startEdit,
    startReply,
    cancelAction,
    editingMsg,
    replyingTo,
    members,
    memberCount,
    myAvatarId,
    myUserId,
    ranking,
    activeChallenges,
    pastChallenges,
    isStagnant,
    callAiFish,
    aiFishLoading: aiFishMutation.isPending,
    leavePond,
  };
}
