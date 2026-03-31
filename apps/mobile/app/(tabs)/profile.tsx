import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Levels } from '@/constants/theme';
import { FieldIcon } from '@/components/ui/field-icon';
import { AvatarSprite } from '@/components/avatar-sprite';
import { AvatarPicker } from '@/components/avatar-picker';
import { FIELD_LABELS } from '@/models/field';
import { useProfile } from '@/controllers/useProfile';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const {
    ponds, avatarId, pickerVisible,
    openPicker, closePicker, selectAvatar,
    STATS, SETTINGS_ITEMS, handleLogout, handleJoinPond,
    displayName, handle, bio,
  } = useProfile();

  return (
    <View style={styles.container}>
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={openPicker} activeOpacity={0.85} style={styles.avatarWrapper}>
            <LinearGradient colors={[Colors.primaryFixed, Colors.surfaceContainerHigh]} style={styles.avatarLarge}>
              <AvatarSprite presetId={avatarId} size={56} />
            </LinearGradient>
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={11} color={Colors.onPrimary} />
            </View>
          </TouchableOpacity>
          <Text style={styles.displayName}>{displayName}</Text>
          {handle ? <Text style={styles.handle}>{handle}</Text> : null}
          {bio ? <Text style={styles.bio}>{bio}</Text> : null}
        </View>

        <AvatarPicker
          visible={pickerVisible}
          selectedId={avatarId}
          onSelect={selectAvatar}
          onClose={closePicker}
        />

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
              <TouchableOpacity onPress={handleJoinPond} style={styles.joinPondBtn}>
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
            {SETTINGS_ITEMS.map((item, i) => (
              <TouchableOpacity key={i} style={styles.settingsRow}>
                <Ionicons name={item.iconName} size={20} color={Colors.onSurfaceVariant} />
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
  container: { flex: 1, backgroundColor: Colors.surface },
  blob: { position: 'absolute', borderRadius: Radius.full, opacity: 0.3 },
  blob1: { top: -60, right: -30, width: width * 0.55, height: width * 0.55, backgroundColor: Colors.primaryFixed },
  blob2: { top: 300, left: -50, width: width * 0.5, height: width * 0.5, backgroundColor: Colors.secondaryFixed },
  content: { paddingTop: 72, paddingHorizontal: Spacing.lg, gap: Spacing.xl },
  profileHeader: { alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.lg },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  displayName: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22, color: Colors.onSurface },
  handle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant },
  bio: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 22, marginTop: Spacing.xs },
  statsCard: { flexDirection: 'row', borderRadius: Radius.xl, overflow: 'hidden', padding: Spacing.lg },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statItemBorder: { borderRightWidth: 1, borderRightColor: `${Colors.outlineVariant}66` },
  statValue: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: Colors.primary },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.onSurfaceVariant, textAlign: 'center' },
  section: { gap: Spacing.md },
  sectionTitle: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, color: Colors.onSurface },
  noPonds: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', gap: Spacing.md },
  noPondsText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant },
  joinPondBtn: { backgroundColor: Colors.primaryFixed, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full },
  joinPondBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.primary },
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
  pondRowIcon: { width: 44, height: 44, borderRadius: Radius.full, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  pondRowInfo: { flex: 1 },
  pondRowField: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 15, color: Colors.onSurface },
  pondRowLevel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant },
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
  settingsLabel: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 15, color: Colors.onSurface },
  logoutBtn: { padding: Spacing.lg, alignItems: 'center' },
  logoutText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant, textDecorationLine: 'underline' },
});
