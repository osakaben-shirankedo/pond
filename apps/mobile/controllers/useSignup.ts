import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { api } from '@/services/api';
import { authStorage } from '@/services/auth';

export function useSignup() {
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!userId || !name || !email || !password || !confirmPassword) {
      Alert.alert('エラー', 'すべての項目を入力してください');
      return;
    }
    const idRegex = /^[a-zA-Z0-9_]+$/;
    if (!idRegex.test(userId)) {
      Alert.alert('エラー', 'ユーザーIDは半角英数字とアンダースコアのみ使用できます');
      return;
    }
    if (userId.length < 4 || userId.length > 20) {
      Alert.alert('エラー', 'ユーザーIDは4文字以上20文字以下にしてください');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('エラー', 'パスワードが一致しません');
      return;
    }
    if (password.length < 8) {
      Alert.alert('エラー', 'パスワードは8文字以上にしてください');
      return;
    }

    setLoading(true);

    // 1. アカウント登録
    const { error: registerError } = await api.post('/register', {
      user_id: userId,
      email,
      password,
      nickname: name,
    });
    if (registerError) {
      setLoading(false);
      Alert.alert(
        '登録失敗',
        registerError === 'EMAIL_ALREADY_EXISTS'
          ? 'このメールアドレスは既に使われています'
          : registerError === 'USER_ID_ALREADY_EXISTS'
          ? 'このユーザーIDは既に使われています'
          : '入力内容を確認するか、しばらく経ってからやり直してください'
      );
      return;
    }

    // 2. ログインしてトークン取得
    const { data: loginData, error: loginError } = await api.post<{ token: string }>('/login', {
      email,
      password,
    });
    if (loginError || !loginData) {
      setLoading(false);
      Alert.alert('エラー', 'ログインに失敗しました。再度ログインしてください');
      router.replace('/login');
      return;
    }
    await authStorage.setToken(loginData.token);

    // 3. プロフィール作成（名前だけ）
    await api.post('/register/profile', { name }, loginData.token);

    setLoading(false);
    router.replace('/onboarding');
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    handleSignup,
    userId,
    setUserId,
  };
}
