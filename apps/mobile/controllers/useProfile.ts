import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { type PondEntry } from '@/models/pond';
import { STATS, SETTINGS_ITEMS } from '@/models/profile';

export function useProfile() {
  const [ponds, setPonds] = useState<PondEntry[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('pond_ponds').then((stored) => {
      if (stored) setPonds(JSON.parse(stored));
    });
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/onboarding');
  };

  const handleJoinPond = () => router.push('/onboarding');

  return { ponds, STATS, SETTINGS_ITEMS, handleLogout, handleJoinPond };
}
