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
        text: `ありがとう！判定完了です✨\n\nあなたは「${judged}」からスタートです。\n${getLevelDescription(judged)}\n\n同じレベルの仲間が待ってるよ！`,
      });
      setMessages(newMessages);
      setLevel(judged);
      setDone(true);

      const existingStored = await AsyncStorage.getItem('pond_ponds');
      const existing: { field: string; level: LevelKey; pondId: string }[] = existingStored
        ? JSON.parse(existingStored)
        : [];
      const resolvedFieldId = field ?? 'programming';
      const pondId = assignPondId(resolvedFieldId, judged);
      const merged = existing.filter((p) => p.field !== field);
      merged.push({ field: resolvedFieldId, level: judged, pondId });
      await AsyncStorage.setItem('pond_ponds', JSON.stringify(merged));
      await AsyncStorage.setItem('pond_onboarding_done', 'true');
    }

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleEnter = () => {
    if (nextField) {
      router.replace({
        pathname: '/assessment',
        params: {
          field: nextField,
          queue: remainingQueue.slice(1).join(','),
        },
      });
    } else {
      setDiving(true);
    }
  };

  const handleDiveComplete = () => {
    router.replace('/(tabs)');
  };

  return {
    steps,
    stepIndex,
    messages,
    done,
    level,
    diving,
    nextField,
    scrollRef,
    fadeAnim,
    fieldLabel: FIELD_LABELS[resolvedField] ?? resolvedField,
    nextFieldLabel: nextField ? (FIELD_LABELS[nextField] ?? nextField) : undefined,
    handleOption,
    handleEnter,
    handleDiveComplete,
  };
}
