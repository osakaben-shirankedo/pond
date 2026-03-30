import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CHALLENGES,
  CHALLENGE_JOINED_KEY,
  CHALLENGE_SUBMISSION_KEY,
  CHALLENGE_PARTICIPATING_KEY,
  FIELD_ID_MAP,
  type MySubmissionResult,
} from '@/models/challenges';

export function useChallenges() {
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, MySubmissionResult>>({});
  const [participatingIds, setParticipatingIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.multiGet([
      CHALLENGE_JOINED_KEY,
      CHALLENGE_SUBMISSION_KEY,
      CHALLENGE_PARTICIPATING_KEY,
    ]).then(([[, joinedStr], [, subStr], [, partStr]]) => {
      if (joinedStr) setJoinedIds(JSON.parse(joinedStr));
      if (subStr) setSubmissionsMap(JSON.parse(subStr));
      if (partStr) setParticipatingIds(JSON.parse(partStr));
    });
  }, []);

  const joinChallenge = useCallback(async (id: string) => {
    const challenge = CHALLENGES.find((c) => c.id === id);
    if (!challenge || joinedIds.includes(id)) return;

    const newJoined = [...joinedIds, id];
    setJoinedIds(newJoined);
    await AsyncStorage.setItem(CHALLENGE_JOINED_KEY, JSON.stringify(newJoined));

    // 対応する池のチャットに自動投稿予約
    const pondsStr = await AsyncStorage.getItem('pond_ponds');
    const ponds: { field: string; pondId: string }[] = pondsStr ? JSON.parse(pondsStr) : [];
    const fieldId = FIELD_ID_MAP[challenge.field] ?? challenge.field;
    const matchingPond = ponds.find((p) => p.field === fieldId);
    if (matchingPond) {
      const key = `challenge_pond_${matchingPond.pondId}`;
      const existing: string[] = JSON.parse((await AsyncStorage.getItem(key)) ?? '[]');
      if (!existing.includes(id)) {
        await AsyncStorage.setItem(key, JSON.stringify([...existing, id]));
      }
    }
  }, [joinedIds]);

  const leaveChallenge = useCallback(async (id: string) => {
    const newJoined = joinedIds.filter((j) => j !== id);
    setJoinedIds(newJoined);
    await AsyncStorage.setItem(CHALLENGE_JOINED_KEY, JSON.stringify(newJoined));
  }, [joinedIds]);

  const toggleParticipate = useCallback(async (id: string) => {
    const next = participatingIds.includes(id)
      ? participatingIds.filter((p) => p !== id)
      : [...participatingIds, id];
    setParticipatingIds(next);
    await AsyncStorage.setItem(CHALLENGE_PARTICIPATING_KEY, JSON.stringify(next));
  }, [participatingIds]);

  const saveSubmission = useCallback(async (challengeId: string, result: MySubmissionResult) => {
    const next = { ...submissionsMap, [challengeId]: result };
    setSubmissionsMap(next);
    await AsyncStorage.setItem(CHALLENGE_SUBMISSION_KEY, JSON.stringify(next));
  }, [submissionsMap]);

  const challenges = CHALLENGES.map((c) => ({
    ...c,
    joined: joinedIds.includes(c.id),
  }));

  return {
    challenges,
    joinedIds,
    participatingIds,
    submissionsMap,
    joinChallenge,
    leaveChallenge,
    toggleParticipate,
    saveSubmission,
  };
}
