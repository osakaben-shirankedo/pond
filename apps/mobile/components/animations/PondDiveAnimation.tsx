import { useEffect } from 'react';
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
// 画面の対角線 × 2.2 → どの位置から拡大しても画面を確実に覆う円サイズ
const POND_SIZE = Math.ceil(Math.sqrt(width * width + height * height) * 2.2);

// ── 泡ひとつ ──────────────────────────────────────────────
type BubbleProps = { x: number; startY: number; delay: number; size: number; duration: number };

function Bubble({ x, startY, delay, size, duration }: BubbleProps) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.2);

  useEffect(() => {
    // 出現 → 維持 → フェードアウト
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(0.8, { duration: 180 }),
        withTiming(0.7, { duration: duration * 0.5 }),
        withTiming(0, { duration: duration * 0.5, easing: Easing.out(Easing.quad) })
      )
    );

    // 出現時の弾むスケール
    scale.value = withDelay(delay, withSpring(1, { stiffness: 280, damping: 14 }));

    // 浮上
    translateY.value = withDelay(
      delay,
      withTiming(-(height * 0.75 + startY), { duration, easing: Easing.out(Easing.quad) })
    );

    // 左右にゆらゆら（ぶくぶく感）
    translateX.value = withDelay(
      delay,
      withSequence(
        withTiming(size * 0.8, { duration: duration * 0.28, easing: Easing.inOut(Easing.sin) }),
        withTiming(-size * 0.6, { duration: duration * 0.36, easing: Easing.inOut(Easing.sin) }),
        withTiming(size * 0.4, { duration: duration * 0.36, easing: Easing.inOut(Easing.sin) })
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          left: x - size / 2,
          top: startY - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    />
  );
}

// ── 水面の小さな波紋（池が現れた瞬間） ────────────────────
function SurfaceRipple({ delay, size }: { delay: number; size: number }) {
  const scale = useSharedValue(0.2);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withDelay(delay, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));
    opacity.value = withDelay(delay, withTiming(0, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.surfaceRipple,
        { width: size, height: size, borderRadius: size / 2, marginLeft: -size / 2, marginTop: -size / 2 },
        style,
      ]}
    />
  );
}

// ── メインコンポーネント ───────────────────────────────────
type Props = { visible: boolean; levelName: string; onComplete: () => void };

export default function PondDiveAnimation({ visible, levelName, onComplete }: Props) {
  // 池の円（小さく出現 → 画面いっぱいに拡大）
  const pondScale   = useSharedValue(0);
  const pondOpacity = useSharedValue(0);

  // 内側のハイライト円（水面の光）
  const glowScale   = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  // レベル名テキスト
  const labelOpacity = useSharedValue(0);
  const labelScale   = useSharedValue(0.75);

  // 最終フェードアウト
  const fadeOpacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;

    // ① 池の円が現れる（0 〜 120ms）
    pondOpacity.value = withTiming(1, { duration: 120 });
    pondScale.value   = withSpring(1, { stiffness: 48, damping: 16 });

    // ② 水面のハイライト（80ms〜）
    glowOpacity.value = withDelay(80,  withTiming(1,   { duration: 200 }));
    glowScale.value   = withDelay(80,  withSpring(1,   { stiffness: 55, damping: 18 }));
    // グローは徐々にフェードアウト
    glowOpacity.value = withDelay(400, withTiming(0,   { duration: 800 }));

    // ③ レベル名（1000ms〜）
    labelOpacity.value = withDelay(980,  withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
    labelScale.value   = withDelay(980,  withSpring(1, { stiffness: 130, damping: 13 }));

    // ④ フェードアウト（2200ms〜）
    fadeOpacity.value = withDelay(2200, withTiming(1, { duration: 480, easing: Easing.in(Easing.cubic) }));

    const timer = setTimeout(() => runOnJS(onComplete)(), 2700);
    return () => clearTimeout(timer);
  }, [visible]);

  const pondStyle  = useAnimatedStyle(() => ({ opacity: pondOpacity.value, transform: [{ scale: pondScale.value }] }));
  const glowStyle  = useAnimatedStyle(() => ({ opacity: glowOpacity.value, transform: [{ scale: glowScale.value }] }));
  const labelStyle = useAnimatedStyle(() => ({ opacity: labelOpacity.value, transform: [{ scale: labelScale.value }] }));
  const fadeStyle  = useAnimatedStyle(() => ({ opacity: fadeOpacity.value }));

  if (!visible) return null;

  // 泡のデータ（位置・サイズ・タイミング）
  const bubbles: BubbleProps[] = [
    { x: width * 0.10, startY: height * 0.88, delay: 280, size: 11, duration: 1450 },
    { x: width * 0.22, startY: height * 0.80, delay: 400, size:  7, duration: 1200 },
    { x: width * 0.35, startY: height * 0.92, delay: 340, size: 16, duration: 1600 },
    { x: width * 0.48, startY: height * 0.76, delay: 520, size:  9, duration: 1300 },
    { x: width * 0.58, startY: height * 0.86, delay: 370, size: 13, duration: 1500 },
    { x: width * 0.70, startY: height * 0.94, delay: 460, size:  6, duration: 1100 },
    { x: width * 0.82, startY: height * 0.83, delay: 310, size: 10, duration: 1380 },
    { x: width * 0.90, startY: height * 0.90, delay: 590, size:  8, duration: 1250 },
    { x: width * 0.15, startY: height * 0.70, delay: 640, size:  5, duration:  980 },
    { x: width * 0.42, startY: height * 0.96, delay: 480, size: 12, duration: 1420 },
    { x: width * 0.65, startY: height * 0.68, delay: 700, size:  7, duration: 1050 },
    { x: width * 0.78, startY: height * 0.74, delay: 560, size: 14, duration: 1480 },
    { x: width * 0.30, startY: height * 0.62, delay: 760, size:  6, duration:  920 },
    { x: width * 0.52, startY: height * 0.84, delay: 430, size:  9, duration: 1320 },
    { x: width * 0.05, startY: height * 0.78, delay: 500, size:  8, duration: 1200 },
  ];

  return (
    <View style={styles.container} pointerEvents="none">

      {/* ── 池の円（青が拡大） ── */}
      <Animated.View style={[styles.pondCircle, pondStyle]} />

      {/* ── 水面ハイライト（光の反射） ── */}
      <Animated.View style={[styles.pondGlow, glowStyle]} />

      {/* ── 水面の波紋（池が現れた瞬間） ── */}
      <View style={styles.rippleOrigin}>
        {[80, 140, 210].map((s, i) => (
          <SurfaceRipple key={i} delay={i * 80} size={s} />
        ))}
      </View>

      {/* ── ぶくぶく泡 ── */}
      {bubbles.map((b, i) => (
        <Bubble key={i} {...b} />
      ))}

      {/* ── レベル名 ── */}
      <Animated.View style={[styles.labelContainer, labelStyle]}>
        <Animated.Text style={styles.labelSub}>ようこそ</Animated.Text>
        <Animated.Text style={styles.labelMain}>{levelName}</Animated.Text>
        <Animated.Text style={styles.labelSub}>へ</Animated.Text>
      </Animated.View>

      {/* ── フェードアウト ── */}
      <Animated.View style={[styles.fadeOut, fadeStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 拡大する池の円
  pondCircle: {
    position: 'absolute',
    width: POND_SIZE,
    height: POND_SIZE,
    borderRadius: POND_SIZE / 2,
    backgroundColor: '#1a7ab5',  // 深い水の青
  },

  // 水面ハイライト（少し明るい円）
  pondGlow: {
    position: 'absolute',
    width: POND_SIZE * 0.55,
    height: POND_SIZE * 0.55,
    borderRadius: POND_SIZE,
    backgroundColor: 'rgba(100, 200, 255, 0.22)',
    transform: [{ translateY: -POND_SIZE * 0.12 }],
  },

  // 波紋の中心
  rippleOrigin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },

  // 水面波紋
  surfaceRipple: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(180, 230, 255, 0.7)',
  },

  // 泡
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(220, 245, 255, 0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.75)',
  },

  // レベル名
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    gap: 6,
  },
  labelSub: {
    fontSize: 16,
    color: 'rgba(220, 245, 255, 0.9)',
    fontFamily: 'Inter_500Medium',
    letterSpacing: 1,
  },
  labelMain: {
    fontSize: 44,
    color: '#ffffff',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 40, 100, 0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 20,
  },

  // フェードアウト
  fadeOut: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a7ab5',
  },
});
