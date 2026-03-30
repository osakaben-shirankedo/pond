import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { WaterRippleButton } from '@/components/water-ripple-button';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Levels } from '@/constants/theme';
import { FieldIcon } from '@/components/ui/field-icon';
import { LEVEL_GRADIENTS } from '@/models/pond';
import { FIELD_LABELS } from '@/models/field';
import { getPondLabel } from '@/models/pond-instance';
import { usePonds } from '@/controllers/usePonds';

const { width } = Dimensions.get('window');

export default function PondsScreen() {
  const {
    ponds,
    LEVEL_ORDER,
    unexploredFields,
    handleAddPond,
    handleReassess,
    handleOpenChat,
    handleExplore,
  } = usePonds();

  return (
    <View style={styles.container}>
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      {/* Header */}
      <BlurView intensity={20} tint="light" style={styles.header}>
        <Text style={styles.headerTitle}>マイ池</Text>
        <TouchableOpacity onPress={handleAddPond} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ 池を追加</Text>
        </TouchableOpacity>
      </BlurView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {ponds.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="water" size={56} color={Colors.primaryFixed} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyTitle}>まだ池がありません</Text>
            <Text style={styles.emptyDesc}>「+ 池を追加」から分野を選んで池に入ろう</Text>
            <WaterRippleButton
              onPress={handleAddPond}
              style={styles.emptyBtnWrapper}
              rippleSize={72}
              rippleColor="rgba(255, 255, 255, 0.6)"
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryContainer]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyBtn}
              >
                <Text style={styles.emptyBtnText}>池に入る</Text>
              </LinearGradient>
            </WaterRippleButton>
          </View>
        ) : (
          <>
            {ponds.map((pond, i) => {
              const levelIndex = LEVEL_ORDER.indexOf(pond.level);
              const progress = (levelIndex + 1) / LEVEL_ORDER.length;
              return (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.88}
                  onPress={() => handleOpenChat(pond.field, pond.level, pond.pondId)}
                  style={styles.pondCard}
                >
                  <LinearGradient
                    colors={LEVEL_GRADIENTS[pond.level]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.pondCardGradient}
                  >
                    <View style={styles.pondCardHeader}>
                      <View style={styles.pondIcon}>
                        <FieldIcon field={pond.field} color={Colors.secondary} size={22} />
                      </View>
                      <View style={styles.pondInfo}>
                        <Text style={styles.pondFieldName}>{FIELD_LABELS[pond.field] ?? pond.field}</Text>
                        <Text style={styles.pondLevelName}>
                          {pond.level}{getPondLabel(pond.pondId) ? ` 池${getPondLabel(pond.pondId)}` : ''}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleReassess(pond.field)} style={styles.reassessBtn}>
                        <Text style={styles.reassessBtnText}>再査定</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.pondLevelDesc}>{Levels[pond.level]?.description}</Text>

                    <View style={styles.progressContainer}>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                      </View>
                      <Text style={styles.progressLabel}>
                        {LEVEL_ORDER.map((l, idx) => (
                          <Text key={l} style={idx === levelIndex ? styles.progressLevelActive : styles.progressLevelInactive}>
                            {l}{idx < LEVEL_ORDER.length - 1 ? ' → ' : ''}
                          </Text>
                        ))}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}

            {/* Explore more */}
            <View style={styles.exploreSection}>
              <Text style={styles.exploreSectionTitle}>他の分野を探す</Text>
              <View style={styles.exploreGrid}>
                {unexploredFields.map((id) => (
                  <WaterRippleButton
                    key={id}
                    onPress={() => handleExplore(id)}
                    style={styles.exploreCard}
                    rippleSize={48}
                  >
                    <BlurView intensity={15} tint="light" style={styles.exploreCardBlur}>
                      <FieldIcon field={id} color={Colors.secondary} size={24} />
                      <Text style={styles.exploreLabel}>{FIELD_LABELS[id]}</Text>
                    </BlurView>
                  </WaterRippleButton>
                ))}
              </View>
            </View>
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  blob: { position: 'absolute', borderRadius: Radius.full, opacity: 0.3 },
  blob1: { top: -60, right: -40, width: width * 0.55, height: width * 0.55, backgroundColor: Colors.primaryFixed },
  blob2: { bottom: 100, left: -50, width: width * 0.5, height: width * 0.5, backgroundColor: Colors.secondaryFixed },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    overflow: 'hidden',
  },
  headerTitle: { flex: 1, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 26, color: Colors.onSurface },
  addBtn: { backgroundColor: Colors.primaryFixed, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full },
  addBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.primary },
  content: { padding: Spacing.lg, gap: Spacing.md },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: Spacing.md },
  emptyTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: Colors.onSurface },
  emptyDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 22 },
  emptyBtnWrapper: { marginTop: Spacing.md, borderRadius: Radius.full, overflow: 'hidden' },
  emptyBtn: { paddingHorizontal: 48, paddingVertical: 16, borderRadius: Radius.full },
  emptyBtnText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: Colors.onPrimary },
  pondCard: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3,
  },
  pondCardGradient: { padding: Spacing.xl, gap: Spacing.md },
  pondCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  pondIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pondInfo: { flex: 1 },
  pondFieldName: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.onSurface },
  pondLevelName: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.primary },
  reassessBtn: { backgroundColor: 'rgba(255,255,255,0.6)', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full },
  reassessBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: Colors.primary },
  pondLevelDesc: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant },
  progressContainer: { gap: Spacing.xs },
  progressTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: Radius.full, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: Radius.full },
  progressLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.onSurfaceVariant },
  progressLevelActive: { fontFamily: 'Inter_600SemiBold', color: Colors.primary },
  progressLevelInactive: { color: Colors.outlineVariant },
  exploreSection: { marginTop: Spacing.xl },
  exploreSectionTitle: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, color: Colors.onSurface, marginBottom: Spacing.md },
  exploreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  exploreCard: { width: (width - Spacing.lg * 2 - Spacing.md) / 2, borderRadius: Radius.xl, overflow: 'hidden' },
  exploreCardBlur: {
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: `${Colors.primary}1A`,
  },
  exploreLabel: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: Colors.onSecondaryContainer },
});
