import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { type PondEntry } from '@/models/pond';
import { buildStats, SETTINGS_ITEMS, DEFAULT_AVATAR_ID } from '@/models/profile';
import { POND_POINTS_KEY } from '@/models/points';
import { useProfileQuery, useEditProfileMutation, queryClient } from '@/api';
import { logout } from '@/api/endpoints/auth';
import { authStorage } from '@/services/auth';

export function useProfile() {
  const [ponds, setPonds] = useState<PondEntry[]>([]);
  const [avatarId, setAvatarId] = useState(DEFAULT_AVATAR_ID);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [myPoints, setMyPoints] = useState(0);

  const { data: profile } = useProfileQuery();
  const editProfileMutation = useEditProfileMutation();

  useFocusEffect(useCallback(() => {
    Promise.all([
      AsyncStorage.getItem('pond_ponds'),
      AsyncStorage.getItem('pond_avatar'),
      AsyncStorage.getItem(POND_POINTS_KEY),
    ]).then(([pondStored, avatarStored, pointsStored]) => {
      if (pondStored) setPonds(JSON.parse(pondStored));
      if (pointsStored) setMyPoints(parseInt(pointsStored, 10));
      // サーバーのアバターが優先されるが、ロード前のフォールバックとしてローカルを使用
      if (avatarStored && !profile?.avatar) setAvatarId(avatarStored);
    });
  }, [profile?.avatar]));

  // サーバープロフィールが取得できたらアバターを同期
  if (profile?.avatar && profile.avatar !== '' && avatarId !== profile.avatar) {
    setAvatarId(profile.avatar);
  }

  const selectAvatar = async (id: string) => {
    setAvatarId(id);
    await AsyncStorage.setItem('pond_avatar', id);
    await editProfileMutation.mutateAsync({ avatar: id });
  };

  const handleLogout = async () => {
    const token = await authStorage.getToken();
    if (token) {
      await logout(token);
    }
    queryClient.clear();
    await authStorage.clear();
    await AsyncStorage.clear();
    router.replace('/login');
  };

  const handleJoinPond = () => router.push('/onboarding');

  return {
    ponds,
    avatarId,
    pickerVisible,
    profile: profile ?? null,
    myPoints,
    openPicker: () => setPickerVisible(true),
    closePicker: () => setPickerVisible(false),
    selectAvatar,
    STATS: buildStats(myPoints),
    SETTINGS_ITEMS,
    handleLogout,
    handleJoinPond,
    handle: profile?.handle ? `@${profile.handle}` : '',
  };
}
