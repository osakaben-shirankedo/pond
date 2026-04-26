import { useMemo } from 'react';
import { router } from 'expo-router';
import { type PondEntry, LEVEL_ORDER } from '@/models/pond';
import { FIELD_LABELS } from '@/models/field';
import { usePondListQuery, type ServerPond } from '@/api';
import type { LevelKey } from '@/constants/levels';
import { useUserStore } from '@/stores';

function serverPondToPondEntry(pond: ServerPond): PondEntry {
  return {
    field: pond.name,
    level: '澄み池' as LevelKey,
    pondId: pond.id,
  };
}

export function usePonds() {
  const { ponds: localPonds, unreadPondIds } = useUserStore();

  const { data: serverPonds } = usePondListQuery();

  // ローカル池とサーバー池をマージ（サーバーが優先）
  const ponds = useMemo(() => {
    if (serverPonds && serverPonds.length > 0) {
      const mapped = serverPonds.map(serverPondToPondEntry);
      const localPondIds = new Set(localPonds.map((p) => p.pondId));
      const serverOnly = mapped.filter((p) => !localPondIds.has(p.pondId));
      return [...localPonds, ...serverOnly];
    }
    return localPonds;
  }, [localPonds, serverPonds]);

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
