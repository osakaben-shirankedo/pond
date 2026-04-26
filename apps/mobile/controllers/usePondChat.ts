import { useRef, useCallback, useEffect, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { FlatList } from 'react-native';
import { type ChatMessage, SEED_MESSAGES } from '@/models/pond-chat';
import type { LevelKey } from '@/constants/levels';
import { FIELD_LABELS } from '@/models/field';
import { getPondMembers, getPondInstance, getAvatarIdByName } from '@/models/pond-instance';
import { getRankingForPond } from '@/models/points';
import { CHALLENGES, PAST_CHALLENGES, FIELD_ID_MAP, type Challenge } from '@/models/challenges';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authStorage } from '@/services/auth';
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
import { usePondChatStore, useUserStore, useChallengesStore } from '@/stores';

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

  const {
    text, replyingTo, editingMsg, localChatMsgs, deletedLocalIds,
    setText, setReplyingTo, setEditingMsg, setLocalChatMsgs, addDeletedId, reset,
  } = usePondChatStore();

  const { avatarId: myAvatarId } = useUserStore();
  const { points: myPoints, joinedIds, submissionsMap } = useChallengesStore();
  const myUserId = useUserStore((s) => s.userId);

  const listRef = useRef<FlatList>(null);

  const { data: membersData } = useIkeMembersQuery(pondId, isServerPond);
  const { data: chatData } = useIkeChatQuery(pondId, isServerPond);

  const sendMutation = useSendMessageMutation(pondId);
  const editMutation = useEditMessageMutation(pondId);
  const replyMutation = useReplyToMessageMutation(pondId);
  const deleteMutation = useDeleteMessageMutation(pondId);
  const leaveMutation = useLeaveIkeMutation();
  const aiFishMutation = useAiFishMutation();

  const profileMap = useMemo(
    () => new Map((membersData ?? []).map((p) => [p.user_id, p])),
    [membersData],
  );

  const loadStorage = useCallback(() => {
    Promise.all([
      AsyncStorage.getItem(`challenge_chat_${pondId}`),
    ]).then(([challengeChatStr]) => {
      if (challengeChatStr) {
        setLocalChatMsgs(JSON.parse(challengeChatStr));
      }
    });

    authStorage.getUserId().then((id) => {
      if (id) useUserStore.getState().setUserId(id);
    });

    if (pondId) useUserStore.getState().clearPondUnread(pondId);
  }, [pondId, setLocalChatMsgs]);

  useEffect(() => {
    reset();
    loadStorage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pondId]);

  useFocusEffect(useCallback(() => { loadStorage(); }, [loadStorage]));

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
  }, [isServerPond, chatData, localChatMsgs, deletedLocalIds, myUserId, levelKey, profileMap, seedMessages]);

  // アクティブ・過去チャレンジ（challengesStoreから計算）
  const activeChallenges = useMemo<Challenge[]>(() => {
    const fieldKey = Object.entries(FIELD_ID_MAP).find(([, v]) => v === field)?.[0];
    return CHALLENGES.filter(
      (c) => joinedIds.includes(c.id)
        && (c.field === fieldKey || c.field === field)
        && submissionsMap[c.id]?.pass !== true
    ).sort((a, b) => b.daysLeft - a.daysLeft);
  }, [field, joinedIds, submissionsMap]);

  const pastChallenges = useMemo<Challenge[]>(() => {
    const fieldKey = Object.entries(FIELD_ID_MAP).find(([, v]) => v === field)?.[0];
    const clearedActive = CHALLENGES.filter(
      (c) => (c.field === fieldKey || c.field === field) && submissionsMap[c.id]?.pass === true
    );
    const pastFromField = PAST_CHALLENGES.filter(
      (c) => c.field === fieldKey || c.field === field
    );
    const seen = new Set<string>();
    return [...clearedActive, ...pastFromField].filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  }, [field, submissionsMap]);

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
  }, [text, levelKey, isServerPond, editingMsg, replyingTo, editMutation, replyMutation, sendMutation, setEditingMsg, setReplyingTo, setLocalChatMsgs, setText]);

  const handleDelete = useCallback(async (msgId: string) => {
    if (isServerPond) {
      await deleteMutation.mutateAsync(msgId);
    } else {
      addDeletedId(msgId);
    }
  }, [isServerPond, deleteMutation, addDeletedId]);

  const members = isServerPond
    ? Array.from(profileMap.values()).map((p) => ({
        id: p.user_id,
        name: p.name,
        avatarId: p.avatar || 'fishbowl',
        level: levelKey,
        isMe: p.user_id === myUserId,
      }))
    : getPondMembers(pondId, myAvatarId);
  const memberCount = members.length;
  const ranking = getRankingForPond(pondId, myPoints, myAvatarId);

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
  }, [aiFishMutation, messages, fieldLabel, levelKey, memberCount, userMessageCount, setLocalChatMsgs]);

  const leavePond = useCallback(async () => {
    if (isServerPond) {
      await leaveMutation.mutateAsync(pondId);
    }
    useUserStore.getState().removePond(pondId, field);
  }, [isServerPond, pondId, field, leaveMutation]);

  const startEdit = useCallback((msg: ChatMessage) => {
    setEditingMsg(msg);
    setReplyingTo(null);
    setText(msg.content);
  }, [setEditingMsg, setReplyingTo, setText]);

  const startReply = useCallback((msg: ChatMessage) => {
    setReplyingTo(msg);
    setEditingMsg(null);
  }, [setReplyingTo, setEditingMsg]);

  const cancelAction = useCallback(() => {
    setEditingMsg(null);
    setReplyingTo(null);
    setText('');
  }, [setEditingMsg, setReplyingTo, setText]);

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
