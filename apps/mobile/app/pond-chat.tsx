import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { FieldIcon } from '@/components/ui/field-icon';
import { AvatarSprite } from '@/components/avatar-sprite';
import { LEVEL_GRADIENTS } from '@/models/pond';
import { type ChatMessage } from '@/models/pond-chat';
import { usePondChat } from '@/controllers/usePondChat';

const { width } = Dimensions.get('window');

export default function PondChatScreen() {
  const { field, level, pondId } = useLocalSearchParams<{ field: string; level: string; pondId: string }>();
  const { fieldLabel, levelKey, messages, text, setText, listRef, handleSend, members, memberCount, myAvatarId, ranking } =
    usePondChat(field ?? '', level ?? '澄み池', pondId ?? '');

  const [showMembers, setShowMembers] = useState(false);
  const [memberTab, setMemberTab] = useState<'members' | 'ranking'>('members');
  const [showMenu, setShowMenu] = useState(false);

  const handleLeave = () => {
    setShowMenu(false);
    Alert.alert(
      'この池から退出しますか？',
      '退出すると、この池のチャット履歴にアクセスできなくなります。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '退出する',
          style: 'destructive',
          onPress: async () => {
            const stored = await AsyncStorage.getItem('pond_ponds');
            const ponds: Array<{ field: string }> = stored ? JSON.parse(stored) : [];
            await AsyncStorage.setItem(
              'pond_ponds',
              JSON.stringify(ponds.filter((p) => p.field !== field))
            );
            router.replace('/(tabs)/ponds');
          },
        },
      ]
    );
  };

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
        {/* AvatarSprite で表示 */}
        <AvatarSprite presetId={item.avatarId ?? 'fishbowl'} size={34} />
        <View style={styles.bubbleOtherGroup}>
          <View style={styles.senderRow}>
            <Text style={styles.senderName}>{item.user}</Text>
            <View style={styles.levelPill}>
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
          <View style={[styles.levelChip, { backgroundColor: LEVEL_GRADIENTS[levelKey][0] }]}>
            <Text style={styles.levelChipText}>{levelKey}</Text>
          </View>
        </View>

        {/* メンバーボタン */}
        <TouchableOpacity
          style={styles.memberBadge}
          onPress={() => setShowMembers(true)}
          hitSlop={8}
        >
          <Ionicons name="people-outline" size={16} color={Colors.primary} />
          <Text style={styles.memberCount}>{memberCount}</Text>
        </TouchableOpacity>

        {/* 三本線メニュー */}
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => setShowMenu(true)}
          hitSlop={8}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
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
        <AvatarSprite presetId={myAvatarId} size={32} />
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

      {/* メンバーシート */}
      {showMembers && (
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayBackdrop} activeOpacity={1} onPress={() => setShowMembers(false)} />
          <View style={styles.memberSheet}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>
                池のメンバー <Text style={styles.sheetTitleAccent}>{memberCount}人</Text>
              </Text>
              <TouchableOpacity onPress={() => setShowMembers(false)} style={styles.sheetClose}>
                <Ionicons name="close" size={20} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
            {/* タブ */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tab, memberTab === 'members' && styles.tabActive]}
                onPress={() => setMemberTab('members')}
              >
                <Text style={[styles.tabText, memberTab === 'members' && styles.tabTextActive]}>メンバー</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, memberTab === 'ranking' && styles.tabActive]}
                onPress={() => setMemberTab('ranking')}
              >
                <Text style={[styles.tabText, memberTab === 'ranking' && styles.tabTextActive]}>ランキング</Text>
              </TouchableOpacity>
            </View>
            {memberTab === 'members' ? (
              <ScrollView showsVerticalScrollIndicator={false} style={styles.memberList}>
                {members.map((m) => (
                  <View key={m.id} style={styles.memberRow}>
                    <AvatarSprite presetId={m.avatarId} size={44} />
                    <View style={styles.memberInfo}>
                      <View style={styles.memberNameRow}>
                        <Text style={styles.memberName}>{m.name}</Text>
                        {m.isMe && (
                          <View style={styles.meBadge}>
                            <Text style={styles.meBadgeText}>あなた</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.memberLevel}>{m.level}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} style={styles.memberList}>
                {ranking.map((m) => (
                  <View key={m.id} style={styles.rankRow}>
                    <Text style={[styles.rankNum, m.rank === 1 && styles.rankGold, m.rank === 2 && styles.rankSilver, m.rank === 3 && styles.rankBronze]}>
                      {m.rank}
                    </Text>
                    <AvatarSprite presetId={m.avatarId} size={40} />
                    <View style={styles.memberInfo}>
                      <View style={styles.memberNameRow}>
                        <Text style={styles.memberName}>{m.name}</Text>
                        {m.isMe && (
                          <View style={styles.meBadge}>
                            <Text style={styles.meBadgeText}>あなた</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Text style={styles.rankPoints}>{m.points.toLocaleString()} pt</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      )}

      {/* 退出メニュー */}
      {showMenu && (
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayBackdrop} activeOpacity={1} onPress={() => setShowMenu(false)} />
          <View style={styles.menuSheet}>
            <View style={{ alignSelf: 'center', marginTop: 8, width: 40, height: 4, borderRadius: Radius.full, backgroundColor: Colors.outlineVariant }} />
            <TouchableOpacity style={styles.menuItem} onPress={handleLeave}>
              <Ionicons name="exit-outline" size={22} color="#e05c7b" />
              <Text style={styles.menuItemTextDanger}>この池から退出する</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, styles.menuItemCancel]} onPress={() => setShowMenu(false)}>
              <Text style={styles.menuItemTextCancel}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: Colors.onSurface },

  // レベルチップ（白文字で見やすく）
  levelChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  levelChipText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#fff',
    letterSpacing: 0.3,
  },

  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryFixed,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  memberCount: { fontFamily: 'Inter_700Bold', fontSize: 13, color: Colors.primary },
  menuBtn: { padding: 4 },

  // メッセージ
  listContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.xl, gap: Spacing.md },
  rowOther: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm, maxWidth: width * 0.82 },
  bubbleOtherGroup: { flex: 1, gap: 3 },
  senderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginLeft: 2 },
  senderName: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: Colors.onSurfaceVariant },
  levelPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryFixed,
  },
  levelPillText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: Colors.primary,
    letterSpacing: 0.2,
  },
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

  // 入力バー
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

  // オーバーレイ共通
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  // メンバーシート
  memberSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerLow,
  },
  sheetHandle: {
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.outlineVariant,
  },
  sheetTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: Colors.onSurface,
    marginTop: Spacing.sm,
  },
  sheetTitleAccent: { color: Colors.primary },
  sheetClose: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  memberList: { padding: Spacing.lg },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerLow,
  },
  memberInfo: { flex: 1 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  memberName: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 15, color: Colors.onSurface },
  meBadge: { backgroundColor: Colors.primaryFixed, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
  meBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: Colors.primary },
  memberLevel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },

  // タブ
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerLow },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: Colors.onSurfaceVariant },
  tabTextActive: { color: Colors.primary, fontFamily: 'Inter_700Bold' },

  // ランキング
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerLow,
  },
  rankNum: {
    width: 28,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 18,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  rankGold: { color: '#F4A500' },
  rankSilver: { color: '#9E9E9E' },
  rankBronze: { color: '#A0522D' },
  rankPoints: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    color: Colors.primary,
    minWidth: 64,
    textAlign: 'right',
  },

  // 退出メニュー
  menuSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingBottom: 48,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerLow,
  },
  menuItemCancel: { justifyContent: 'center', borderBottomWidth: 0 },
  menuItemTextDanger: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#e05c7b' },
  menuItemTextCancel: { fontFamily: 'Inter_500Medium', fontSize: 16, color: Colors.onSurfaceVariant, textAlign: 'center', flex: 1 },
});
