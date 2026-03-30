import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
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
  const [userFieldIds, setUserFieldIds] = useState<string[]>([]);

  // 画面フォーカス時に毎回再読み込み（提出後に戻ったときも反映）
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.multiGet([
        CHALLENGE_JOINED_KEY,
        CHALLENGE_SUBMISSION_KEY,
        'pond_ponds',
      ]).then(([[, joinedStr], [, subStr], [, pondsStr]]) => {
        if (joinedStr) setJoinedIds(JSON.parse(joinedStr));
        if (subStr) setSubmissionsMap(JSON.parse(subStr));
        if (pondsStr) {
          const ponds: { field: string }[] = JSON.parse(pondsStr);
          setUserFieldIds(ponds.map((p) => p.field));
        }
      });
    }, [])
  );

  const joinChallenge = useCallback(async (id: string) => {
    const challenge = CHALLENGES.find((c) => c.id === id);
    if (!challenge || joinedIds.includes(id)) return;

    const newJoined = [...joinedIds, id];
    setJoinedIds(newJoined);
    await AsyncStorage.setItem(CHALLENGE_JOINED_KEY, JSON.stringify(newJoined));

    const partStr = await AsyncStorage.getItem(CHALLENGE_PARTICIPATING_KEY);
    const partIds: string[] = partStr ? JSON.parse(partStr) : [];
    if (!partIds.includes(id)) {
      await AsyncStorage.setItem(CHALLENGE_PARTICIPATING_KEY, JSON.stringify([...partIds, id]));
    }

    // 対応する池のチャットにチャレンジカードを投稿
    const pondsStr = await AsyncStorage.getItem('pond_ponds');
    const ponds: { field: string; pondId: string }[] = pondsStr ? JSON.parse(pondsStr) : [];
    const fieldId = FIELD_ID_MAP[challenge.field] ?? challenge.field;
    const matchingPond = ponds.find((p) => p.field === fieldId);
    if (matchingPond) {
      const key = `challenge_chat_${matchingPond.pondId}`;
      const existing = JSON.parse((await AsyncStorage.getItem(key)) ?? '[]');
      const alreadyPosted = existing.some((m: { challengeId: string }) => m.challengeId === id);
      if (!alreadyPosted) {
        const avatarStr = await AsyncStorage.getItem('pond_avatar');
        const cardMsg = {
          id: `challenge-${id}-${Date.now()}`,
          user: 'あなた',
          avatar: 'あ',
          avatarId: avatarStr ?? 'fishbowl',
          level: challenge.level,
          content: `${challenge.title}にみんなで挑戦しましょう！`,
          time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
          isMe: true,
          type: 'challenge',
          challengeId: id,
          challengeTitle: challenge.title,
        };
        await AsyncStorage.setItem(key, JSON.stringify([...existing, cardMsg]));
      }
    }
  }, [joinedIds]);

  const leaveChallenge = useCallback(async (id: string) => {
    const newJoined = joinedIds.filter((j) => j !== id);
    setJoinedIds(newJoined);
    await AsyncStorage.setItem(CHALLENGE_JOINED_KEY, JSON.stringify(newJoined));
    const partStr = await AsyncStorage.getItem(CHALLENGE_PARTICIPATING_KEY);
    const partIds: string[] = partStr ? JSON.parse(partStr) : [];
    await AsyncStorage.setItem(CHALLENGE_PARTICIPATING_KEY, JSON.stringify(partIds.filter((p) => p !== id)));
  }, [joinedIds]);

  const challenges = CHALLENGES
    .filter((c) => {
      if (userFieldIds.length === 0) return true;
      const fieldId = FIELD_ID_MAP[c.field] ?? c.field;
      return userFieldIds.includes(fieldId);
    })
    .map((c) => ({
      ...c,
      joined: joinedIds.includes(c.id),
      passed: submissionsMap[c.id]?.pass === true,
      // 自分が参加済みなら+1
      participants: c.participants + (joinedIds.includes(c.id) ? 1 : 0),
    }));

  return {
    challenges,
    joinedIds,
    submissionsMap,
    joinChallenge,
    leaveChallenge,
  };
}
