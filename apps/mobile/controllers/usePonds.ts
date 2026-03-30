import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { type PondEntry, LEVEL_ORDER } from '@/models/pond';
import { FIELD_LABELS } from '@/models/field';
import { assignPondId } from '@/models/pond-instance';

export function usePonds() {
  const [ponds, setPonds] = useState<PondEntry[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('pond_ponds').then((stored) => {
      if (!stored) return;
      const raw: Array<{ field: string; level: string; pondId?: string }> = JSON.parse(stored);
      const withId: PondEntry[] = raw.map((p) => ({
        ...p,
        pondId: p.pondId ?? assignPondId(p.field, p.level),
      })) as PondEntry[];
      setPonds(withId);
    });
  }, []);

  const handleAddPond = () => router.push('/onboarding');

  const handleReassess = (field: string) =>
    router.push({ pathname: '/assessment', params: { field } });

  const handleOpenChat = (field: string, level: string, pondId?: string) =>
    router.push({ pathname: '/pond-chat', params: { field, level, pondId: pondId ?? '' } });

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
