import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
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

export default function LoginScreen() {
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
    const { data, error } = await api.post<{ token: string }>('/login', { email, password });
    if (error || !data) {
      setLoading(false);
      Alert.alert('ログイン失敗', error === 'INVALID_CREDENTIALS' ? 'メールアドレスまたはパスワードが違います' : 'サーバーに接続できませんでした');
      return;
    }
    await authStorage.setToken(data.token);

    // プロフィールが存在するか確認してナビゲート
    const { error: profileError } = await api.get('/profile', data.token);
    setLoading(false);
    if (profileError === 'PROFILE_NOT_FOUND') {
      router.replace('/onboarding');
    } else {
      router.replace('/(tabs)');
    }
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
        {/* Logo / title */}
        <View style={styles.header}>
          <Ionicons name="water" size={48} color={Colors.primary} />
          <Text style={styles.appName}>pond</Text>
          <Text style={styles.tagline}>同じレベルの仲間と、一緒に学ぼう。</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ログイン</Text>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>メールアドレス</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={Colors.onSurfaceVariant} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="user1@example.com"
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
                placeholder="password123"
                placeholderTextColor={Colors.outlineVariant}
                secureTextEntry={!showPassword}
                autoComplete="password"
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

          {/* Forgot password */}
          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgotText}>パスワードを忘れた方</Text>
          </TouchableOpacity>

          {/* Login button */}
          <TouchableOpacity style={styles.loginBtn} activeOpacity={0.85} onPress={handleLogin} disabled={loading}>
            <LinearGradient
              colors={[Colors.primaryContainer, Colors.primary]}
              style={styles.loginBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {loading
                ? <ActivityIndicator color={Colors.onPrimary} />
                : <Text style={styles.loginBtnText}>ログイン</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>または</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign up */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>アカウントをお持ちでない方は</Text>
            <TouchableOpacity hitSlop={8} onPress={() => router.push('/signup')}>
              <Text style={styles.signupLink}>新規登録</Text>
            </TouchableOpacity>
          </View>

          {/* Guest */}
          <TouchableOpacity style={styles.guestBtn} activeOpacity={0.7} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.guestBtnText}>ゲストで入る</Text>
          </TouchableOpacity>
        </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
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
  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.sm,
  },
  forgotText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  loginBtn: {
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  loginBtnGradient: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
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
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  signupText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  signupLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.primary,
  },
  guestBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  guestBtnText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textDecorationLine: 'underline',
  },
});
