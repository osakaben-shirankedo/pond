import { create } from 'zustand';
import type { PondEntry } from '@/models/pond';

type UserStore = {
  userId: string;
  avatarId: string;
  ponds: PondEntry[];
  unreadPondIds: string[];
  setUserId: (id: string) => void;
  setAvatarId: (id: string) => void;
  setPonds: (ponds: PondEntry[]) => void;
  addPond: (pond: PondEntry) => void;
  removePond: (pondId: string, field?: string) => void;
  setUnreadPondIds: (ids: string[]) => void;
  markPondUnread: (pondId: string) => void;
  clearPondUnread: (pondId: string) => void;
  reset: () => void;
};

const INITIAL: Pick<UserStore, 'userId' | 'avatarId' | 'ponds' | 'unreadPondIds'> = {
  userId: '',
  avatarId: 'fishbowl',
  ponds: [],
  unreadPondIds: [],
};

export const useUserStore = create<UserStore>((set) => ({
  ...INITIAL,
  setUserId: (userId) => set({ userId }),
  setAvatarId: (avatarId) => set({ avatarId }),
  setPonds: (ponds) => set({ ponds }),
  addPond: (pond) =>
    set((s) => ({
      ponds: [...s.ponds.filter((p) => p.field !== pond.field), pond],
    })),
  removePond: (pondId, field) =>
    set((s) => ({
      ponds: s.ponds.filter((p) => !(p.pondId === pondId || p.field === field)),
    })),
  setUnreadPondIds: (unreadPondIds) => set({ unreadPondIds }),
  markPondUnread: (pondId) =>
    set((s) => ({
      unreadPondIds: s.unreadPondIds.includes(pondId)
        ? s.unreadPondIds
        : [...s.unreadPondIds, pondId],
    })),
  clearPondUnread: (pondId) =>
    set((s) => ({
      unreadPondIds: s.unreadPondIds.filter((id) => id !== pondId),
    })),
  reset: () => set(INITIAL),
}));
