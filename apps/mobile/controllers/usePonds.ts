import { useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { type PondEntry, LEVEL_ORDER } from '@/models/pond';
import { FIELD_LABELS } from '@/models/field';
import { assignPondId } from '@/models/pond-instance';
import { POND_UNREAD_KEY } from '@/models/notifications';
import { useIkeListQuery, type ServerIke } from '@/api';
import type { LevelKey } from '@/constants/levels';

function serverIkeToPondEntry(ike: ServerIke): PondEntry {
  return {
    field: ike.ike_name,
    level: '澄み池' as LevelKey,
    pondId: ike.id,
  };
}

export function usePonds() {
  const [localPonds, setLocalPonds] = useState<PondEntry[]>([]);
  const [unreadPondIds, setUnreadPondIds] = useState<string[]>([]);

  const { data: serverIkes } = useIkeListQuery();

  useFocusEffect(useCallback(() => {
    (async () => {
      const [stored, unreadStored] = await Promise.all([
        AsyncStorage.getItem('pond_ponds'),
        AsyncStorage.getItem(POND_UNREAD_KEY),
      ]);

      const localRaw: { field: string; level: string; pondId?: string }[] = stored
        ? JSON.parse(stored)
        : [];
      const loaded: PondEntry[] = localRaw.map((p) => ({
        ...p,
        pondId: p.pondId ?? assignPondId(p.field, p.level),
      })) as PondEntry[];

      setLocalPonds(loaded);
      setUnreadPondIds(unreadStored ? JSON.parse(unreadStored) : []);
    })();
  }, []));

  // ローカル池とサーバー池をマージ（サーバーが優先）
  const ponds = useMemo(() => {
    if (serverIkes && serverIkes.length > 0) {
      const serverPonds = serverIkes.map(serverIkeToPondEntry);
      const localPondIds = new Set(localPonds.map((p) => p.pondId));
      const serverOnly = serverPonds.filter((p) => !localPondIds.has(p.pondId));
      return [...localPonds, ...serverOnly];
    }
    return localPonds;
  }, [localPonds, serverIkes]);

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
