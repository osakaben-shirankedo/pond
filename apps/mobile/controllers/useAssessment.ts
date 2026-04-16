import { useState, useRef, useEffect } from 'react';
import { Animated, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
  getSteps,
  judgeLevel,
  getLevelDescription,
  buildInitialMessage,
  FIELD_LABELS,
  type Message,
  type LevelKey,
  type FieldId,
} from '@/models/assessment';
import { assignPondId } from '@/models/pond-instance';
import { applyIke } from '@/api/endpoints/ike';
import { authStorage } from '@/services/auth';

export function useAssessment(field: FieldId | undefined, queue: string | undefined) {
  const resolvedField = field ?? 'default';
  const steps = getSteps(resolvedField);
  const remainingQueue = queue ? queue.split(',').filter(Boolean) : [];
  const nextField = remainingQueue[0] as FieldId | undefined;

  const [messages, setMessages] = useState<Message[]>([
    buildInitialMessage(resolvedField, steps[0].question),
  ]);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [level, setLevel] = useState<LevelKey | null>(null);
  const [judgedLevel, setJudgedLevel] = useState<LevelKey | null>(null);
  const [purposeSelected, setPurposeSelected] = useState(false);
  const [diving, setDiving] = useState(false);
  const [assignedPondId, setAssignedPondId] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (done && level) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [done, level]);

  const handleOption = async (optionIndex: number) => {
    const currentStep = steps[stepIndex];
    const userMessage: Message = {
      id: `u-${stepIndex}`,
      role: 'user',
      text: currentStep.options[optionIndex],
    };

    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    const next = stepIndex + 1;
    const newMessages = [...messages, userMessage];

    if (next < steps.length) {
      newMessages.push({ id: `ai-${next}`, role: 'ai', text: steps[next].question });
      setMessages(newMessages);
      setStepIndex(next);
    } else {
      const judged = judgeLevel(newAnswers);
      newMessages.push({
        id: 'ai-result',
        role: 'ai',
        text: `ありがとう！判定完了です✨\n\nあなたは「${judged}」からスタートです。\n${getLevelDescription(judged)}\n\nどんな目的で学びたいか教えてね！`,
      });
      setMessages(newMessages);
      setLevel(judged);
      setJudgedLevel(judged);
      setDone(true);
    }

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handlePurpose = async (purpose: string) => {
    const resolvedFieldId = field ?? 'programming';
    const lv = judgedLevel!;

    let pondId: string;

    const token = await authStorage.getToken();
    if (token) {
      try {
        const ike = await applyIke(resolvedFieldId, lv, purpose, token);
        pondId = ike.id;
      } catch {
        // NO_IKE_AVAILABLE や NETWORK_ERROR 等 → ローカルフォールバック
        pondId = assignPondId(resolvedFieldId, lv);
      }
    } else {
      pondId = assignPondId(resolvedFieldId, lv);
    }

    const existingStored = await AsyncStorage.getItem('pond_ponds');
    const existing: { field: string; level: LevelKey; pondId: string }[] = existingStored
      ? JSON.parse(existingStored)
      : [];
    const merged = existing.filter((p) => p.field !== field);
    merged.push({ field: resolvedFieldId, level: lv, pondId });
    await AsyncStorage.setItem('pond_ponds', JSON.stringify(merged));
    await AsyncStorage.setItem('pond_onboarding_done', 'true');

    setAssignedPondId(pondId);
    setPurposeSelected(true);

    const displayNameStored = await AsyncStorage.getItem('pond_display_name');
    const playerName = displayNameStored || 'あなた';
    const joinMsg = {
      id: `join-${Date.now()}`,
      user: 'system',
      avatar: '',
      level: lv,
      content: `${playerName}が参加しました。`,
      time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      isMe: false,
      type: 'system',
    };
    const chatKey = `challenge_chat_${pondId}`;
    const existing2 = await AsyncStorage.getItem(chatKey);
    const chatMsgs = existing2 ? JSON.parse(existing2) : [];
    await AsyncStorage.setItem(chatKey, JSON.stringify([...chatMsgs, joinMsg]));
  };

  const handleEnter = () => setDiving(true);

  const handleDiveComplete = () => {
    if (nextField) {
      router.replace({
        pathname: '/assessment',
        params: { field: nextField, queue: remainingQueue.slice(1).join(',') },
      });
    } else if (assignedPondId && judgedLevel) {
      router.replace({
        pathname: '/pond-chat',
        params: { field: field ?? 'programming', level: judgedLevel, pondId: assignedPondId },
      });
    } else {
      router.replace('/(tabs)');
    }
  };

  return {
    steps,
    stepIndex,
    messages,
    done,
    level,
    purposeSelected,
    diving,
    nextField,
    scrollRef,
    fadeAnim,
    fieldLabel: FIELD_LABELS[resolvedField] ?? resolvedField,
    nextFieldLabel: nextField ? (FIELD_LABELS[nextField] ?? nextField) : undefined,
    handleOption,
    handlePurpose,
    handleEnter,
    handleDiveComplete,
  };
}
