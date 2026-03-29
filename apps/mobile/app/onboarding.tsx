import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Radius, Spacing, Fields } from '@/constants/theme';
import type { FieldId } from '@/constants/theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Circle big enough to cover screen from bottom-center
const SPLASH_SIZE = Math.ceil(Math.sqrt(width * width + height * height)) * 2 + 80;

type IconSet = 'ionicons' | 'material' | 'fa5';
const FIELD_ICON_MAP: Record<string, { set: IconSet; name: string }> = {
  terminal: { set: 'material', name: 'code-tags' },
  functions: { set: 'material', name: 'sigma' },
  translate: { set: 'ionicons', name: 'language' },
  palette: { set: 'ionicons', name: 'color-palette-outline' },
  music_note: { set: 'ionicons', name: 'musical-notes-outline' },
  science: { set: 'material', name: 'flask-outline' },
};

function FieldIcon({ iconKey, color }: { iconKey: string; color: string }) {
  const cfg = FIELD_ICON_MAP[iconKey];
  if (!cfg) return null;
  if (cfg.set === 'ionicons') return <Ionicons name={cfg.name as any} size={26} color={color} />;
  return <MaterialCommunityIcons name={cfg.name as any} size={26} color={color} />;
}

export default function OnboardingScreen() {
  const [selected, setSelected] = useState<FieldId[]>([]);
  const splashScale = useSharedValue(0);

  useFocusEffect(useCallback(() => {
    splashScale.value = 0;
  }, [splashScale]));

  const splashStyle = useAnimatedStyle(() => ({
    transform: [{ scale: splashScale.value }],
  }));

  const toggle = (id: FieldId) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    if (selected.length === 0) return;
    await AsyncStorage.setItem('pond_selected_fields', JSON.stringify(selected));
    splashScale.value = withTiming(1, { duration: 480, easing: Easing.in(Easing.cubic) });
    setTimeout(() => {
      router.push({ pathname: '/assessment', params: { field: selected[0] } });
    }, 420);
  };

  return (
    <View style={styles.container}>
      {/* Decorative Background */}
      <View style={[styles.bgBlob, styles.bgBlob1]} />
      <View style={[styles.bgBlob, styles.bgBlob2]} />
      <View style={[styles.bgBlob, styles.bgBlob3]} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="water" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Pondへようこそ</Text>
          <Text style={styles.subtitle}>興味のある分野を選んでね</Text>
        </View>

        {/* Field Selection Grid */}
        <View style={styles.grid}>
          {Fields.map((field, index) => {
            const isSelected = selected.includes(field.id);
            const isOffset = index % 2 === 1;
            return (
              <TouchableOpacity
                key={field.id}
                onPress={() => toggle(field.id)}
                activeOpacity={0.8}
                style={[styles.cardWrapper, isOffset && styles.cardWrapperOffset]}
              >
                <BlurView intensity={20} tint="light" style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                ]}>
                  <View style={[
                    styles.iconContainer,
                    isSelected && styles.iconContainerSelected,
                  ]}>
                    <FieldIcon
                      iconKey={field.icon}
                      color={isSelected ? Colors.primary : Colors.secondary}
                    />
                  </View>
                  <Text style={[
                    styles.cardLabel,
                    isSelected && styles.cardLabelSelected,
                  ]}>
                    {field.label}
                  </Text>
                </BlurView>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Next Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.85}
            style={[styles.nextButton, selected.length === 0 && styles.nextButtonDisabled]}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>次へ</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom accent */}
      <LinearGradient
        colors={['transparent', `${Colors.primary}18`, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bottomAccent}
      />

      {/* Pond splash overlay */}
      <Animated.View style={[styles.splashCircle, splashStyle]} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  bgBlob: {
    position: 'absolute',
    borderRadius: Radius.full,
    opacity: 0.5,
  },
  bgBlob1: {
    top: '-10%',
    left: '-5%',
    width: width * 0.65,
    height: width * 0.65,
    backgroundColor: `${Colors.primaryFixed}66`,
  },
  bgBlob2: {
    top: '20%',
    right: '-10%',
    width: width * 0.55,
    height: width * 0.55,
    backgroundColor: `${Colors.primaryFixed}44`,
  },
  bgBlob3: {
    bottom: '-5%',
    left: '20%',
    width: width * 0.45,
    height: width * 0.45,
    backgroundColor: `${Colors.secondaryFixed}33`,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 80,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: `${Colors.primaryFixed}66`,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    // Asymmetric shape via shadow
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  title: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 32,
    color: Colors.onSurface,
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  cardWrapper: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
  },
  cardWrapperOffset: {
    marginTop: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${Colors.primary}0D`,
    minHeight: 110,
  },
  cardSelected: {
    borderColor: `${Colors.primary}33`,
    backgroundColor: `${Colors.primaryFixed}55`,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  iconContainerSelected: {
    backgroundColor: Colors.primaryFixed,
  },
  cardLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: Colors.onSecondaryContainer,
    textAlign: 'center',
  },
  cardLabelSelected: {
    color: Colors.primary,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  nextButton: {
    borderRadius: Radius.full,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonGradient: {
    paddingHorizontal: 56,
    paddingVertical: 16,
    borderRadius: Radius.full,
  },
  nextButtonText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: Colors.onPrimary,
    letterSpacing: 0.5,
  },
  splashCircle: {
    position: 'absolute',
    bottom: -(SPLASH_SIZE / 2) + 80,
    left: width / 2 - SPLASH_SIZE / 2,
    width: SPLASH_SIZE,
    height: SPLASH_SIZE,
    borderRadius: SPLASH_SIZE / 2,
    backgroundColor: Colors.primary,
  },
  bottomAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
});
