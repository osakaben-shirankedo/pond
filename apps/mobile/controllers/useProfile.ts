import { useEffect } from 'react';
import { router } from 'expo-router';
import { buildStats, SETTINGS_ITEMS } from '@/models/profile';
import { useProfileQuery, useEditProfileMutation, queryClient } from '@/api';
import { logout } from '@/api/endpoints/auth';
import { authStorage } from '@/services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore, useProfileStore, useChallengesStore, useNotificationsStore } from '@/stores';

export function useProfile() {
  const { ponds, avatarId, setAvatarId } = useUserStore();
  const { points } = useChallengesStore();
  const { pickerVisible, openPicker, closePicker } = useProfileStore();

  const { data: profile } = useProfileQuery();
  const editProfileMutation = useEditProfileMutation();

  // サーバープロフィールのアバターをストアに同期
  useEffect(() => {
    if (profile?.avatar && profile.avatar !== '' && avatarId !== profile.avatar) {
      setAvatarId(profile.avatar);
    }
  }, [profile?.avatar, avatarId, setAvatarId]);

  const selectAvatar = async (id: string) => {
    setAvatarId(id);
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
    useUserStore.getState().reset();
    useNotificationsStore.setState({ notifications: [] });
    useChallengesStore.getState().reset();
    router.replace('/login');
  };

  const handleJoinPond = () => router.push('/onboarding');

  return {
    ponds,
    avatarId,
    pickerVisible,
    profile: profile ?? null,
    myPoints: points,
    openPicker,
    closePicker,
    selectAvatar,
    STATS: buildStats(points),
    SETTINGS_ITEMS,
    handleLogout,
    handleJoinPond,
    handle: profile?.handle ? `@${profile.handle}` : '',
  };
}
