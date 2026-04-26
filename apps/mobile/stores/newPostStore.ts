import { create } from 'zustand';

type NewPostStore = {
  selectedField: string | null;
  content: string;
  setSelectedField: (field: string | null) => void;
  setContent: (content: string) => void;
  reset: () => void;
};

export const useNewPostStore = create<NewPostStore>((set) => ({
  selectedField: null,
  content: '',
  setSelectedField: (selectedField) => set({ selectedField }),
  setContent: (content) => set({ content }),
  reset: () => set({ selectedField: null, content: '' }),
}));
