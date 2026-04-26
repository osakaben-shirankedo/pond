import { create } from 'zustand';

type LoginStore = {
  email: string;
  password: string;
  showPassword: boolean;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setShowPassword: (show: boolean) => void;
  reset: () => void;
};

export const useLoginStore = create<LoginStore>((set) => ({
  email: '',
  password: '',
  showPassword: false,
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  setShowPassword: (showPassword) => set({ showPassword }),
  reset: () => set({ email: '', password: '', showPassword: false }),
}));
