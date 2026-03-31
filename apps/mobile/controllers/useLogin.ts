import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { api } from '@/services/api';
import { authStorage } from '@/services/auth';

export function useLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }
    setLoading(true);
    const { data, error } = await api.post<{ token: string; userId: string }>('/login', { email, password });
    if (error || !data) {
      setLoading(false);
      Alert.alert(
        'ログイン失敗',
        error === 'INVALID_CREDENTIALS' ? 'メールアドレスまたはパスワードが違います' : 'サーバーに接続できませんでした'
      );
      return;
    }
    await authStorage.setToken(data.token);
    await authStorage.setUserId(data.userId);

    // プロフィールが存在するか確認してナビゲート
    const { error: profileError } = await api.get('/profile', data.token);
    setLoading(false);
    if (profileError === 'PROFILE_NOT_FOUND') {
      router.replace('/onboarding');
    } else {
      router.replace('/(tabs)');
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    handleLogin,
  };
}
