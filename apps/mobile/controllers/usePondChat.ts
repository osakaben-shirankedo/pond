import { useState, useRef, useCallback, useEffect } from 'react';
import { FlatList } from 'react-native';
import { type ChatMessage, SEED_MESSAGES } from '@/models/pond-chat';
import type { LevelKey } from '@/constants/theme';
import { FIELD_LABELS } from '@/models/field';
import { getPondMembers, getAvatarIdByName, type PondMember } from '@/models/pond-instance';
import { getRankingForPond, type RankedMember, POND_POINTS_KEY } from '@/models/points';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/services/api';
import { authStorage } from '@/services/auth';

let msgCounter = 100;

// UUID形式かどうかで「サーバーの池」か「ローカル池」かを判別する
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ServerMessage = {
  id: string;
  user_id: string;
  content: string;
  reply_to_id: string | null;
  created_at: string;
};

function serverMsgToChatMsg(msg: ServerMessage, myUserId: string, level: LevelKey): ChatMessage {
  const isMe = msg.user_id === myUserId;
  return {
    id: msg.id,
    user: isMe ? 'あなた' : msg.user_id.slice(0, 6),
    avatar: isMe ? 'あ' : msg.user_id.slice(0, 1),
    level,
    content: msg.content,
    time: new Date(msg.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
    isMe,
  };
}

export function usePondChat(field: string, level: string, pondId: string) {
  const fieldLabel = FIELD_LABELS[field] ?? field;
  const levelKey = level as LevelKey;
  const isServerPond = UUID_REGEX.test(pondId);

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
  const [myPoints, setMyPoints] = useState(0);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('pond_avatar'),
      AsyncStorage.getItem(POND_POINTS_KEY),
    ]).then(([avatarStored, pointsStored]) => {
      if (avatarStored) setMyAvatarId(avatarStored);
      if (pointsStored) setMyPoints(parseInt(pointsStored, 10));
    });
    authStorage.getUserId().then((id) => {
      if (id) setMyUserId(id);
    });
  }, []);

  // サーバー池の場合はメッセージを取得
  useEffect(() => {
    if (!isServerPond) return;

    (async () => {
      const token = await authStorage.getToken();
      if (!token) return;
      const userId = await authStorage.getUserId() ?? '';
      const { data } = await api.get<ServerMessage[]>(`/ike/${pondId}/chat`, token);
      if (data) {
        setMessages(data.map((m) => serverMsgToChatMsg(m, userId, levelKey)));
      }
    })();
  }, [isServerPond, pondId, levelKey]);

  const members: PondMember[] = getPondMembers(pondId, myAvatarId);
  const memberCount = members.length;
  const ranking: RankedMember[] = getRankingForPond(pondId, myPoints, myAvatarId);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (isServerPond) {
      const token = await authStorage.getToken();
      if (!token) return;
      const { data } = await api.post<ServerMessage>(
        `/ike/${pondId}/chat/message`,
        { content: trimmed },
        token,
      );
      if (data) {
        const newMsg = serverMsgToChatMsg(data, myUserId, levelKey);
        setMessages((prev) => [...prev, newMsg]);
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
      };
      setMessages((prev) => [...prev, newMsg]);
    }

    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }, [text, levelKey, isServerPond, pondId, myUserId]);

  return { fieldLabel, levelKey, messages, text, setText, listRef, handleSend, members, memberCount, myAvatarId, ranking };
}
