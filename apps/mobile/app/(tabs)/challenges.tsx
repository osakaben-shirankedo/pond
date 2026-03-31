import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { FieldIcon } from '@/components/ui/field-icon';
import { FIELD_ID_MAP } from '@/models/challenges';
import { useChallenges } from '@/controllers/useChallenges';

const { width } = Dimensions.get('window');

export default function ChallengesScreen() {
  const { challenges, pastChallenges, joinChallenge, leaveChallenge } = useChallenges();
  const [tab, setTab] = useState<'active' | 'past'>('active');

  return (
    <View style={styles.container}>
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      <BlurView intensity={20} tint="light" style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>週次チャレンジ</Text>
          <Text style={styles.headerSubtitle}>AIが池ごとにお題を自動生成</Text>
        </View>
        <View style={styles.weekBadge}>
          <Text style={styles.weekBadgeText}>Week 12</Text>
        </View>
      </BlurView>

      {/* タブ */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'active' && styles.tabActive]}
          onPress={() => setTab('active')}
        >
          <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>今週のチャレンジ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'past' && styles.tabActive]}
          onPress={() => setTab('past')}
        >
          <Text style={[styles.tabText, tab === 'past' && styles.tabTextActive]}>過去のチャレンジ</Text>
          {pastChallenges.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{pastChallenges.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'active' && (() => {
          const joining = challenges.filter((c) => c.joined && !c.passed);
          return joining.length > 0 ? (
            <View style={styles.joiningSection}>
              <View style={styles.joiningSectionHeader}>
                <Ionicons name="flash" size={14} color={Colors.primary} />
                <Text style={styles.joiningSectionTitle}>参加中のチャレンジ</Text>
                <View style={styles.joiningSectionBadge}>
                  <Text style={styles.joiningSectionBadgeText}>{joining.length}</Text>
                </View>
              </View>
              {joining.map((ch) => (
                <View key={ch.id} style={styles.joiningItem}>
                  <View style={styles.joiningItemInfo}>
                    <Text style={styles.joiningItemTitle} numberOfLines={1}>{ch.title}</Text>
                    <Text style={styles.joiningItemMeta}>{ch.field} · 残り{ch.daysLeft}日</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: '/challenge-submit', params: { challengeId: ch.id } })}
                    style={styles.joiningSubmitBtn}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={[Colors.primary, Colors.primaryContainer]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.joiningSubmitBtnGradient}
                    >
                      <Ionicons name="send" size={13} color="#fff" />
                      <Text style={styles.joiningSubmitBtnText}>提出</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : null;
        })()}

        {tab === 'active' && (
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
        )}

        {tab === 'past' && pastChallenges.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={48} color={Colors.primaryFixed} />
            <Text style={styles.emptyText}>まだ挑戦したチャレンジはありません</Text>
          </View>
        )}

        {(tab === 'active' ? challenges : pastChallenges).map((ch) => (
          <View key={ch.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.fieldTag}>
                <FieldIcon field={FIELD_ID_MAP[ch.field] ?? ch.field} size={14} color={Colors.onSurfaceVariant} />
                <Text style={styles.fieldTagText}>{ch.field}</Text>
              </View>
              <View style={[styles.levelTag, ch.level === '蒼淵' && styles.levelTagDark]}>
                <Text style={styles.levelTagText}>{ch.level}</Text>
              </View>
              {ch.isSubjective && (
                <View style={styles.subjectiveTag}>
                  <Text style={styles.subjectiveTagText}>AI採点</Text>
                </View>
              )}
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

            {tab === 'past' ? (
              /* 過去チャレンジ: タイムラインのみ */
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/challenge-submit', params: { challengeId: ch.id, mode: 'timeline' } })}
                activeOpacity={0.85}
                style={styles.submitBtn}
              >
                <LinearGradient
                  colors={[Colors.secondary, Colors.secondaryContainer]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitBtnGradient}
                >
                  <Ionicons name="list" size={14} color="#fff" />
                  <Text style={styles.submitBtnText}>みんなの回答を見る</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : ch.passed ? (
              /* 成功済み */
              <View style={styles.joinedRow}>
                <View style={styles.passedBtn}>
                  <Ionicons name="checkmark-circle" size={16} color="#fff" />
                  <Text style={styles.passedBtnText}>クリア済み</Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push({ pathname: '/challenge-submit', params: { challengeId: ch.id, mode: 'timeline' } })}
                  activeOpacity={0.85}
                  style={styles.submitBtn}
                >
                  <LinearGradient
                    colors={[Colors.secondary, Colors.secondaryContainer]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitBtnGradient}
                  >
                    <Ionicons name="list" size={14} color="#fff" />
                    <Text style={styles.submitBtnText}>みんなの回答</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : ch.joined ? (
              /* 参加中・未提出 */
              <View style={styles.joinedRow}>
                <TouchableOpacity
                  onPress={() => leaveChallenge(ch.id)}
                  activeOpacity={0.85}
                  style={styles.joinedBtn}
                >
                  <Ionicons name="close-circle-outline" size={16} color="#e05c7b" />
                  <Text style={styles.leaveBtnText}>参加をやめる</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push({ pathname: '/challenge-submit', params: { challengeId: ch.id } })}
                  activeOpacity={0.85}
                  style={styles.submitBtn}
                >
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryContainer]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitBtnGradient}
                  >
                    <Ionicons name="send" size={14} color="#fff" />
                    <Text style={styles.submitBtnText}>提出する</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              /* 未参加 */
              <TouchableOpacity
                onPress={() => joinChallenge(ch.id)}
                activeOpacity={0.85}
                style={styles.joinBtn}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryContainer]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.joinBtnGradient}
                >
                  <Ionicons name="people" size={16} color="#fff" />
                  <Text style={styles.joinBtnText}>チームで参加する</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
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
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerLow,
    backgroundColor: Colors.surface,
  },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: Colors.onSurfaceVariant },
  tabTextActive: { color: Colors.primary, fontFamily: 'Inter_700Bold' },
  tabBadge: { backgroundColor: Colors.primaryFixed, borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 2 },
  tabBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: Colors.primary },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: Spacing.md },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant },
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
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
  subjectiveTag: { backgroundColor: `${Colors.secondary}33`, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  subjectiveTagText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: Colors.secondary },
  cardTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.onSurface },
  cardDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant, lineHeight: 22 },
  cardMeta: { flexDirection: 'row', gap: Spacing.lg },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  metaText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Colors.onSurfaceVariant },
  joinBtn: { borderRadius: Radius.full, overflow: 'hidden' },
  joinBtnGradient: { paddingVertical: 14, alignItems: 'center', borderRadius: Radius.full, flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm },
  joinBtnText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: Colors.onPrimary },
  passedBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Radius.full,
  },
  passedBtnText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 15, color: '#fff' },
  joinedRow: { flexDirection: 'row', gap: Spacing.sm },
  joinedBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: '#fde8ed',
    paddingVertical: 14,
    borderRadius: Radius.full,
  },
  leaveBtnText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 15, color: '#e05c7b' },
  joiningSection: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: `${Colors.primary}22`,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  joiningSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: 2 },
  joiningSectionTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: Colors.primary, flex: 1 },
  joiningSectionBadge: { backgroundColor: Colors.primaryFixed, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  joiningSectionBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: Colors.primary },
  joiningItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.surfaceContainerLow },
  joiningItemInfo: { flex: 1 },
  joiningItemTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.onSurface },
  joiningItemMeta: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.onSurfaceVariant, marginTop: 2 },
  joiningSubmitBtn: { borderRadius: Radius.full, overflow: 'hidden' },
  joiningSubmitBtnGradient: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.full },
  joiningSubmitBtnText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#fff' },
  submitBtn: { flex: 1, borderRadius: Radius.full, overflow: 'hidden' },
  submitBtnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: Radius.full,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  submitBtnText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: '#fff' },
});
