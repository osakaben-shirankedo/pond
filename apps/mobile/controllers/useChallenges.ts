import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CHALLENGES,
  PAST_CHALLENGES,
  FIELD_ID_MAP,
  type MySubmissionResult,
} from '@/models/challenges';
import { useChallengesStore, useUserStore, useNotificationsStore } from '@/stores';

export function useChallenges() {
  const {
    joinedIds, submissionsMap, userFieldIds,
    addJoinedId, removeJoinedId, addParticipatingId, removeParticipatingId,
    setUserFieldIds,
  } = useChallengesStore();

  // userFieldIds をユーザーの池リストと同期
  useFocusEffect(useCallback(() => {
    const ponds = useUserStore.getState().ponds;
    setUserFieldIds(ponds.map((p) => p.field));
  }, [setUserFieldIds]));

  const joinChallenge = useCallback(async (id: string) => {
    const challenge = CHALLENGES.find((c) => c.id === id);
    if (!challenge || joinedIds.includes(id)) return;

    addJoinedId(id);
    addParticipatingId(id);

    // 対応する池のチャットにチャレンジカードを投稿
    const ponds = useUserStore.getState().ponds;
    const fieldId = FIELD_ID_MAP[challenge.field] ?? challenge.field;
    const matchingPond = ponds.find((p) => p.field === fieldId);
    if (matchingPond) {
      const key = `challenge_chat_${matchingPond.pondId}`;
      const existing = JSON.parse((await AsyncStorage.getItem(key)) ?? '[]');
      const alreadyPosted = existing.some((m: { challengeId: string }) => m.challengeId === id);
      if (!alreadyPosted) {
        const avatarId = useUserStore.getState().avatarId;
        const cardMsg = {
          id: `challenge-${id}-${Date.now()}`,
          user: 'あなた',
          avatar: 'あ',
          avatarId,
          level: challenge.level,
          content: `${challenge.title}にみんなで挑戦しましょう！`,
          time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
          isMe: true,
          type: 'challenge',
          challengeId: id,
          challengeTitle: challenge.title,
        };
        await AsyncStorage.setItem(key, JSON.stringify([...existing, cardMsg]));
        useUserStore.getState().markPondUnread(matchingPond.pondId);
      }
    }

    const avatarId = useUserStore.getState().avatarId;
    useNotificationsStore.getState().addNotification({
      type: 'challenge_join',
      fromUser: 'あなた',
      fromAvatarId: avatarId,
      text: `「${challenge.title}」に参加しました`,
    });
  }, [joinedIds, addJoinedId, addParticipatingId]);

  const leaveChallenge = useCallback(async (id: string) => {
    removeJoinedId(id);
    removeParticipatingId(id);
  }, [removeJoinedId, removeParticipatingId]);

  const challenges = CHALLENGES
    .filter((c) => {
      if (userFieldIds.length === 0) return true;
      const fieldId = FIELD_ID_MAP[c.field] ?? c.field;
      return userFieldIds.includes(fieldId);
    })
    .map((c) => ({
      ...c,
      joined: joinedIds.includes(c.id),
      passed: (submissionsMap[c.id] as MySubmissionResult | undefined)?.pass === true,
      participants: c.participants + (joinedIds.includes(c.id) ? 1 : 0),
    }));

  const clearedActive = CHALLENGES
    .filter((c) => (submissionsMap[c.id] as MySubmissionResult | undefined)?.pass === true)
    .filter((c) => {
      if (userFieldIds.length === 0) return true;
      const fieldId = FIELD_ID_MAP[c.field] ?? c.field;
      return userFieldIds.includes(fieldId);
    })
    .map((c) => ({ ...c, joined: true, passed: true, participants: c.participants + 1 }));

  const pastBase = PAST_CHALLENGES
    .filter((c) => {
      if (userFieldIds.length === 0) return true;
      const fieldId = FIELD_ID_MAP[c.field] ?? c.field;
      return userFieldIds.includes(fieldId);
    })
    .map((c) => ({ ...c, joined: false, passed: false }));

  const clearedIds = new Set(clearedActive.map((c) => c.id));
  const pastChallenges = [
    ...clearedActive,
    ...pastBase.filter((c) => !clearedIds.has(c.id)),
  ];

  return {
    challenges,
    pastChallenges,
    joinedIds,
    submissionsMap,
    joinChallenge,
    leaveChallenge,
  };
}
