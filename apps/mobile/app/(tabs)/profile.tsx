import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Radius, Spacing, Levels } from '@/constants/theme';
import type { LevelKey } from '@/constants/theme';

function FieldIcon({ field, color = Colors.secondary, size = 20 }: { field: string; color?: string; size?: number }) {
  switch (field) {
    case 'programming': return <MaterialCommunityIcons name="code-tags" size={size} color={color} />;
    case 'math': return <MaterialCommunityIcons name="sigma" size={size} color={color} />;
    case 'english': return <Ionicons name="language" size={size} color={color} />;
    case 'art': return <Ionicons name="color-palette-outline" size={size} color={color} />;
    case 'music': return <Ionicons name="musical-notes-outline" size={size} color={color} />;
    case 'science': return <MaterialCommunityIcons name="flask-outline" size={size} color={color} />;
    default: return <Ionicons name="star-outline" size={size} color={color} />;
  }
}

const { width } = Dimensions.get('window');

type PondEntry = {
  field: string;
  level: LevelKey;
};

const FIELD_LABELS: Record<string, string> = {
  programming: 'プログラミング',
  math: '数学',
  english: '英語',
  art: 'アート',
  music: '音楽',
  science: '科学',
};


const STATS = [
  { label: '投稿数', value: '12' },
  { label: 'もらったいいね', value: '84' },
  { label: '参加チャレンジ', value: '7' },
];

export default function ProfileScreen() {
  const [ponds, setPonds] = useState<PondEntry[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('pond_ponds').then((stored) => {
      if (stored) setPonds(JSON.parse(stored));
    });
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/onboarding');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={[Colors.primaryFixed, Colors.surfaceContainerHigh]}
            style={styles.avatarLarge}
          >
            <MaterialCommunityIcons name="fishbowl-outline" size={44} color={Colors.primary} />
          </LinearGradient>
          <Text style={styles.displayName}>かわうそユーザー</Text>
          <Text style={styles.handle}>@pond_user</Text>
          <Text style={styles.bio}>学習するすべての人に、同じレベルの仲間を。</Text>
        </View>

        {/* Stats */}
        <BlurView intensity={20} tint="light" style={styles.statsCard}>
          {STATS.map((stat, i) => (
            <View key={i} style={[styles.statItem, i < STATS.length - 1 && styles.statItemBorder]}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </BlurView>

        {/* My ponds */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>所属している池</Text>
          {ponds.length === 0 ? (
            <View style={styles.noPonds}>
              <Text style={styles.noPondsText}>まだ池に入っていません</Text>
              <TouchableOpacity onPress={() => router.push('/onboarding')} style={styles.joinPondBtn}>
                <Text style={styles.joinPondBtnText}>池に入る →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            ponds.map((pond, i) => (
              <View key={i} style={styles.pondRow}>
                <View style={styles.pondRowIcon}>
                  <FieldIcon field={pond.field} color={Colors.secondary} size={20} />
                </View>
                <View style={styles.pondRowInfo}>
                  <Text style={styles.pondRowField}>{FIELD_LABELS[pond.field] ?? pond.field}</Text>
                  <Text style={styles.pondRowLevel}>{pond.level} · {Levels[pond.level]?.description}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>設定</Text>
          <View style={styles.settingsCard}>
            {[
              { icon: <Ionicons name="notifications-outline" size={20} color={Colors.onSurfaceVariant} />, label: 'プッシュ通知' },
              { icon: <Ionicons name="lock-closed-outline" size={20} color={Colors.onSurfaceVariant} />, label: 'プライバシー設定' },
              { icon: <Ionicons name="help-circle-outline" size={20} color={Colors.onSurfaceVariant} />, label: 'ヘルプ' },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={styles.settingsRow}>
                {item.icon}
                <Text style={styles.settingsLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>ログアウト（オンボーディングに戻る）</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  blob: {
    position: 'absolute',
    borderRadius: Radius.full,
    opacity: 0.3,
  },
  blob1: {
    top: -60,
    right: -30,
    width: width * 0.55,
    height: width * 0.55,
    backgroundColor: Colors.primaryFixed,
  },
  blob2: {
    top: 300,
    left: -50,
    width: width * 0.5,
    height: width * 0.5,
    backgroundColor: Colors.secondaryFixed,
  },
  content: {
    paddingTop: 72,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
  },
  profileHeader: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.lg,
  },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  avatarLargeEmoji: {
    fontSize: 40,
  },
  displayName: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 22,
    color: Colors.onSurface,
  },
  handle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  bio: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: Spacing.xs,
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: Radius.xl,
    overflow: 'hidden',
    padding: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statItemBorder: {
    borderRightWidth: 1,
    borderRightColor: `${Colors.outlineVariant}66`,
  },
  statValue: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 22,
    color: Colors.primary,
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: Colors.onSurface,
  },
  noPonds: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  noPondsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  joinPondBtn: {
    backgroundColor: Colors.primaryFixed,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  joinPondBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.primary,
  },
  pondRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  pondRowIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pondRowInfo: {
    flex: 1,
  },
  pondRowField: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: Colors.onSurface,
  },
  pondRowLevel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  settingsCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.surfaceContainerHigh}aa`,
  },
  settingsIcon: {
    fontSize: 20,
  },
  settingsLabel: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Colors.onSurface,
  },
  settingsArrow: {
    fontSize: 20,
    color: Colors.onSurfaceVariant,
  },
  logoutBtn: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  logoutText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textDecorationLine: 'underline',
  },
});
