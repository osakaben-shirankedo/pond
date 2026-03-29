import { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';

interface LikeButtonProps {
  liked: boolean;
  count: number;
  onPress: () => void;
}

function useParticle(dx: number, dy: number, delay: number) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const o = useSharedValue(0);
  const s = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: s.value },
    ],
    opacity: o.value,
  }));

  const start = useCallback(() => {
    x.value = 0; y.value = 0; o.value = 0; s.value = 0;
    x.value = withDelay(delay, withTiming(dx, { duration: 560, easing: Easing.out(Easing.quad) }));
    y.value = withDelay(delay, withTiming(dy, { duration: 560, easing: Easing.out(Easing.quad) }));
    o.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 60 }),
      withTiming(0, { duration: 500 }),
    ));
    s.value = withDelay(delay, withSequence(
      withTiming(1.2, { duration: 60 }),
      withTiming(0.3, { duration: 500 }),
    ));
  }, [delay, dx, dy, x, y, o, s]);

  return { style, start };
}

export function LikeButton({ liked, count, onPress }: LikeButtonProps) {
  const heartScale = useSharedValue(1);

  const p1 = useParticle(-12, -42, 0);
  const p2 = useParticle(0,  -58, 70);
  const p3 = useParticle(13, -36, 140);
  const p4 = useParticle(-5, -50, 35);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handlePress = useCallback(() => {
    if (!liked) {
      heartScale.value = withSequence(
        withTiming(1.6, { duration: 130, easing: Easing.out(Easing.quad) }),
        withSpring(1, { damping: 7, stiffness: 220 }),
      );
      p1.start(); p2.start(); p3.start(); p4.start();
    } else {
      heartScale.value = withSequence(
        withTiming(0.72, { duration: 90, easing: Easing.in(Easing.quad) }),
        withTiming(1, { duration: 130, easing: Easing.out(Easing.quad) }),
      );
    }
    onPress();
  }, [liked, onPress, heartScale, p1, p2, p3, p4]);

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <View style={styles.heartWrapper}>
        {/* Floating particles */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={styles.center}>
            <Animated.Text style={[styles.particle, p1.style]}>♥</Animated.Text>
            <Animated.Text style={[styles.particle, p2.style]}>♥</Animated.Text>
            <Animated.Text style={[styles.particle, p3.style]}>♥</Animated.Text>
            <Animated.Text style={[styles.particle, p4.style]}>♥</Animated.Text>
          </View>
        </View>
        {/* Heart icon */}
        <Animated.View style={heartStyle}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? '#e05c7b' : Colors.onSurfaceVariant}
          />
        </Animated.View>
      </View>
      <Text style={[styles.count, liked && styles.countActive]}>{count}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  heartWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    fontSize: 9,
    color: '#e05c7b',
  },
  count: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  countActive: {
    color: '#e05c7b',
  },
});
