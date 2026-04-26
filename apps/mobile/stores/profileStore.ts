import { create } from 'zustand';

type ProfileStore = {
  pickerVisible: boolean;
  openPicker: () => void;
  closePicker: () => void;
};

export const useProfileStore = create<ProfileStore>((set) => ({
  pickerVisible: false,
  openPicker: () => set({ pickerVisible: true }),
  closePicker: () => set({ pickerVisible: false }),
}));
