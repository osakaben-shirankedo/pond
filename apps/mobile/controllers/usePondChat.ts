import { useState, useRef, useCallback, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { FlatList } from 'react-native';
import { type ChatMessage, SEED_MESSAGES } from '@/models/pond-chat';
import type { LevelKey } from '@/constants/theme';
import { FIELD_LABELS } from '@/models/field';
import { getPondMembers, getPondInstance, getAvatarIdByName, type PondMember } from '@/models/pond-instance';
import { getRankingForPond, type RankedMember, POND_POINTS_KEY } from '@/models/points';
import { CHALLENGES, PAST_CHALLENGES, CHALLENGE_JOINED_KEY, CHALLENGE_SUBMISSION_KEY, FIELD_ID_MAP, type Challenge } from '@/models/challenges';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/services/api';
import { authStorage } from '@/services/auth';
import { clearPondUnread } from '@/models/notifications';

let msgCounter = 100;

// ローカルのシード池IDかどうかで「サーバーの池」か「ローカル池」かを判別する
// サーバー池はシード池に存在しない任意のID（UUIDや ike-xxx-01 形式など）を持つ

type ServerMessage = {
  id: string;
  user_id: string;
  content: string;
  reply_to_id: string | null;
  created_at: string;
};

type MemberProfile = {
  user_id: string;
  name: string;
  avatar: string;
};

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
  console.log('[PondChat] pondId:', pondId, '| isServerPond:', isServerPond);

  const seedMessages: ChatMessage[] = (SEED_MESSAGES[field] ?? []).map((m, i) => ({
    ...m,
    id: String(i),
    isMe: false,
    avatarId: getAvatarIdByName(m.user),
  }));

  const [messages, setMessages] = useState<ChatMessage[]>(isServerPond ? [] : seedMessages);
  const [text, setText] = useState('');
  const [myAvatarId, setMyAvatarId] = useState('fishbowl');
  const [myUserId, setMyUserId] = useState('');
  const [profileMap, setProfileMap] = useState<Map<string, MemberProfile>>(new Map());
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null);
  const [myPoints, setMyPoints] = useState(0);
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [pastChallenges, setPastChallenges] = useState<Challenge[]>([]);
  const listRef = useRef<FlatList>(null);

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
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newMsgs = challengeMsgs.filter((m) => !existingIds.has(m.id));
          return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
        });
      }

      const joinedIds: string[] = joinedStr ? JSON.parse(joinedStr) : [];
      const submissionsMap: Record<string, { pass: boolean }> = subStr ? JSON.parse(subStr) : {};
      const fieldKey = Object.entries(FIELD_ID_MAP).find(([, v]) => v === field)?.[0];

      // クリア済みを除いたアクティブチャレンジ
      const matched = CHALLENGES.filter(
        (c) => joinedIds.includes(c.id) && (c.field === fieldKey || c.field === field)
          && submissionsMap[c.id]?.pass !== true
      );
      setActiveChallenges(matched.sort((a, b) => b.daysLeft - a.daysLeft));

      // 過去チャレンジ（PAST_CHALLENGES + クリア済みのアクティブチャレンジ）
      const clearedActive = CHALLENGES.filter(
        (c) => (c.field === fieldKey || c.field === field) && submissionsMap[c.id]?.pass === true
      );
      const pastFromField = PAST_CHALLENGES.filter(
        (c) => c.field === fieldKey || c.field === field
      );
      const pastIds = new Set(pastFromField.map((c) => c.id));
      const merged = [...clearedActive, ...pastFromField.filter((c) => !pastIds.has(c.id) || true)];
      // dedupe by id
      const seen = new Set<string>();
      setPastChallenges(merged.filter((c) => { if (seen.has(c.id)) return false; seen.add(c.id); return true; }));

      // 池を開いたので未読フラグをクリア
      if (pondId) clearPondUnread(pondId);
    });
    authStorage.getUserId().then((id) => {
      if (id) setMyUserId(id);
    });
  }, [field, pondId]);

  // 初回ロード
  useEffect(() => { loadStorage(); }, [loadStorage]);

  // 画面フォーカス時に再読み込み（チャレンジ参加後に戻ってきた際に反映）
  useFocusEffect(useCallback(() => { loadStorage(); }, [loadStorage]));

  // サーバー池の場合はメンバープロフィールを取得（初回のみ）
  useEffect(() => {
    if (!isServerPond) return;

    const fetchProfiles = async () => {
      const token = await authStorage.getToken();
      if (!token) return;
      const { data } = await api.get<MemberProfile[]>(`/ike/${pondId}/members`, token);
      if (data) {
        setProfileMap(new Map(data.map((p) => [p.user_id, p])));
      }
    };

    fetchProfiles();
  }, [isServerPond, pondId]);

  // サーバー池の場合はメッセージを取得（5秒ポーリング）
  useEffect(() => {
    if (!isServerPond) return;

    const fetchMessages = async () => {
      const token = await authStorage.getToken();
      if (!token) return;
      const userId = (await authStorage.getUserId()) ?? '';
      const { data } = await api.get<ServerMessage[]>(`/ike/${pondId}/chat`, token);
      if (data) {
        setMessages(data.map((m) => serverMsgToChatMsg(m, userId, levelKey, profileMap)));
      }
    };

    fetchMessages();
    const timer = setInterval(fetchMessages, 5000);
    return () => clearInterval(timer);
  }, [isServerPond, pondId, levelKey, profileMap]);

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

  // 停滞検出: 自分のメッセージが0件なら停滞とみなす
  const userMessageCount = messages.filter((m) => m.isMe && m.type !== 'challenge').length;
  const isStagnant = userMessageCount === 0;

  const [aiFishLoading, setAiFishLoading] = useState(false);

  const callAiFish = useCallback(async () => {
    if (aiFishLoading) return;
    setAiFishLoading(true);
    try {
      const recentMessages = messages
        .filter((m) => m.type !== 'challenge' && m.type !== 'ai_fish')
        .slice(-5)
        .map((m) => `${m.user}: ${m.content}`);

      const { data } = await api.post<{ message: string }>('/ike/ai-fish', {
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
        content: data ? data.message : `${fieldLabel}について、今日気になったことをシェアしてみよう！🐠`,
        time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
        type: 'ai_fish',
      };
      setMessages((prev) => [...prev, fishMsg]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    } finally {
      setAiFishLoading(false);
    }
  }, [aiFishLoading, messages, fieldLabel, levelKey, memberCount, userMessageCount]);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (isServerPond) {
      const token = await authStorage.getToken();
      if (!token) return;
      const userId = (await authStorage.getUserId()) ?? '';

      if (editingMsg) {
        // 編集モード
        const { data } = await api.post<ServerMessage>(
          `/ike/${pondId}/chat/${editingMsg.id}/edit`,
          { content: trimmed },
          token,
        );
        if (data) {
          setMessages((prev) =>
            prev.map((m) => (m.id === editingMsg.id ? serverMsgToChatMsg(data, userId, levelKey, profileMap) : m))
          );
        }
        setEditingMsg(null);
      } else if (replyingTo) {
        // リプライモード
        const { data } = await api.post<ServerMessage>(
          `/ike/${pondId}/chat/${replyingTo.id}/reply`,
          { content: trimmed },
          token,
        );
        if (data) {
          setMessages((prev) => [...prev, serverMsgToChatMsg(data, userId, levelKey, profileMap)]);
        }
        setReplyingTo(null);
      } else {
        // 通常送信
        const { data } = await api.post<ServerMessage>(
          `/ike/${pondId}/chat/message`,
          { content: trimmed },
          token,
        );
        if (data) {
          setMessages((prev) => [...prev, serverMsgToChatMsg(data, userId, levelKey, profileMap)]);
        }
      }
    } else {
      // ローカル池
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
      setMessages((prev) => [...prev, newMsg]);
      setReplyingTo(null);
    }

    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }, [text, levelKey, isServerPond, pondId, editingMsg, replyingTo, profileMap]);

  const handleDelete = useCallback(async (msgId: string) => {
    if (isServerPond) {
      const token = await authStorage.getToken();
      if (!token) return;
      const { error } = await api.post(`/ike/${pondId}/chat/${msgId}/delete`, {}, token);
      if (!error) {
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
      }
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    }
  }, [isServerPond, pondId]);

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

  const leavePond = useCallback(async () => {
    if (isServerPond) {
      const token = await authStorage.getToken();
      if (token) {
        await api.post(`/ike/${pondId}/leave`, {}, token);
      }
    }
    const stored = await AsyncStorage.getItem('pond_ponds');
    const ponds: Array<{ field: string; pondId?: string }> = stored ? JSON.parse(stored) : [];
    await AsyncStorage.setItem(
      'pond_ponds',
      JSON.stringify(ponds.filter((p) => !(p.pondId === pondId || p.field === field)))
    );
  }, [isServerPond, pondId, field]);

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
    aiFishLoading,
    leavePond,
  };
}
