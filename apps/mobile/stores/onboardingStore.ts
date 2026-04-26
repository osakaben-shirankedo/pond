import { create } from 'zustand';
import type { FieldId } from '@/constants/fields';

type OnboardingStore = {
  selected: FieldId[];
  toggle: (id: FieldId) => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  selected: [],
  toggle: (id) =>
    set((s) => ({
      selected: s.selected.includes(id)
        ? s.selected.filter((f) => f !== id)
        : [...s.selected, id],
    })),
  reset: () => set({ selected: [] }),
}));
