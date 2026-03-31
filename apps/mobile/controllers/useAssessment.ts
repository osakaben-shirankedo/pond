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
import { api } from '@/services/api';
import { authStorage } from '@/services/auth';

type ServerIke = {
  id: string;
  ike_name: string;
  member_ids: string[];
  chat_room_id: string;
};

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
      newMessages.push({
        id: `ai-${next}`,
        role: 'ai',
        text: steps[next].question,
      });
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
      // サーバーに申し込み → サーバーが池にアサインして返す
      const { data, error } = await api.post<ServerIke>('/ike/apply', {
        field: resolvedFieldId,
        level: lv,
        purpose,
      }, token);

      if (data && !error) {
        pondId = data.id;
      } else {
        // 利用可能な池がない or エラー → ローカルフォールバック
        pondId = assignPondId(resolvedFieldId, lv);
      }
    } else {
      // 未ログイン → ローカルアサイン
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

    setPurposeSelected(true);
  };

  const handleEnter = () => {
    setDiving(true);
  };

  const handleDiveComplete = () => {
    if (nextField) {
      router.replace({
        pathname: '/assessment',
        params: {
          field: nextField,
          queue: remainingQueue.slice(1).join(','),
        },
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
