import { create } from 'zustand';
import type { Message } from '@/models/assessment';
import type { LevelKey } from '@/constants/levels';

type AssessmentStore = {
  messages: Message[];
  stepIndex: number;
  answers: number[];
  done: boolean;
  level: LevelKey | null;
  judgedLevel: LevelKey | null;
  purposeSelected: boolean;
  diving: boolean;
  assignedPondId: string | null;
  setMessages: (msgs: Message[] | ((prev: Message[]) => Message[])) => void;
  setStepIndex: (index: number) => void;
  setAnswers: (answers: number[]) => void;
  setDone: (done: boolean) => void;
  setLevel: (level: LevelKey | null) => void;
  setJudgedLevel: (level: LevelKey | null) => void;
  setPurposeSelected: (selected: boolean) => void;
  setDiving: (diving: boolean) => void;
  setAssignedPondId: (id: string | null) => void;
  reset: (initialMessage: Message) => void;
};

export const useAssessmentStore = create<AssessmentStore>((set) => ({
  messages: [],
  stepIndex: 0,
  answers: [],
  done: false,
  level: null,
  judgedLevel: null,
  purposeSelected: false,
  diving: false,
  assignedPondId: null,
  setMessages: (msgs) =>
    set((s) => ({ messages: typeof msgs === 'function' ? msgs(s.messages) : msgs })),
  setStepIndex: (stepIndex) => set({ stepIndex }),
  setAnswers: (answers) => set({ answers }),
  setDone: (done) => set({ done }),
  setLevel: (level) => set({ level }),
  setJudgedLevel: (judgedLevel) => set({ judgedLevel }),
  setPurposeSelected: (purposeSelected) => set({ purposeSelected }),
  setDiving: (diving) => set({ diving }),
  setAssignedPondId: (assignedPondId) => set({ assignedPondId }),
  reset: (initialMessage) =>
    set({
      messages: [initialMessage],
      stepIndex: 0,
      answers: [],
      done: false,
      level: null,
      judgedLevel: null,
      purposeSelected: false,
      diving: false,
      assignedPondId: null,
    }),
}));
