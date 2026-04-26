import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Notification, SEED_NOTIFICATIONS } from '@/models/notifications';

type NotificationsStore = {
  notifications: Notification[];
  setNotifications: (n: Notification[]) => void;
  addNotification: (notif: Omit<Notification, 'id' | 'time' | 'read'>) => void;
  markAllRead: () => void;
};

export const useNotificationsStore = create<NotificationsStore>()(
  persist(
    (set) => ({
      notifications: SEED_NOTIFICATIONS,
      setNotifications: (notifications) => set({ notifications }),
      addNotification: (notif) =>
        set((s) => ({
          notifications: [
            {
              ...notif,
              id: `notif-${Date.now()}`,
              time: 'たった今',
              read: false,
            },
            ...s.notifications,
          ],
        })),
      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
    }),
    {
      name: 'pond-notifications',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
