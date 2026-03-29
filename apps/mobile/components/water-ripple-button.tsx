import React, { useCallback } from 'react';
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface WaterRippleButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  rippleColor?: string;
  rippleSize?: number;
  pressDelay?: number;
}

export function WaterRippleButton({
  onPress,
  children,
  style,
  rippleColor = 'rgba(0, 150, 210, 0.55)',
  rippleSize = 56,
  pressDelay = 220,
}: WaterRippleButtonProps) {
  const s1 = useSharedValue(0);
  const o1 = useSharedValue(0);
  const s2 = useSharedValue(0);
  const o2 = useSharedValue(0);
  const s3 = useSharedValue(0);
  const o3 = useSharedValue(0);

  const animateRing = useCallback(
    (scale: typeof s1, opacity: typeof o1, delay: number) => {
      const DURATION = 850;
      scale.value = 0;
      opacity.value = 0;
      scale.value = withDelay(
        delay,
        withTiming(2.8, { duration: DURATION, easing: Easing.out(Easing.quad) })
      );
      opacity.value = withDelay(
        delay,
        withSequence(
          withTiming(0.7, { duration: 60 }),
          withTiming(0, { duration: DURATION - 60 })
        )
      );
    },
    []
  );

  const triggerRipple = useCallback(() => {
    animateRing(s1, o1, 0);
    animateRing(s2, o2, 190);
    animateRing(s3, o3, 380);
    setTimeout(onPress, pressDelay);
  }, [onPress, pressDelay, animateRing, s1, o1, s2, o2, s3, o3]);

  const ring1Style = useAnimatedStyle(() => ({
    opacity: o1.value,
    transform: [{ scale: s1.value }],
  }));
  const ring2Style = useAnimatedStyle(() => ({
    opacity: o2.value,
    transform: [{ scale: s2.value }],
  }));
  const ring3Style = useAnimatedStyle(() => ({
    opacity: o3.value,
    transform: [{ scale: s3.value }],
  }));

  const ringBase = {
    width: rippleSize,
    height: rippleSize,
    borderRadius: rippleSize / 2,
    borderWidth: 1.5,
    borderColor: rippleColor,
  };

  return (
    <Pressable onPress={triggerRipple} style={style}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.center}>
          <Animated.View style={[styles.ring, ringBase, ring1Style]} />
          <Animated.View style={[styles.ring, ringBase, ring2Style]} />
          <Animated.View style={[styles.ring, ringBase, ring3Style]} />
        </View>
      </View>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
});
