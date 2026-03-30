import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { type PondEntry, LEVEL_ORDER } from '@/models/pond';
import { FIELD_LABELS } from '@/models/field';

export function usePonds() {
  const [ponds, setPonds] = useState<PondEntry[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('pond_ponds').then((stored) => {
      if (stored) setPonds(JSON.parse(stored));
    });
  }, []);

  const handleAddPond = () => router.push('/onboarding');

  const handleReassess = (field: string) =>
    router.push({ pathname: '/assessment', params: { field } });

  const handleOpenChat = (field: string, level: string) =>
    router.push({ pathname: '/pond-chat', params: { field, level } });

  const handleExplore = (fieldId: string) =>
    router.push({ pathname: '/assessment', params: { field: fieldId } });

  const unexploredFields = Object.keys(FIELD_LABELS).filter(
    (id) => !ponds.find((p) => p.field === id)
  );

  return {
    ponds,
    LEVEL_ORDER,
    unexploredFields,
    handleAddPond,
    handleReassess,
    handleOpenChat,
    handleExplore,
  };
}
