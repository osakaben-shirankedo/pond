import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useRef, useCallback } from 'react';
import { Colors, Radius, Spacing, Levels } from '@/constants/theme';
import type { LevelKey } from '@/constants/theme';

const { width } = Dimensions.get('window');

type Message = {
  id: string;
  user: string;
  avatar: string;
  level: LevelKey;
  content: string;
  time: string;
  isMe: boolean;
};

const FIELD_LABELS: Record<string, string> = {
  programming: 'プログラミング',
  math: '数学',
  english: '英語',
  art: 'アート',
  music: '音楽',
  science: '科学',
};

const SEED_MESSAGES: Record<string, Omit<Message, 'id' | 'isMe'>[]> = {
  programming: [
    { user: 'かわうそ太郎', avatar: 'か', level: '碧の池', content: 'みなさん今TypeScript書いてますか？型推論が楽しすぎる', time: '10:12' },
    { user: 'フナ次郎', avatar: 'ふ', level: '深碧池', content: 'TSいいよね。anyを使わない縛りで書くとかなり力がつく', time: '10:14' },
    { user: 'めだか花子', avatar: 'め', level: '澄み池', content: 'まだJSです…TSって最初から入れた方がいいですか？', time: '10:17' },
    { user: 'かわうそ太郎', avatar: 'か', level: '碧の池', content: '絶対最初から入れた方がいい！後から移行がしんどい', time: '10:19' },
    { user: 'コイ子', avatar: 'こ', level: '澄み池', content: '今週のチャレンジのAPI連携、みんなどのくらい進んだ？', time: '10:35' },
    { user: 'フナ次郎', avatar: 'ふ', level: '深碧池', content: 'とりあえずfetch完成。エラーハンドリングが残ってる', time: '10:38' },
  ],
  math: [
    { user: 'さくら鯛', avatar: 'さ', level: '澄み池', content: '二次方程式の解の公式、ようやく暗記できた！', time: '09:05' },
    { user: 'めだか花子', avatar: 'め', level: '碧の池', content: 'わかるw 最初しんどいよね。微分に入るともっと楽しくなる', time: '09:08' },
    { user: 'かわうそ太郎', avatar: 'か', level: '深碧池', content: '積分まで来ると世界変わる。面積が求められる感動', time: '09:11' },
    { user: 'さくら鯛', avatar: 'さ', level: '澄み池', content: '今は確率やってます。組み合わせとか楽しい', time: '09:20' },
    { user: 'コイ子', avatar: 'こ', level: '碧の池', content: '確率いいよね。ベイズ定理まで行くと実用的になってくる', time: '09:25' },
  ],
  english: [
    { user: 'フナ次郎', avatar: 'ふ', level: '深碧池', content: 'TOEIC 750越えた！リスニングはPodcast 1.5倍速がよかった', time: '11:00' },
    { user: 'さくら鯛', avatar: 'さ', level: '碧の池', content: 'すごい！私は今600台で停滞中…', time: '11:03' },
    { user: 'めだか花子', avatar: 'め', level: '澄み池', content: 'シャドーイングって効果ありますか？', time: '11:06' },
    { user: 'フナ次郎', avatar: 'ふ', level: '深碧池', content: 'シャドーイングかなり効く。最初はゆっくりから', time: '11:08' },
    { user: 'コイ子', avatar: 'こ', level: '碧の池', content: 'Netflixの英語字幕で見るのもいい。楽しいし続く', time: '11:15' },
  ],
  art: [
    { user: 'コイ子', avatar: 'こ', level: '碧の池', content: '今週のチャレンジ「影の描き方」、光源意識したら急に上手くなった', time: '14:00' },
    { user: 'さくら鯛', avatar: 'さ', level: '澄み池', content: '私も！影って奥深いよね。色も混ぜると立体感でる', time: '14:05' },
    { user: 'めだか花子', avatar: 'め', level: '碧の池', content: 'デジタルと手書きどっちで練習してる？', time: '14:10' },
    { user: 'コイ子', avatar: 'こ', level: '碧の池', content: '手書きから始めてiPadに移行した。どっちも大事だと思う', time: '14:13' },
  ],
  music: [
    { user: 'かわうそ太郎', avatar: 'か', level: '澄み池', content: 'ドレミファソラシド覚えたぞ！次はコードかな', time: '16:00' },
    { user: 'フナ次郎', avatar: 'ふ', level: '深碧池', content: 'コードはC・G・Am・Fで大体の曲弾ける。まずそこから！', time: '16:04' },
    { user: 'さくら鯛', avatar: 'さ', level: '碧の池', content: 'Cメジャーだけで色んな曲できるの感動する', time: '16:08' },
    { user: 'コイ子', avatar: 'こ', level: '澄み池', content: 'ギターとピアノどっちがおすすめ？', time: '16:15' },
    { user: 'フナ次郎', avatar: 'ふ', level: '深碧池', content: '独学ならギターかな。コードブックがわかりやすい', time: '16:18' },
  ],
  science: [
    { user: 'めだか花子', avatar: 'め', level: '碧の池', content: '化学式の暗記コツある？元素記号が全然頭に入らない', time: '13:00' },
    { user: 'かわうそ太郎', avatar: 'か', level: '深碧池', content: '語呂合わせが最強。水兵リーベ僕の船…古典的だけど効く', time: '13:04' },
    { user: 'さくら鯛', avatar: 'さ', level: '澄み池', content: '周期表のパターンで覚えると応用がきく', time: '13:07' },
    { user: 'フナ次郎', avatar: 'ふ', level: '碧の池', content: '今は物理やってる。運動方程式が面白い', time: '13:20' },
    { user: 'めだか花子', avatar: 'め', level: '碧の池', content: '物理いいな。ベクトルと合わせて理解すると気持ちいい', time: '13:25' },
  ],
};

const LEVEL_GRADIENTS: Record<LevelKey, [string, string]> = {
  '澄み池': [Colors.primaryFixed, Colors.surfaceContainerHigh],
  '碧の池': [Colors.primaryFixedDim, Colors.primaryFixed],
  '深碧池': [Colors.primaryContainer, Colors.primaryFixedDim],
  '蒼淵': [Colors.primary, Colors.primaryContainer],
};

function FieldIcon({ field, color, size = 18 }: { field: string; color: string; size?: number }) {
  switch (field) {
    case 'programming': return <MaterialCommunityIcons name="code-tags" size={size} color={color} />;
    case 'math': return <MaterialCommunityIcons name="sigma" size={size} color={color} />;
    case 'english': return <Ionicons name="language" size={size} color={color} />;
    case 'art': return <Ionicons name="color-palette-outline" size={size} color={color} />;
    case 'music': return <Ionicons name="musical-notes-outline" size={size} color={color} />;
    case 'science': return <MaterialCommunityIcons name="flask-outline" size={size} color={color} />;
    default: return <Ionicons name="water" size={size} color={color} />;
  }
}

let msgCounter = 100;

export default function PondChatScreen() {
  const { field, level } = useLocalSearchParams<{ field: string; level: string }>();
  const fieldLabel = FIELD_LABELS[field] ?? field;
  const levelKey = (level as LevelKey) ?? '澄み池';

  const seedMessages = (SEED_MESSAGES[field] ?? []).map((m, i) => ({
    ...m,
    id: String(i),
    isMe: false,
  }));

  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newMsg: Message = {
      id: String(msgCounter++),
      user: 'あなた',
      avatar: 'あ',
      level: levelKey,
      content: trimmed,
      time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }, [text, levelKey]);

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    if (item.isMe) {
      return (
        <View style={styles.rowMe}>
          <View style={styles.timeMe}>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.bubbleMe]}
          >
            <Text style={styles.bubbleTextMe}>{item.content}</Text>
          </LinearGradient>
        </View>
      );
    }
    return (
      <View style={styles.rowOther}>
        <LinearGradient
          colors={LEVEL_GRADIENTS[item.level]}
          style={styles.avatarCircle}
        >
          <Text style={styles.avatarText}>{item.avatar}</Text>
        </LinearGradient>
        <View style={styles.bubbleOtherGroup}>
          <View style={styles.senderRow}>
            <Text style={styles.senderName}>{item.user}</Text>
            <View style={[styles.levelPill, { backgroundColor: LEVEL_GRADIENTS[item.level][0] }]}>
              <Text style={styles.levelPillText}>{item.level}</Text>
            </View>
          </View>
          <View style={[styles.bubble, styles.bubbleOther]}>
            <Text style={styles.bubbleTextOther}>{item.content}</Text>
          </View>
          <Text style={styles.timeOther}>{item.time}</Text>
        </View>
      </View>
    );
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Decorative blobs */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      {/* Header */}
      <BlurView intensity={20} tint="light" style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <FieldIcon field={field} color={Colors.primary} size={20} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{fieldLabel}</Text>
          <View style={[styles.levelPill, { backgroundColor: LEVEL_GRADIENTS[levelKey][0] }]}>
            <Text style={styles.levelPillText}>{levelKey}</Text>
          </View>
        </View>
        <View style={styles.memberBadge}>
          <Ionicons name="people-outline" size={14} color={Colors.onSurfaceVariant} />
          <Text style={styles.memberCount}>24</Text>
        </View>
      </BlurView>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Input bar */}
      <BlurView intensity={30} tint="light" style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="メッセージを送る…"
          placeholderTextColor={Colors.outlineVariant}
          multiline
          maxLength={400}
          returnKeyType="default"
        />
        <TouchableOpacity
          onPress={handleSend}
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          disabled={!text.trim()}
        >
          <LinearGradient
            colors={text.trim() ? [Colors.primary, Colors.primaryContainer] : [Colors.outlineVariant, Colors.outlineVariant]}
            style={styles.sendBtnGradient}
          >
            <Ionicons name="arrow-up" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  blob: {
    position: 'absolute',
    borderRadius: Radius.full,
    opacity: 0.25,
  },
  blob1: {
    top: -40,
    right: -30,
    width: width * 0.5,
    height: width * 0.5,
    backgroundColor: Colors.primaryFixed,
  },
  blob2: {
    bottom: 120,
    left: -40,
    width: width * 0.4,
    height: width * 0.4,
    backgroundColor: Colors.secondaryFixed,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 17,
    color: Colors.onSurface,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  memberCount: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  levelPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  levelPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: Colors.primary,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  // Other's message row
  rowOther: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    maxWidth: width * 0.82,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    color: Colors.primary,
  },
  bubbleOtherGroup: {
    flex: 1,
    gap: 3,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginLeft: 2,
  },
  senderName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  timeOther: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.outlineVariant,
    marginLeft: 4,
  },
  // My message row
  rowMe: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    gap: Spacing.xs,
  },
  timeMe: {
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  timeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.outlineVariant,
  },
  // Bubbles
  bubble: {
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    maxWidth: width * 0.68,
  },
  bubbleMe: {
    borderBottomRightRadius: 6,
  },
  bubbleOther: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderBottomLeftRadius: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  bubbleTextMe: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  bubbleTextOther: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.onSurface,
    lineHeight: 20,
  },
  // Input
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 32 : Spacing.md,
    gap: Spacing.sm,
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.outlineVariant,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.onSurface,
  },
  sendBtn: {
    marginBottom: 1,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnGradient: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
