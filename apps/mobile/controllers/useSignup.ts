import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { register, login as loginFn, registerProfile } from '@/api/endpoints/auth';
import { authStorage } from '@/services/auth';
import { useSignupStore, useUserStore } from '@/stores';

export function useSignup() {
  const {
    userId, name, email, password, confirmPassword,
    showPassword, showConfirmPassword,
    setUserId, setName, setEmail, setPassword, setConfirmPassword,
    setShowPassword, setShowConfirmPassword,
    reset,
  } = useSignupStore();

  const signupMutation = useMutation({
    mutationFn: async (params: {
      userId: string; name: string; email: string; password: string;
    }) => {
      await register({
        user_id: params.userId,
        email: params.email,
        password: params.password,
        nickname: params.name,
      });
      const loginData = await loginFn(params.email, params.password);
      await authStorage.setToken(loginData.token);
      await authStorage.setUserId(loginData.userId);
      useUserStore.getState().setUserId(loginData.userId);
      await registerProfile({ name: params.name }, loginData.token);
    },
    onSuccess: () => {
      reset();
      router.replace('/onboarding');
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : '';
      Alert.alert(
        '登録失敗',
        msg === 'EMAIL_ALREADY_EXISTS'
          ? 'このメールアドレスは既に使われています'
          : msg === 'USER_ID_ALREADY_EXISTS'
            ? 'このユーザーIDは既に使われています'
            : '入力内容を確認するか、しばらく経ってからやり直してください',
      );
    },
  });

  const handleSignup = () => {
    if (!userId || !name || !email || !password || !confirmPassword) {
      Alert.alert('エラー', 'すべての項目を入力してください');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(userId)) {
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
    signupMutation.mutate({ userId, name, email, password });
  };

  return {
    name, setName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword,
    loading: signupMutation.isPending,
    handleSignup,
    userId, setUserId,
  };
}
