import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { FieldIcon } from '@/components/ui/field-icon';
import { LEVEL_GRADIENTS } from '@/models/pond';
import { type ChatMessage } from '@/models/pond-chat';
import { usePondChat } from '@/controllers/usePondChat';

const { width } = Dimensions.get('window');

export default function PondChatScreen() {
  const { field, level } = useLocalSearchParams<{ field: string; level: string }>();
  const { fieldLabel, levelKey, messages, text, setText, listRef, handleSend } =
    usePondChat(field ?? '', level ?? '澄み池');

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
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
        <LinearGradient colors={LEVEL_GRADIENTS[item.level]} style={styles.avatarCircle}>
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
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      {/* Header */}
      <BlurView intensity={20} tint="light" style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <FieldIcon field={field ?? ''} color={Colors.primary} size={20} />
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
  container: { flex: 1, backgroundColor: Colors.surface },
  blob: { position: 'absolute', borderRadius: Radius.full, opacity: 0.25 },
  blob1: { top: -40, right: -30, width: width * 0.5, height: width * 0.5, backgroundColor: Colors.primaryFixed },
  blob2: { bottom: 120, left: -40, width: width * 0.4, height: width * 0.4, backgroundColor: Colors.secondaryFixed },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { width: 36, height: 36, borderRadius: Radius.full, backgroundColor: Colors.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: Colors.onSurface },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.surfaceContainerLow, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  memberCount: { fontFamily: 'Inter_500Medium', fontSize: 12, color: Colors.onSurfaceVariant },
  levelPill: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
  levelPillText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: Colors.primary },
  listContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.xl, gap: Spacing.md },
  rowOther: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm, maxWidth: width * 0.82 },
  avatarCircle: { width: 34, height: 34, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: Colors.primary },
  bubbleOtherGroup: { flex: 1, gap: 3 },
  senderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginLeft: 2 },
  senderName: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: Colors.onSurfaceVariant },
  timeOther: { fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.outlineVariant, marginLeft: 4 },
  rowMe: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end', gap: Spacing.xs },
  timeMe: { alignSelf: 'flex-end', marginBottom: 4 },
  timeText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.outlineVariant },
  bubble: { borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, maxWidth: width * 0.68 },
  bubbleMe: { borderBottomRightRadius: 6 },
  bubbleOther: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderBottomLeftRadius: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  bubbleTextMe: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#fff', lineHeight: 20 },
  bubbleTextOther: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurface, lineHeight: 20 },
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
  sendBtn: { marginBottom: 1 },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnGradient: { width: 40, height: 40, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
});
