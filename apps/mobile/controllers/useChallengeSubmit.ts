import { useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SEED_PARTICIPANTS, SEED_SUBMISSIONS,
  CHALLENGE_PARTICIPATING_KEY, CHALLENGE_SUBMISSION_KEY,
  type ChallengeParticipant, type MySubmissionResult, type Challenge,
} from '@/models/challenges';
import { POND_POINTS_KEY } from '@/models/points';
import { addNotification } from '@/models/notifications';
import { useEvaluateChallengeMutation } from '@/api';

export function useChallengeSubmit(challengeId: string | undefined, challenge: Challenge | undefined) {
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<MySubmissionResult | null>(null);
  const evaluateMutation = useEvaluateChallengeMutation();
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
    try {
      const data = await evaluateMutation.mutateAsync({
        field: challenge.field,
        challengeTitle: challenge.title,
        challengeDescription: challenge.description,
        answer: answer.trim(),
        isSubjective: challenge.isSubjective,
      });
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

      // 合格ならポイント+1 & 通知
      if (data.pass) {
        const pts = parseInt((await AsyncStorage.getItem(POND_POINTS_KEY)) ?? '0', 10);
        await AsyncStorage.setItem(POND_POINTS_KEY, String(pts + 1));
        await addNotification({
          type: 'challenge_pass',
          fromUser: 'あなた',
          fromAvatarId: myAvatarId,
          text: `「${challenge?.title}」のチャレンジに成功しました！ +1ポイント`,
        });
      }

      Animated.timing(resultAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    } catch {
      setResult({ answer: answer.trim(), pass: false, comment: 'サーバーに接続できませんでした。再度お試しください。' });
    }
  };

  const handleRetry = () => {
    setResult(null);
    setAnswer('');
    resultAnim.setValue(0);
  };

  return {
    answer,
    setAnswer,
    loading: evaluateMutation.isPending,
    result,
    showSubmissions,
    setShowSubmissions,
    participants,
    isParticipating,
    myAvatarId,
    resultAnim,
    toggleParticipate,
    handleSubmit,
    handleRetry,
    otherSubmissions: SEED_SUBMISSIONS[challengeId ?? ''] ?? [],
  };
}
