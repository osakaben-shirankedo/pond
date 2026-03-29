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
import { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Radius, Spacing, Levels } from '@/constants/theme';
import type { LevelKey, FieldId } from '@/constants/theme';

const { width } = Dimensions.get('window');

const FIELD_NAMES: Record<string, string> = {
  programming: 'プログラミング',
  math: '数学',
  english: '英語',
  art: 'アート',
  music: '音楽',
  science: '科学',
};

type Message = {
  id: string;
  role: 'ai' | 'user';
  text: string;
};

type AssessmentStep = {
  question: string;
  options: string[];
};

const ASSESSMENT_STEPS: Record<string, AssessmentStep[]> = {
  programming: [
    {
      question: 'プログラミングを始めてどのくらいですか？',
      options: ['始めたばかり（〜3ヶ月）', '少し経験あり（3ヶ月〜1年）', '経験あり（1〜3年）', 'かなり経験あり（3年以上）'],
    },
    {
      question: '主にどの言語・環境を使っていますか？',
      options: ['Scratch / ビジュアル言語', 'Python / JavaScript 基礎', 'Webアプリ / API開発', 'OSS貢献・競プロ上級'],
    },
    {
      question: '直近で作ったものを教えてください',
      options: ['まだ何も作ったことない', 'チュートリアル通りに作った', '自分でアレンジして作った', 'オリジナルのサービスを作った'],
    },
  ],
  math: [
    {
      question: '数学はどこまで学習しましたか？',
      options: ['中学数学まで', '高校数学（数I・数A）', '高校数学（数II・B・C）', '大学数学・競技数学'],
    },
    {
      question: '得意な分野はどれですか？',
      options: ['計算・方程式', '図形・幾何', '確率・統計', '微積・線形代数'],
    },
    {
      question: '数学の問題集はどのレベルを使っていますか？',
      options: ['教科書の基本問題', '定番問題集（チャートなど）', '入試・コンテスト問題', '数学オリンピックレベル'],
    },
  ],
  default: [
    {
      question: 'この分野を始めてどのくらいですか？',
      options: ['始めたばかり（〜3ヶ月）', '少し経験あり（3ヶ月〜1年）', '経験あり（1〜3年）', 'かなり経験あり（3年以上）'],
    },
    {
      question: '今の自分のレベルはどのくらいだと思いますか？',
      options: ['入門・基礎を学んでいる', '基礎は身についた', '応用・実践ができる', 'プロ・上級者レベル'],
    },
    {
      question: '直近でどんな活動をしていますか？',
      options: ['入門コンテンツを見ている', '練習・課題に取り組んでいる', 'コンテストや発表をしている', 'メンタリング・指導をしている'],
    },
  ],
};

function getSteps(field: string): AssessmentStep[] {
  return ASSESSMENT_STEPS[field] ?? ASSESSMENT_STEPS.default;
}

function judgeLevel(answers: number[]): LevelKey {
  const total = answers.reduce((a, b) => a + b, 0);
  const max = answers.length * 3;
  const ratio = total / max;
  if (ratio < 0.25) return '澄み池';
  if (ratio < 0.5) return '碧の池';
  if (ratio < 0.75) return '深碧池';
  return '蒼淵';
}

export default function AssessmentScreen() {
  const { field } = useLocalSearchParams<{ field: FieldId }>();
  const steps = getSteps(field ?? 'default');

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'ai',
      text: `${FIELD_NAMES[field ?? ''] ?? field}の池に入る前に、3つだけ質問させてください！\n\n${steps[0].question}`,
    },
  ]);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [level, setLevel] = useState<LevelKey | null>(null);
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
        text: `ありがとう！判定完了です✨\n\nあなたは「${judged}」からスタートです。\n${levelDesc(judged)}\n\n同じレベルの仲間が待ってるよ！`,
      });
      setMessages(newMessages);
      setLevel(judged);
      setDone(true);

      const stored = await AsyncStorage.getItem('pond_selected_fields');
      const fields: FieldId[] = stored ? JSON.parse(stored) : [field];
      const ponds = fields.map((f) => ({ field: f, level: judgeLevel(newAnswers) }));
      await AsyncStorage.setItem('pond_ponds', JSON.stringify(ponds));
      await AsyncStorage.setItem('pond_onboarding_done', 'true');
    }

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleEnter = () => {
    router.replace('/(tabs)');
  };

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
          <Text style={styles.fieldBadgeText}>{FIELD_NAMES[field ?? ''] ?? field}</Text>
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
          <TouchableOpacity onPress={handleEnter} activeOpacity={0.85} style={styles.enterBtn}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.enterBtnGradient}
            >
              <Text style={styles.enterBtnText}>池に入る 🌊</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

function levelDesc(level: LevelKey): string {
  return Levels[level].description;
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
  backIcon: {
    fontSize: 18,
    color: Colors.primary,
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
