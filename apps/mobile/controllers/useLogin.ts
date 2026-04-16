import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { login } from '@/api/endpoints/auth';
import { fetchProfile } from '@/api/endpoints/profile';
import { authStorage } from '@/services/auth';

export function useLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async ({ em, pw }: { em: string; pw: string }) => {
      const data = await login(em, pw);
      await authStorage.setToken(data.token);
      await authStorage.setUserId(data.userId);
      try {
        await fetchProfile(data.token);
        return '/(tabs)' as const;
      } catch (e) {
        if (e instanceof Error && e.message === 'PROFILE_NOT_FOUND') return '/login' as const;
        return '/(tabs)' as const;
      }
    },
    onSuccess: (destination) => {
      router.replace(destination);
    },
    onError: (error) => {
      Alert.alert(
        'ログイン失敗',
        error instanceof Error && error.message === 'INVALID_CREDENTIALS'
          ? 'メールアドレスまたはパスワードが違います'
          : 'サーバーに接続できませんでした',
      );
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }
    loginMutation.mutate({ em: email, pw: password });
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading: loginMutation.isPending,
    handleLogin,
  };
}
