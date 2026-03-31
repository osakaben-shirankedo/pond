import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { type PondEntry } from '@/models/pond';
import { buildStats, SETTINGS_ITEMS, DEFAULT_AVATAR_ID } from '@/models/profile';
import { POND_POINTS_KEY } from '@/models/points';
import { api } from '@/services/api';
import { authStorage } from '@/services/auth';

type ServerProfile = {
  id: string;
  user_id: string;
  handle: string;
  name: string;
  bio: string;
  avatar: string;
};

export function useProfile() {
  const [ponds, setPonds] = useState<PondEntry[]>([]);
  const [avatarId, setAvatarId] = useState(DEFAULT_AVATAR_ID);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [profile, setProfile] = useState<ServerProfile | null>(null);
  const [myPoints, setMyPoints] = useState(0);

  useFocusEffect(useCallback(() => {
    Promise.all([
      AsyncStorage.getItem('pond_ponds'),
      AsyncStorage.getItem('pond_avatar'),
      AsyncStorage.getItem(POND_POINTS_KEY),
      authStorage.getToken(),
    ]).then(([pondStored, avatarStored, pointsStored, token]) => {
      if (pondStored) setPonds(JSON.parse(pondStored));
      if (avatarStored) setAvatarId(avatarStored);
      if (pointsStored) setMyPoints(parseInt(pointsStored, 10));

      if (token) {
        api.get<ServerProfile>('/profile', token).then(({ data }) => {
          if (data) {
            setProfile(data);
            if (data.avatar && data.avatar !== '') setAvatarId(data.avatar);
          }
        });
      }
    });
  }, []));

  const selectAvatar = async (id: string) => {
    setAvatarId(id);
    await AsyncStorage.setItem('pond_avatar', id);

    // サーバーのプロフィールも更新
    const token = await authStorage.getToken();
    if (token) {
      await api.post('/profile/edit', { avatar: id }, token);
    }
  };

  const handleLogout = async () => {
    const token = await authStorage.getToken();
    if (token) {
      await api.post('/logout', {}, token);
    }
    await authStorage.clear();
    await AsyncStorage.clear();
    router.replace('/login');
  };

  const handleJoinPond = () => router.push('/onboarding');

  return {
    ponds,
    avatarId,
    pickerVisible,
    profile,
    myPoints,
    openPicker: () => setPickerVisible(true),
    closePicker: () => setPickerVisible(false),
    selectAvatar,
    STATS: buildStats(myPoints),
    SETTINGS_ITEMS,
    handleLogout,
    handleJoinPond,
    displayName: profile?.name ?? 'ユーザー',
    handle: profile?.handle ? `@${profile.handle}` : '',
    bio: profile?.bio ?? '',
  };
}
