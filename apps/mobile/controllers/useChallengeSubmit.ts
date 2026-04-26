import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import {
  SEED_PARTICIPANTS, SEED_SUBMISSIONS,
  type Challenge,
} from '@/models/challenges';
import { useEvaluateChallengeMutation } from '@/api';
import { useChallengeSubmitStore, useChallengesStore, useUserStore, useNotificationsStore } from '@/stores';

export function useChallengeSubmit(challengeId: string | undefined, challenge: Challenge | undefined) {
  const {
    answer, result, showSubmissions, participants, isParticipating,
    setAnswer, setResult, setShowSubmissions, setParticipants, setIsParticipating,
    reset,
  } = useChallengeSubmitStore();

  const evaluateMutation = useEvaluateChallengeMutation();
  const resultAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!challengeId) return;
    reset();
    resultAnim.setValue(0);

    const { participatingIds, submissionsMap } = useChallengesStore.getState();
    setIsParticipating(participatingIds.includes(challengeId));
    const sub = submissionsMap[challengeId];
    if (sub) setResult(sub);

    setParticipants(SEED_PARTICIPANTS[challengeId] ?? []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeId]);

  const toggleParticipate = async () => {
    if (!challengeId) return;
    const next = !isParticipating;
    setIsParticipating(next);
    if (next) {
      useChallengesStore.getState().addParticipatingId(challengeId);
    } else {
      useChallengesStore.getState().removeParticipatingId(challengeId);
    }
    setParticipants(SEED_PARTICIPANTS[challengeId] ?? []);
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
      const submissionResult = {
        answer: answer.trim(),
        pass: data.pass,
        score: data.score,
        comment: data.comment,
      };
      setResult(submissionResult);
      useChallengesStore.getState().addSubmission(challengeId, submissionResult);

      if (data.pass) {
        useChallengesStore.getState().addPoints(1);
        const avatarId = useUserStore.getState().avatarId;
        useNotificationsStore.getState().addNotification({
          type: 'challenge_pass',
          fromUser: 'あなた',
          fromAvatarId: avatarId,
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

  const avatarId = useUserStore((s) => s.avatarId);

  return {
    answer,
    setAnswer,
    loading: evaluateMutation.isPending,
    result,
    showSubmissions,
    setShowSubmissions,
    participants,
    isParticipating,
    myAvatarId: avatarId,
    resultAnim,
    toggleParticipate,
    handleSubmit,
    handleRetry,
    otherSubmissions: SEED_SUBMISSIONS[challengeId ?? ''] ?? [],
  };
}
