import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Radius, Spacing, Levels } from '@/constants/theme';
import type { FieldId } from '@/constants/theme';
import { useAssessment } from '@/controllers/useAssessment';
import { PURPOSE_OPTIONS } from '@/models/pond-instance';
import PondDiveAnimation from '@/components/animations/PondDiveAnimation';

const { width } = Dimensions.get('window');

export default function AssessmentScreen() {
  const { field, queue } = useLocalSearchParams<{ field: FieldId; queue?: string }>();

  const {
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
    fieldLabel,
    nextFieldLabel,
    handleOption,
    handlePurpose,
    handleEnter,
    handleDiveComplete,
  } = useAssessment(field, queue);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background */}
      <View style={[styles.bgBlob, styles.bgBlob1]} />
      <View style={[styles.bgBlob, styles.bgBlob2]} />

      {/* Header */}
      <BlurView intensity={20} tint="light" style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI査定チャット</Text>
        <View style={styles.fieldBadge}>
          <Text style={styles.fieldBadgeText}>{fieldLabel}</Text>
        </View>
      </BlurView>

      {/* Chat */}
      <ScrollView
        ref={scrollRef}
        style={styles.chat}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi]}
          >
            {msg.role === 'ai' && (
              <View style={styles.aiAvatar}>
                <MaterialCommunityIcons name="fishbowl-outline" size={20} color={Colors.primary} />
              </View>
            )}
            <View style={[
              styles.bubbleText,
              msg.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAi,
            ]}>
              <Text style={[
                styles.bubbleMessage,
                msg.role === 'user' ? styles.bubbleMessageUser : styles.bubbleMessageAi,
              ]}>
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Options or Enter button */}
      {!done ? (
        <View style={styles.optionsContainer}>
          <BlurView intensity={20} tint="light" style={styles.optionsBlur}>
            <Text style={styles.optionsHint}>選んでください</Text>
            {steps[stepIndex].options.map((opt, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => handleOption(i)}
                activeOpacity={0.8}
                style={styles.optionBtn}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </BlurView>
        </View>
      ) : (
        <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
          {level && (
            <LinearGradient
              colors={[Colors.primaryFixed, Colors.surfaceContainerHigh]}
              style={styles.levelCard}
            >
              <Text style={styles.levelLabel}>{level}</Text>
              <Text style={styles.levelDesc}>{Levels[level].description}</Text>
            </LinearGradient>
          )}
          {!purposeSelected ? (
            <BlurView intensity={20} tint="light" style={styles.optionsBlur}>
              <Text style={styles.optionsHint}>目的・やり方を選んでください</Text>
              {PURPOSE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => handlePurpose(opt)}
                  activeOpacity={0.8}
                  style={styles.optionBtn}
                >
                  <Text style={styles.optionText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </BlurView>
          ) : (
            <TouchableOpacity onPress={handleEnter} activeOpacity={0.85} style={styles.enterBtn}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryContainer]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.enterBtnGradient}
              >
                {nextField ? (
                  <Text style={styles.enterBtnText}>{`次の池へ：${nextFieldLabel} →`}</Text>
                ) : (
                  <Text style={styles.enterBtnText}>
                    {'池に入る '}
                    <Text style={{ fontFamily: undefined }}>🌊</Text>
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
      {/* 飛び込みアニメーション */}
      <PondDiveAnimation
        visible={diving}
        levelName={level ?? ''}
        onComplete={handleDiveComplete}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  bgBlob: {
    position: 'absolute',
    borderRadius: Radius.full,
    opacity: 0.4,
  },
  bgBlob1: {
    top: '-5%',
    right: '-10%',
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: `${Colors.primaryFixed}88`,
  },
  bgBlob2: {
    bottom: '20%',
    left: '-15%',
    width: width * 0.5,
    height: width * 0.5,
    backgroundColor: `${Colors.secondaryFixed}55`,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: Colors.onSurface,
  },
  fieldBadge: {
    backgroundColor: Colors.primaryFixed,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  fieldBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: Colors.primary,
  },
  chat: {
    flex: 1,
  },
  chatContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  bubble: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-end',
  },
  bubbleUser: {
    flexDirection: 'row-reverse',
  },
  bubbleAi: {},
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bubbleText: {
    maxWidth: '75%',
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  bubbleTextAi: {
    backgroundColor: Colors.surfaceContainerLow,
    borderBottomLeftRadius: 4,
  },
  bubbleTextUser: {
    backgroundColor: Colors.primaryFixed,
    borderBottomRightRadius: 4,
  },
  bubbleMessage: {
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleMessageAi: {
    fontFamily: 'Inter_400Regular',
    color: Colors.onSurface,
  },
  bubbleMessageUser: {
    fontFamily: 'Inter_500Medium',
    color: Colors.onPrimaryFixed,
  },
  optionsContainer: {
    padding: Spacing.md,
  },
  optionsBlur: {
    borderRadius: Radius.xl,
    padding: Spacing.md,
    overflow: 'hidden',
    gap: Spacing.sm,
  },
  optionsHint: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  optionBtn: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: `${Colors.primary}1A`,
  },
  optionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.onSurface,
    lineHeight: 20,
  },
  resultContainer: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  levelCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  levelLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 28,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  levelDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  enterBtn: {
    borderRadius: Radius.full,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  enterBtnGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: Radius.full,
  },
  enterBtnText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: Colors.onPrimary,
    letterSpacing: 0.5,
  },
});
