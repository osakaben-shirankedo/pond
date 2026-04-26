import { create } from 'zustand';
import type { ChallengeParticipant, MySubmissionResult } from '@/models/challenges';

type ChallengeSubmitStore = {
  answer: string;
  result: MySubmissionResult | null;
  showSubmissions: boolean;
  participants: ChallengeParticipant[];
  isParticipating: boolean;
  setAnswer: (answer: string) => void;
  setResult: (result: MySubmissionResult | null) => void;
  setShowSubmissions: (show: boolean) => void;
  setParticipants: (participants: ChallengeParticipant[]) => void;
  setIsParticipating: (isParticipating: boolean) => void;
  reset: () => void;
};

export const useChallengeSubmitStore = create<ChallengeSubmitStore>((set) => ({
  answer: '',
  result: null,
  showSubmissions: false,
  participants: [],
  isParticipating: false,
  setAnswer: (answer) => set({ answer }),
  setResult: (result) => set({ result }),
  setShowSubmissions: (showSubmissions) => set({ showSubmissions }),
  setParticipants: (participants) => set({ participants }),
  setIsParticipating: (isParticipating) => set({ isParticipating }),
  reset: () =>
    set({ answer: '', result: null, showSubmissions: false, participants: [], isParticipating: false }),
}));
