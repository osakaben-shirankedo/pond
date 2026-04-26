import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useOnboardingStore } from '@/stores';
import type { FieldId } from '@/constants/fields';

export function useOnboarding() {
  const { selected, toggle, reset } = useOnboardingStore();
  const splashScale = useSharedValue(0);

  useFocusEffect(useCallback(() => {
    splashScale.value = 0;
    reset();
  }, [splashScale, reset]));

  const splashStyle = useAnimatedStyle(() => ({
    transform: [{ scale: splashScale.value }],
  }));

  const handleNext = async () => {
    if (selected.length === 0) return;
    await AsyncStorage.setItem('pond_selected_fields', JSON.stringify(selected));
    splashScale.value = withTiming(1, { duration: 480, easing: Easing.in(Easing.cubic) });
    setTimeout(() => {
      router.push({
        pathname: '/assessment',
        params: { field: selected[0] as FieldId, queue: selected.slice(1).join(',') },
      });
    }, 420);
  };

  return { selected, splashStyle, toggle, handleNext };
}
