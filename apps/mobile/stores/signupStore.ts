import { create } from 'zustand';

type SignupStore = {
  userId: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  setUserId: (id: string) => void;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
  reset: () => void;
};

const INITIAL = {
  userId: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  showPassword: false,
  showConfirmPassword: false,
};

export const useSignupStore = create<SignupStore>((set) => ({
  ...INITIAL,
  setUserId: (userId) => set({ userId }),
  setName: (name) => set({ name }),
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  setConfirmPassword: (confirmPassword) => set({ confirmPassword }),
  setShowPassword: (showPassword) => set({ showPassword }),
  setShowConfirmPassword: (showConfirmPassword) => set({ showConfirmPassword }),
  reset: () => set(INITIAL),
}));
