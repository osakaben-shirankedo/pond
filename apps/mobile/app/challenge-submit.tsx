import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  Dimensions, ActivityIndicator, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { AvatarSprite } from '@/components/avatar-sprite';
import {
  CHALLENGES, SEED_PARTICIPANTS, SEED_SUBMISSIONS,
  CHALLENGE_PARTICIPATING_KEY, CHALLENGE_SUBMISSION_KEY,
  type ChallengeParticipant, type MySubmissionResult, type SeedSubmission,
} from '@/models/challenges';
import { POND_POINTS_KEY } from '@/models/points';

const { width } = Dimensions.get('window');
const SERVER_URL = 'http://localhost:8787';

export default function ChallengeSubmitScreen() {
  const { challengeId, mode } = useLocalSearchParams<{ challengeId: string; mode?: string }>();
  const isTimelineMode = mode === 'timeline';
  const challenge = CHALLENGES.find((c) => c.id === challengeId);

  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MySubmissionResult | null>(null);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([]);
  const [isParticipating, setIsParticipating] = useState(false);
  const [myAvatarId, setMyAvatarId] = useState('fishbowl');
  const resultAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!challengeId) return;
    Promise.all([
      AsyncStorage.getItem(CHALLENGE_PARTICIPATING_KEY),
      AsyncStorage.getItem(CHALLENGE_SUBMISSION_KEY),
      AsyncStorage.getItem('pond_avatar'),
    ]).then(([partStr, subStr, avatarStr]) => {
      // JOINED と PARTICIPATING を両方チェックして統一
      const participatingIds: string[] = partStr ? JSON.parse(partStr) : [];
      setIsParticipating(participatingIds.includes(challengeId));
      if (subStr) {
        const map: Record<string, MySubmissionResult> = JSON.parse(subStr);
        if (map[challengeId]) setResult(map[challengeId]);
      }
      if (avatarStr) setMyAvatarId(avatarStr);
    });

    const seeds = SEED_PARTICIPANTS[challengeId] ?? [];
    setParticipants(seeds);
  }, [challengeId]);

  const toggleParticipate = async () => {
    if (!challengeId) return;
    const partStr = await AsyncStorage.getItem(CHALLENGE_PARTICIPATING_KEY);
    const ids: string[] = partStr ? JSON.parse(partStr) : [];
    const next = isParticipating ? ids.filter((i) => i !== challengeId) : [...ids, challengeId];
    setIsParticipating(!isParticipating);
    await AsyncStorage.setItem(CHALLENGE_PARTICIPATING_KEY, JSON.stringify(next));

    // メンバーリスト更新
    const seeds = SEED_PARTICIPANTS[challengeId] ?? [];
    setParticipants(seeds);
  };

  const handleSubmit = async () => {
    if (!answer.trim() || !challenge || !challengeId) return;
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/challenge/evaluate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          field: challenge.field,
          challengeTitle: challenge.title,
          challengeDescription: challenge.description,
          answer: answer.trim(),
          isSubjective: challenge.isSubjective,
        }),
      });
      const data = await res.json() as { pass: boolean; score?: number; comment: string };
      const submissionResult: MySubmissionResult = {
        answer: answer.trim(),
        pass: data.pass,
        score: data.score,
        comment: data.comment,
      };
      setResult(submissionResult);

      // 保存
      const subStr = await AsyncStorage.getItem(CHALLENGE_SUBMISSION_KEY);
      const map: Record<string, MySubmissionResult> = subStr ? JSON.parse(subStr) : {};
      map[challengeId] = submissionResult;
      await AsyncStorage.setItem(CHALLENGE_SUBMISSION_KEY, JSON.stringify(map));

      // 合格ならポイント+1
      if (data.pass) {
        const pts = parseInt((await AsyncStorage.getItem(POND_POINTS_KEY)) ?? '0', 10);
        await AsyncStorage.setItem(POND_POINTS_KEY, String(pts + 1));
      }

      Animated.timing(resultAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    } catch {
      setResult({ answer: answer.trim(), pass: false, comment: 'サーバーに接続できませんでした。再度お試しください。' });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setAnswer('');
    resultAnim.setValue(0);
  };

  if (!challenge) return null;

  const otherSubmissions: SeedSubmission[] = SEED_SUBMISSIONS[challengeId] ?? [];
  const meParticipant: ChallengeParticipant = { id: 'me', name: 'あなた', avatarId: myAvatarId, isMe: true };
  const allParticipants = isParticipating ? [meParticipant, ...participants] : participants;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      {/* Header */}
      <BlurView intensity={20} tint="light" style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{isTimelineMode ? 'みんなの回答' : challenge.title}</Text>
        {challenge.isSubjective && (
          <View style={styles.aiTag}>
            <Text style={styles.aiTagText}>AI採点</Text>
          </View>
        )}
      </BlurView>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* チャレンジ説明 */}
        <View style={styles.challengeCard}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDesc}>{challenge.description}</Text>
          <View style={styles.challengeMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color={Colors.onSurfaceVariant} />
              <Text style={styles.metaText}>残り{challenge.daysLeft}日</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={13} color={Colors.onSurfaceVariant} />
              <Text style={styles.metaText}>{challenge.participants}人参加中</Text>
            </View>
          </View>
        </View>

        {/* チーム参加状況 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>池のチームメンバー</Text>
            <TouchableOpacity onPress={toggleParticipate} style={[styles.participateToggle, isParticipating && styles.participateToggleActive]}>
              <Ionicons name={isParticipating ? 'checkmark-circle' : 'add-circle-outline'} size={16} color={isParticipating ? Colors.primary : Colors.onSurfaceVariant} />
              <Text style={[styles.participateToggleText, isParticipating && styles.participateToggleTextActive]}>
                {isParticipating ? '挑戦中' : '挑戦する'}
              </Text>
            </TouchableOpacity>
          </View>
          {allParticipants.length === 0 ? (
            <Text style={styles.emptyText}>まだ挑戦者がいません</Text>
          ) : (
            <View style={styles.participantsList}>
              {allParticipants.map((p) => (
                <View key={p.id} style={styles.participantItem}>
                  <AvatarSprite presetId={p.avatarId} size={36} />
                  <Text style={styles.participantName} numberOfLines={1}>{p.name}</Text>
                  {p.isMe && <View style={styles.meBadge}><Text style={styles.meBadgeText}>あなた</Text></View>}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* タイムラインモード: 直接みんなの回答を表示 */}
        {isTimelineMode && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>みんなの回答</Text>
            {result && (
              <View style={styles.submissionCard}>
                <View style={styles.submissionHeader}>
                  <AvatarSprite presetId={myAvatarId} size={36} />
                  <View style={styles.submissionMeta}>
                    <View style={styles.submissionNameRow}>
                      <Text style={styles.submissionUser}>あなた</Text>
                      <View style={styles.meBadge}><Text style={styles.meBadgeText}>あなた</Text></View>
                    </View>
                    <Text style={styles.submissionTime}>たった今</Text>
                  </View>
                </View>
                <Text style={styles.submissionAnswer}>{result.answer}</Text>
              </View>
            )}
            {otherSubmissions.map((s) => (
              <View key={s.id} style={styles.submissionCard}>
                <View style={styles.submissionHeader}>
                  <AvatarSprite presetId={s.avatarId} size={36} />
                  <View style={styles.submissionMeta}>
                    <Text style={styles.submissionUser}>{s.user}</Text>
                    <Text style={styles.submissionTime}>{s.time}</Text>
                  </View>
                </View>
                <Text style={styles.submissionAnswer}>{s.answer}</Text>
              </View>
            ))}
            {otherSubmissions.length === 0 && !result && (
              <Text style={styles.emptyText}>まだ提出者がいません</Text>
            )}
          </View>
        )}

        {/* 提出フォーム or 結果 */}
        {!isTimelineMode && !result ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>回答を提出する</Text>
            <TextInput
              style={styles.answerInput}
              value={answer}
              onChangeText={setAnswer}
              placeholder={`${challenge.title}への回答を入力…`}
              placeholderTextColor={Colors.outlineVariant}
              multiline
              textAlignVertical="top"
              maxLength={1000}
            />
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.85}
              style={[styles.submitBtn, (!answer.trim() || loading) && styles.submitBtnDisabled]}
              disabled={!answer.trim() || loading}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryContainer]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitBtnGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={16} color="#fff" />
                    <Text style={styles.submitBtnText}>AIに提出する</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : !isTimelineMode ? (
          <Animated.View style={[styles.section, { opacity: resultAnim }]}>
            <View style={[styles.resultCard, result.pass ? styles.resultCardPass : styles.resultCardFail]}>
              <Text style={styles.resultIcon}>{result.pass ? '⭕️' : '❌'}</Text>
              {result.score !== undefined && (
                <Text style={styles.resultScore}>{result.score}点</Text>
              )}
              <Text style={styles.resultComment}>{result.comment}</Text>
              {result.pass && (
                <View style={styles.pointBadge}>
                  <Ionicons name="star" size={14} color="#F4A500" />
                  <Text style={styles.pointBadgeText}>+1 ポイント獲得！</Text>
                </View>
              )}
            </View>

            {!result.pass && (
              <TouchableOpacity onPress={handleRetry} style={styles.retryBtn}>
                <Ionicons name="refresh" size={16} color={Colors.primary} />
                <Text style={styles.retryBtnText}>再提出する</Text>
              </TouchableOpacity>
            )}

            {result.pass && (
              <TouchableOpacity
                onPress={() => setShowSubmissions(!showSubmissions)}
                style={styles.showSubmissionsBtn}
              >
                <Text style={styles.showSubmissionsBtnText}>
                  {showSubmissions ? '閉じる' : 'みんなの回答を見る'}
                </Text>
                <Ionicons name={showSubmissions ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </Animated.View>
        ) : null}

        {/* みんなの提出タイムライン (提出後のトグル表示) */}
        {!isTimelineMode && showSubmissions && result?.pass && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>みんなの回答</Text>
            {/* 自分の回答 */}
            <View style={styles.submissionCard}>
              <View style={styles.submissionHeader}>
                <AvatarSprite presetId={myAvatarId} size={36} />
                <View style={styles.submissionMeta}>
                  <View style={styles.submissionNameRow}>
                    <Text style={styles.submissionUser}>あなた</Text>
                    <View style={styles.meBadge}><Text style={styles.meBadgeText}>あなた</Text></View>
                  </View>
                  <Text style={styles.submissionTime}>たった今</Text>
                </View>
              </View>
              <Text style={styles.submissionAnswer}>{result.answer}</Text>
            </View>
            {otherSubmissions.map((s) => (
              <View key={s.id} style={styles.submissionCard}>
                <View style={styles.submissionHeader}>
                  <AvatarSprite presetId={s.avatarId} size={36} />
                  <View style={styles.submissionMeta}>
                    <Text style={styles.submissionUser}>{s.user}</Text>
                    <Text style={styles.submissionTime}>{s.time}</Text>
                  </View>
                </View>
                <Text style={styles.submissionAnswer}>{s.answer}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  blob: { position: 'absolute', borderRadius: Radius.full, opacity: 0.25 },
  blob1: { top: -40, right: -30, width: width * 0.5, height: width * 0.5, backgroundColor: Colors.primaryFixed },
  blob2: { bottom: 200, left: -40, width: width * 0.4, height: width * 0.4, backgroundColor: Colors.secondaryFixed },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: Colors.onSurface },
  aiTag: { backgroundColor: `${Colors.secondary}33`, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  aiTagText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: Colors.secondary },
  content: { padding: Spacing.lg, gap: Spacing.xl },
  challengeCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  challengeTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: Colors.onSurface },
  challengeDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant, lineHeight: 22 },
  challengeMeta: { flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.xs },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  metaText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: Colors.onSurfaceVariant },
  section: { gap: Spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, color: Colors.onSurface },
  participateToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLow,
  },
  participateToggleActive: { backgroundColor: Colors.primaryFixed },
  participateToggleText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.onSurfaceVariant },
  participateToggleTextActive: { color: Colors.primary },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant },
  participantsList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  participantItem: { alignItems: 'center', gap: 4, maxWidth: 64 },
  participantName: { fontFamily: 'Inter_500Medium', fontSize: 11, color: Colors.onSurface, textAlign: 'center' },
  meBadge: { backgroundColor: Colors.primaryFixed, paddingHorizontal: Spacing.xs, paddingVertical: 2, borderRadius: Radius.full },
  meBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: Colors.primary },
  answerInput: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.onSurface,
    minHeight: 140,
    lineHeight: 24,
  },
  submitBtn: { borderRadius: Radius.full, overflow: 'hidden' },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  submitBtnText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#fff' },
  resultCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  resultCardPass: { backgroundColor: `${Colors.primaryFixed}cc` },
  resultCardFail: { backgroundColor: `${Colors.surfaceContainerHigh}cc` },
  resultIcon: { fontSize: 56 },
  resultScore: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 32, color: Colors.primary },
  resultComment: { fontFamily: 'Inter_500Medium', fontSize: 15, color: Colors.onSurface, textAlign: 'center', lineHeight: 24 },
  pointBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF8E1',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  pointBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#F4A500' },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLow,
  },
  retryBtnText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 15, color: Colors.primary },
  showSubmissionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryFixed,
  },
  showSubmissionsBtnText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 15, color: Colors.primary },
  submissionCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  submissionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  submissionMeta: { flex: 1, gap: 2 },
  submissionNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  submissionUser: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.onSurface },
  submissionTime: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.onSurfaceVariant },
  submissionAnswer: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurface, lineHeight: 22 },
});
