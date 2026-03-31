import { useState, useEffect, useRef } from 'react';
import { TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { type PondEntry, MAX_CHARS, buildNewPost } from '@/models/new-post';
import { api } from '@/services/api';
import { authStorage } from '@/services/auth';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useNewPost() {
  const [ponds, setPonds] = useState<PondEntry[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [avatarId, setAvatarId] = useState('fishbowl');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('pond_ponds'),
      AsyncStorage.getItem('pond_avatar'),
    ]).then(([pondStored, avatarStored]) => {
      if (pondStored) {
        const loaded: PondEntry[] = JSON.parse(pondStored);
        setPonds(loaded);
        if (loaded.length > 0) setSelectedField(loaded[0].field);
      }
      if (avatarStored) setAvatarId(avatarStored);
    });
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const selectedPond = ponds.find((p) => p.field === selectedField);
  const canPost = content.trim().length > 0 && selectedField !== null;
  const remaining = MAX_CHARS - content.length;

  const handleContentChange = (t: string) => {
    if (t.length <= MAX_CHARS) setContent(t);
  };

  const handlePost = async () => {
    if (!canPost || !selectedPond) return;

    if (UUID_REGEX.test(selectedPond.pondId)) {
      // サーバーの池 → /ike/:ike_id/chat/message に投稿
      const token = await authStorage.getToken();
      if (token) {
        await api.post(
          `/ike/${selectedPond.pondId}/chat/message`,
          { content: content.trim() },
          token,
        );
      }
    } else {
      // ローカルの池 → AsyncStorage に保存（タイムライン表示用）
      const newPost = buildNewPost(content, selectedPond, avatarId);
      const stored = await AsyncStorage.getItem('pond_user_posts');
      const existing = stored ? JSON.parse(stored) : [];
      await AsyncStorage.setItem('pond_user_posts', JSON.stringify([newPost, ...existing]));
    }

    router.back();
  };

  return {
    ponds,
    selectedField,
    setSelectedField,
    selectedPond,
    content,
    handleContentChange,
    canPost,
    remaining,
    inputRef,
    handlePost,
    avatarId,
  };
}
