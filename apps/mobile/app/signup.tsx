import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { api } from '@/services/api';
import { authStorage } from '@/services/auth';

const { width } = Dimensions.get('window');

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('エラー', 'すべての項目を入力してください');
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
          : 'サーバーに接続できませんでした',
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

  return (
    <LinearGradient
      colors={[Colors.surfaceContainerLowest, Colors.primaryFixed]}
      style={styles.gradient}
      start={{ x: 0.3, y: 0 }}
      end={{ x: 0.7, y: 1 }}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo / title */}
          <View style={styles.header}>
            <Ionicons name="water" size={48} color={Colors.primary} />
            <Text style={styles.appName}>pond</Text>
            <Text style={styles.tagline}>同じレベルの仲間と、一緒に学ぼう。</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>新規登録</Text>

            {/* Name */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>ニックネーム</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={18} color={Colors.onSurfaceVariant} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="例：かわうそユーザー"
                  placeholderTextColor={Colors.outlineVariant}
                  autoCapitalize="none"
                  autoComplete="name"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>メールアドレス</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={Colors.onSurfaceVariant} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="user@example.com"
                  placeholderTextColor={Colors.outlineVariant}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>パスワード</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.onSurfaceVariant} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputPassword]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="8文字以上"
                  placeholderTextColor={Colors.outlineVariant}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn} hitSlop={8}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={Colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>パスワード（確認）</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.onSurfaceVariant} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputPassword]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="もう一度入力"
                  placeholderTextColor={Colors.outlineVariant}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(v => !v)} style={styles.eyeBtn} hitSlop={8}>
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={Colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms */}
            <Text style={styles.terms}>
              登録することで、
              <Text style={styles.termsLink}>利用規約</Text>
              {'・'}
              <Text style={styles.termsLink}>プライバシーポリシー</Text>
              に同意したものとみなします。
            </Text>

            {/* Signup button */}
            <TouchableOpacity style={styles.signupBtn} activeOpacity={0.85} onPress={handleSignup} disabled={loading}>
              <LinearGradient
                colors={[Colors.primaryContainer, Colors.primary]}
                style={styles.signupBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {loading
                  ? <ActivityIndicator color={Colors.onPrimary} />
                  : <Text style={styles.signupBtnText}>アカウントを作成</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>または</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Back to login */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>すでにアカウントをお持ちの方は</Text>
              <TouchableOpacity hitSlop={8} onPress={() => router.push('/login')}>
                <Text style={styles.loginLink}>ログイン</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scroll: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    gap: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  appName: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 36,
    color: Colors.primary,
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  card: {
    width: Math.min(width - Spacing.lg * 2, 400),
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  cardTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 20,
    color: Colors.onSurface,
  },
  field: {
    gap: Spacing.xs,
  },
  fieldLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.onSurface,
    height: '100%',
  },
  inputPassword: {
    paddingRight: Spacing.sm,
  },
  eyeBtn: {
    padding: 4,
  },
  terms: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
    textAlign: 'center',
  },
  termsLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  signupBtn: {
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  signupBtnGradient: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupBtnText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: Colors.onPrimary,
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.outlineVariant,
  },
  dividerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  loginText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  loginLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.primary,
  },
});
