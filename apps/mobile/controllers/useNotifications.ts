import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Notification, NOTIFICATIONS_KEY, SEED_NOTIFICATIONS } from '@/models/notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(SEED_NOTIFICATIONS);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(NOTIFICATIONS_KEY).then((stored) => {
        if (stored) setNotifications(JSON.parse(stored));
      });
    }, [])
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  };

  return { notifications, unreadCount, markAllRead };
}
