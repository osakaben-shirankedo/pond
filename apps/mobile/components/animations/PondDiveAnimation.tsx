import { useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

function Ripple({ delay, size }: { delay: number; size: number }) {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withTiming(1, { duration: 1800, easing: Easing.out(Easing.cubic) })
    );
    opacity.value = withDelay(
      delay,
      withTiming(0, { duration: 1800, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.ripple,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          marginLeft: -size / 2,
          marginTop: -size / 2,
        },
        style,
      ]}
    />
  );
}

function Bubble({ x, delay, size }: { x: number; delay: number; size: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.8);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(-height * 0.6, { duration: 1400, easing: Easing.out(Easing.quad) })
    );
    opacity.value = withDelay(
      delay,
      withTiming(0, { duration: 1400, easing: Easing.out(Easing.quad) })
    );
    scale.value = withDelay(
      delay,
      withTiming(0.3, { duration: 1400, easing: Easing.out(Easing.quad) })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          left: x,
          bottom: height * 0.1,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    />
  );
}

type Props = {
  visible: boolean;
  levelName: string;
  onComplete: () => void;
};

export default function PondDiveAnimation({ visible, levelName, onComplete }: Props) {
  const surfaceScale = useSharedValue(1);
  const surfaceTranslateY = useSharedValue(0);
  const flashOpacity = useSharedValue(0);
  const underwaterOpacity = useSharedValue(0);
  const caustic1Opacity = useSharedValue(0.15);
  const caustic1TranslateX = useSharedValue(-20);
  const labelOpacity = useSharedValue(0);
  const labelTranslateY = useSharedValue(20);
  const labelSubOpacity = useSharedValue(0);
  const labelMainOpacity = useSharedValue(0);
  const labelMainScale = useSharedValue(0.85);
  const labelSub2Opacity = useSharedValue(0);
  const fadeOutOpacity = useSharedValue(0);

  const started = useRef(false);

  useEffect(() => {
    if (!visible || started.current) return;
    started.current = true;

    // Phase 1: 落下 (0-600ms)
    surfaceScale.value = withTiming(6, { duration: 600, easing: Easing.in(Easing.cubic) });
    surfaceTranslateY.value = withTiming(height * 0.3, { duration: 600, easing: Easing.in(Easing.cubic) });

    // Phase 2: 着水フラッシュ (550-850ms)
    flashOpacity.value = withDelay(
      550,
      withSequence(
        withTiming(1, { duration: 150, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 150, easing: Easing.inOut(Easing.quad) })
      )
    );

    // Phase 3: 水中背景 (600ms+)
    underwaterOpacity.value = withDelay(600, withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }));
    caustic1Opacity.value = withDelay(700, withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.sin) }));
    caustic1TranslateX.value = withDelay(700, withTiming(20, { duration: 1000, easing: Easing.inOut(Easing.sin) }));

    // Phase 4: 池名テキスト (900ms+)
    labelOpacity.value = withDelay(900, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    labelTranslateY.value = withDelay(900, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
    labelSubOpacity.value = withDelay(950, withTiming(0.8, { duration: 400 }));
    labelMainOpacity.value = withDelay(1000, withSpring(1, { stiffness: 120, damping: 14 }));
    labelMainScale.value = withDelay(1000, withSpring(1, { stiffness: 120, damping: 14 }));
    labelSub2Opacity.value = withDelay(1100, withTiming(0.8, { duration: 400 }));

    // Phase 5: フェードアウト (2100ms+)
    fadeOutOpacity.value = withDelay(2100, withTiming(1, { duration: 500, easing: Easing.in(Easing.quad) }));

    const timer = setTimeout(() => runOnJS(onComplete)(), 2600);
    return () => clearTimeout(timer);
  }, [visible]);

  const surfaceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: surfaceScale.value }, { translateY: surfaceTranslateY.value }],
  }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flashOpacity.value }));
  const underwaterStyle = useAnimatedStyle(() => ({ opacity: underwaterOpacity.value }));
  const caustic1Style = useAnimatedStyle(() => ({
    opacity: caustic1Opacity.value,
    transform: [{ translateX: caustic1TranslateX.value }],
  }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
    transform: [{ translateY: labelTranslateY.value }],
  }));
  const labelSubStyle = useAnimatedStyle(() => ({ opacity: labelSubOpacity.value }));
  const labelMainStyle = useAnimatedStyle(() => ({
    opacity: labelMainOpacity.value,
    transform: [{ scale: labelMainScale.value }],
  }));
  const labelSub2Style = useAnimatedStyle(() => ({ opacity: labelSub2Opacity.value }));
  const fadeOutStyle = useAnimatedStyle(() => ({ opacity: fadeOutOpacity.value }));

  if (!visible) return null;

  const bubbles = [
    { x: width * 0.15, delay: 600, size: 10 },
    { x: width * 0.28, delay: 750, size: 6 },
    { x: width * 0.42, delay: 620, size: 14 },
    { x: width * 0.55, delay: 800, size: 8 },
    { x: width * 0.67, delay: 680, size: 11 },
    { x: width * 0.78, delay: 720, size: 7 },
    { x: width * 0.88, delay: 640, size: 9 },
    { x: width * 0.08, delay: 860, size: 5 },
    { x: width * 0.35, delay: 900, size: 12 },
    { x: width * 0.60, delay: 950, size: 6 },
    { x: width * 0.72, delay: 820, size: 10 },
  ];

  return (
    <View style={styles.container} pointerEvents="none">

      {/* Phase 1: 落下 */}
      <Animated.View style={[styles.surfaceLayer, surfaceStyle]}>
        <View style={styles.waterSurface}>
          {[220, 160, 110, 70, 40].map((s, i) => (
            <View
              key={i}
              style={[
                styles.waterRing,
                {
                  width: s,
                  height: s * 0.35,
                  borderRadius: s / 2,
                  marginLeft: -s / 2,
                  marginTop: -(s * 0.35) / 2,
                  borderColor: `rgba(0, 97, 148, ${0.12 + i * 0.06})`,
                },
              ]}
            />
          ))}
          <View style={styles.impactGlow} />
        </View>
      </Animated.View>

      {/* Phase 2: 着水フラッシュ */}
      <Animated.View style={[styles.flashLayer, flashStyle]} />

      {/* Phase 3: 水中背景 */}
      <Animated.View style={[styles.underwaterBg, underwaterStyle]}>
        <Animated.View style={[styles.causticLight, caustic1Style]} />
      </Animated.View>

      {/* 波紋 */}
      {[280, 200, 130].map((s, i) => (
        <View key={i} style={styles.rippleOrigin}>
          <Ripple delay={620 + i * 120} size={s} />
        </View>
      ))}

      {/* 泡 */}
      {bubbles.map((b, i) => (
        <Bubble key={i} x={b.x} delay={b.delay} size={b.size} />
      ))}

      {/* 池名テキスト */}
      <Animated.View style={[styles.labelContainer, labelStyle]}>
        <Animated.Text style={[styles.labelSub, labelSubStyle]}>ようこそ</Animated.Text>
        <Animated.Text style={[styles.labelMain, labelMainStyle]}>{levelName}</Animated.Text>
        <Animated.Text style={[styles.labelSub, labelSub2Style]}>へ</Animated.Text>
      </Animated.View>

      {/* フェードアウト */}
      <Animated.View style={[styles.fadeOut, fadeOutStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    overflow: 'hidden',
  },
  surfaceLayer: {
    position: 'absolute',
    width,
    height,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterSurface: {
    width: width,
    height: height * 0.3,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: width,
    borderTopRightRadius: width,
    overflow: 'hidden',
  },
  waterRing: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  impactGlow: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    width: 30,
    height: 30,
    marginLeft: -15,
    marginTop: -15,
    borderRadius: 15,
    backgroundColor: '#fff',
    opacity: 0.6,
  },
  flashLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
  },
  underwaterBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primaryContainer,
    overflow: 'hidden',
  },
  causticLight: {
    position: 'absolute',
    top: '10%',
    left: '20%',
    width: width * 0.6,
    height: height * 0.4,
    borderRadius: width,
    backgroundColor: Colors.primaryFixed,
    opacity: 0.2,
  },
  rippleOrigin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
  ripple: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: Colors.primaryFixed,
  },
  bubble: {
    position: 'absolute',
    backgroundColor: Colors.surfaceContainerLowest,
    opacity: 0.7,
    borderWidth: 1,
    borderColor: Colors.primaryFixed,
  },
  labelContainer: {
    position: 'absolute',
    top: '42%',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 4,
  },
  labelSub: {
    fontSize: 16,
    color: Colors.primaryFixed,
    fontFamily: 'Inter_500Medium',
    opacity: 0.8,
  },
  labelMain: {
    fontSize: 42,
    color: '#ffffff',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: 2,
    textShadowColor: `${Colors.primary}88`,
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
  },
  fadeOut: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primaryContainer,
  },
});
