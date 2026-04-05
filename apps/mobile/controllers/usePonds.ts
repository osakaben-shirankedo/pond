import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { type PondEntry, LEVEL_ORDER } from '@/models/pond';
import { FIELD_LABELS } from '@/models/field';
import { assignPondId } from '@/models/pond-instance';
import { POND_UNREAD_KEY } from '@/models/notifications';
import { api } from '@/services/api';
import { authStorage } from '@/services/auth';
import type { LevelKey } from '@/constants/levels';

type ServerIke = {
  id: string;
  ike_name: string;
  description: string;
  member_ids: string[];
  chat_room_id: string;
  created_at: string;
  updated_at: string;
};

function serverIkeToPondEntry(ike: ServerIke): PondEntry {
  return {
    field: ike.ike_name,
    level: '澄み池' as LevelKey,
    pondId: ike.id,
  };
}

export function usePonds() {
  const [ponds, setPonds] = useState<PondEntry[]>([]);
  const [unreadPondIds, setUnreadPondIds] = useState<string[]>([]);

  useFocusEffect(useCallback(() => {
    (async () => {
      const [stored, unreadStored] = await Promise.all([
        AsyncStorage.getItem('pond_ponds'),
        AsyncStorage.getItem(POND_UNREAD_KEY),
      ]);

      const localRaw: Array<{ field: string; level: string; pondId?: string }> = stored
        ? JSON.parse(stored)
        : [];
      const localPonds: PondEntry[] = localRaw.map((p) => ({
        ...p,
        pondId: p.pondId ?? assignPondId(p.field, p.level),
      })) as PondEntry[];

      setUnreadPondIds(unreadStored ? JSON.parse(unreadStored) : []);

      const token = await authStorage.getToken();
      console.log('[Ponds] token exists:', !!token);
      if (token) {
        const { data, error } = await api.get<ServerIke[]>('/ike/list', token);
        console.log('[Ponds] /ike/list result:', data, 'error:', error);
        if (data && data.length > 0) {
          const serverPonds = data.map(serverIkeToPondEntry);
          const localPondIds = new Set(localPonds.map((p) => p.pondId));
          const mergedServerPonds = serverPonds.filter((p) => !localPondIds.has(p.pondId));
          setPonds([...localPonds, ...mergedServerPonds]);
          return;
        }
      }
      setPonds(localPonds);
    })();
  }, []));

  const handleAddPond = () => router.push('/');

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
    unreadPondIds,
    LEVEL_ORDER,
    unexploredFields,
    handleAddPond,
    handleReassess,
    handleOpenChat,
    handleExplore,
  };
}
