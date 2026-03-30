import { useState, useEffect, useRef } from 'react';
import { TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { type PondEntry, MAX_CHARS, buildNewPost } from '@/models/new-post';

export function useNewPost() {
  const [ponds, setPonds] = useState<PondEntry[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    AsyncStorage.getItem('pond_ponds').then((stored) => {
      if (stored) {
        const loaded: PondEntry[] = JSON.parse(stored);
        setPonds(loaded);
        if (loaded.length > 0) setSelectedField(loaded[0].field);
      }
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
    const newPost = buildNewPost(content, selectedPond);
    const stored = await AsyncStorage.getItem('pond_user_posts');
    const existing = stored ? JSON.parse(stored) : [];
    await AsyncStorage.setItem('pond_user_posts', JSON.stringify([newPost, ...existing]));
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
  };
}
