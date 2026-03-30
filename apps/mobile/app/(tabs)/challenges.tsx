import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { FieldIcon } from '@/components/ui/field-icon';
import { FIELD_ID_MAP } from '@/models/challenges';
import { useChallenges } from '@/controllers/useChallenges';

const { width } = Dimensions.get('window');

export default function ChallengesScreen() {
  const { challenges, toggleJoin } = useChallenges();

  return (
    <View style={styles.container}>
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      {/* Header */}
      <BlurView intensity={20} tint="light" style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>週次チャレンジ</Text>
          <Text style={styles.headerSubtitle}>AIが池ごとにお題を自動生成</Text>
        </View>
        <View style={styles.weekBadge}>
          <Text style={styles.weekBadgeText}>Week 12</Text>
        </View>
      </BlurView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active challenge banner */}
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <Ionicons name="flash" size={32} color="#fff" />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>チャレンジ期間中！</Text>
            <Text style={styles.bannerDesc}>参加して同じ池の仲間と競おう</Text>
          </View>
        </LinearGradient>

        {/* Challenge cards */}
        {challenges.map((ch) => (
          <View key={ch.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.fieldTag}>
                <FieldIcon field={FIELD_ID_MAP[ch.field] ?? ch.field} size={14} color={Colors.onSurfaceVariant} />
                <Text style={styles.fieldTagText}>{ch.field}</Text>
              </View>
              <View style={[styles.levelTag, ch.level === '蒼淵' && styles.levelTagDark]}>
                <Text style={styles.levelTagText}>{ch.level}</Text>
              </View>
            </View>

            <Text style={styles.cardTitle}>{ch.title}</Text>
            <Text style={styles.cardDesc}>{ch.description}</Text>

            <View style={styles.cardMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={Colors.onSurfaceVariant} />
                <Text style={styles.metaText}>残り{ch.daysLeft}日</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={14} color={Colors.onSurfaceVariant} />
                <Text style={styles.metaText}>{ch.participants}人参加中</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => toggleJoin(ch.id)}
              activeOpacity={0.85}
              style={[styles.joinBtn, ch.joined && styles.joinBtnActive]}
            >
              {ch.joined ? (
                <Text style={styles.joinBtnTextActive}>参加中</Text>
              ) : (
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryContainer]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.joinBtnGradient}
                >
                  <Text style={styles.joinBtnText}>参加する</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  blob: { position: 'absolute', borderRadius: Radius.full, opacity: 0.3 },
  blob1: { top: -40, left: -40, width: width * 0.5, height: width * 0.5, backgroundColor: Colors.primaryFixed },
  blob2: { bottom: 200, right: -50, width: width * 0.45, height: width * 0.45, backgroundColor: Colors.secondaryFixed },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  headerTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 24, color: Colors.onSurface },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant },
  weekBadge: { backgroundColor: Colors.primaryFixed, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full },
  weekBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.primary },
  content: { padding: Spacing.lg, gap: Spacing.md },
  banner: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  bannerText: { flex: 1 },
  bannerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.onPrimary },
  bannerDesc: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  fieldTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  fieldTagText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: Colors.onSurfaceVariant },
  levelTag: { backgroundColor: Colors.primaryFixed, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  levelTagDark: { backgroundColor: Colors.primary },
  levelTagText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: Colors.primary },
  cardTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.onSurface },
  cardDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant, lineHeight: 22 },
  cardMeta: { flexDirection: 'row', gap: Spacing.lg },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  metaText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Colors.onSurfaceVariant },
  joinBtn: { borderRadius: Radius.full, overflow: 'hidden' },
  joinBtnActive: { backgroundColor: Colors.surfaceContainerLow, paddingVertical: 14, alignItems: 'center' },
  joinBtnGradient: { paddingVertical: 14, alignItems: 'center', borderRadius: Radius.full },
  joinBtnText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: Colors.onPrimary },
  joinBtnTextActive: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 15, color: Colors.primary },
});
