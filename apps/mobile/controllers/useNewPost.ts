import { useState, useEffect, useRef } from 'react';
import { TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { type PondEntry, MAX_CHARS, buildNewPost } from '@/models/new-post';
import { usePostTimelineMutation } from '@/api';
import { authStorage } from '@/services/auth';

export function useNewPost() {
  const [ponds, setPonds] = useState<PondEntry[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [avatarId, setAvatarId] = useState('fishbowl');
  const inputRef = useRef<TextInput>(null);

  const postMutation = usePostTimelineMutation();

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

    const token = await authStorage.getToken();

    if (token) {
      await postMutation.mutateAsync({
        ike_id: selectedPond.pondId,
        ike_category: selectedPond.field,
        content: content.trim(),
      });
    } else {
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
