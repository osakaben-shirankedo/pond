import { useState, useRef, useCallback } from 'react';
import { FlatList } from 'react-native';
import { type ChatMessage, SEED_MESSAGES } from '@/models/pond-chat';
import type { LevelKey } from '@/constants/theme';
import { FIELD_LABELS } from '@/models/field';

let msgCounter = 100;

export function usePondChat(field: string, level: string) {
  const fieldLabel = FIELD_LABELS[field] ?? field;
  const levelKey = level as LevelKey;

  const seedMessages: ChatMessage[] = (SEED_MESSAGES[field] ?? []).map((m, i) => ({
    ...m,
    id: String(i),
    isMe: false,
  }));

  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

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

  return { fieldLabel, levelKey, messages, text, setText, listRef, handleSend };
}
