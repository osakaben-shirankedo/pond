import { useState, useRef, useCallback, useEffect } from 'react';
import { FlatList } from 'react-native';
import { type ChatMessage, SEED_MESSAGES } from '@/models/pond-chat';
import type { LevelKey } from '@/constants/theme';
import { FIELD_LABELS } from '@/models/field';
import { getPondMembers, getAvatarIdByName, type PondMember } from '@/models/pond-instance';
import AsyncStorage from '@react-native-async-storage/async-storage';

let msgCounter = 100;

export function usePondChat(field: string, level: string, pondId: string) {
  const fieldLabel = FIELD_LABELS[field] ?? field;
  const levelKey = level as LevelKey;

  const seedMessages: ChatMessage[] = (SEED_MESSAGES[field] ?? []).map((m, i) => ({
    ...m,
    id: String(i),
    isMe: false,
    avatarId: getAvatarIdByName(m.user),
  }));

  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [text, setText] = useState('');
  const [myAvatarId, setMyAvatarId] = useState('fishbowl');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    AsyncStorage.getItem('pond_avatar').then((v) => {
      if (v) setMyAvatarId(v);
    });
  }, []);

  const members: PondMember[] = getPondMembers(pondId, myAvatarId);
  const memberCount = members.length; // 自分含めて5人

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
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
    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }, [text, levelKey]);

  return { fieldLabel, levelKey, messages, text, setText, listRef, handleSend, members, memberCount, myAvatarId };
}
