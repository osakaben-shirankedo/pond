import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MySubmissionResult } from '@/models/challenges';

type ChallengesStore = {
  joinedIds: string[];
  participatingIds: string[];
  submissionsMap: Record<string, MySubmissionResult>;
  userFieldIds: string[];
  points: number;
  setJoinedIds: (ids: string[]) => void;
  addJoinedId: (id: string) => void;
  removeJoinedId: (id: string) => void;
  addParticipatingId: (id: string) => void;
  removeParticipatingId: (id: string) => void;
  setSubmissionsMap: (map: Record<string, MySubmissionResult>) => void;
  addSubmission: (challengeId: string, result: MySubmissionResult) => void;
  setUserFieldIds: (ids: string[]) => void;
  addPoints: (n: number) => void;
  reset: () => void;
};

const INITIAL: Pick<
  ChallengesStore,
  'joinedIds' | 'participatingIds' | 'submissionsMap' | 'userFieldIds' | 'points'
> = {
  joinedIds: [],
  participatingIds: [],
  submissionsMap: {},
  userFieldIds: [],
  points: 0,
};

export const useChallengesStore = create<ChallengesStore>()(
  persist(
    (set) => ({
      ...INITIAL,
      setJoinedIds: (joinedIds) => set({ joinedIds }),
      addJoinedId: (id) =>
        set((s) => ({ joinedIds: s.joinedIds.includes(id) ? s.joinedIds : [...s.joinedIds, id] })),
      removeJoinedId: (id) =>
        set((s) => ({ joinedIds: s.joinedIds.filter((j) => j !== id) })),
      addParticipatingId: (id) =>
        set((s) => ({
          participatingIds: s.participatingIds.includes(id)
            ? s.participatingIds
            : [...s.participatingIds, id],
        })),
      removeParticipatingId: (id) =>
        set((s) => ({ participatingIds: s.participatingIds.filter((p) => p !== id) })),
      setSubmissionsMap: (submissionsMap) => set({ submissionsMap }),
      addSubmission: (challengeId, result) =>
        set((s) => ({ submissionsMap: { ...s.submissionsMap, [challengeId]: result } })),
      setUserFieldIds: (userFieldIds) => set({ userFieldIds }),
      addPoints: (n) => set((s) => ({ points: s.points + n })),
      reset: () => set(INITIAL),
    }),
    {
      name: 'pond-challenges',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
