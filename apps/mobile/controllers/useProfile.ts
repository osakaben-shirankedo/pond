import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { type PondEntry } from '@/models/pond';
import { STATS, SETTINGS_ITEMS, DEFAULT_AVATAR_ID } from '@/models/profile';

export function useProfile() {
  const [ponds, setPonds] = useState<PondEntry[]>([]);
  const [avatarId, setAvatarId] = useState(DEFAULT_AVATAR_ID);
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('pond_ponds'),
      AsyncStorage.getItem('pond_avatar'),
    ]).then(([pondStored, avatarStored]) => {
      if (pondStored) setPonds(JSON.parse(pondStored));
      if (avatarStored) setAvatarId(avatarStored);
    });
  }, []);

  const selectAvatar = async (id: string) => {
    setAvatarId(id);
    await AsyncStorage.setItem('pond_avatar', id);
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/onboarding');
  };

  const handleJoinPond = () => router.push('/onboarding');

  return {
    ponds,
    avatarId,
    pickerVisible,
    openPicker: () => setPickerVisible(true),
    closePicker: () => setPickerVisible(false),
    selectAvatar,
    STATS,
    SETTINGS_ITEMS,
    handleLogout,
    handleJoinPond,
  };
}
