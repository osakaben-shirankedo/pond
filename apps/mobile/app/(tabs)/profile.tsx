import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput, Modal, KeyboardAvoidingView, Platform, Switch, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Radius, Spacing, Levels } from '@/constants/theme';
import { FieldIcon } from '@/components/ui/field-icon';
import { AvatarSprite } from '@/components/avatar-sprite';
import { AvatarPicker } from '@/components/avatar-picker';
import { FIELD_LABELS } from '@/models/field';
import { useProfile } from '@/controllers/useProfile';
import { api } from '@/services/api';
import { authStorage } from '@/services/auth';

export const PROFILE_NAME_KEY = 'pond_display_name';
export const PROFILE_BIO_KEY = 'pond_bio';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const {
    ponds, avatarId, pickerVisible,
    openPicker, closePicker, selectAvatar,
    STATS, SETTINGS_ITEMS, handleLogout, handleJoinPond,
    profile, handle,
  } = useProfile();

  const [displayName, setDisplayName] = useState('ユーザー');
  const [bio, setBio] = useState('');
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');

  // 設定モーダル
  const [settingModal, setSettingModal] = useState<'notifications' | 'privacy' | 'help' | null>(null);

  // プッシュ通知設定
  const [notifNewMessage,  setNotifNewMessage]  = useState(true);
  const [notifChallenge,   setNotifChallenge]   = useState(true);
  const [notifLike,        setNotifLike]        = useState(true);
  const [notifComment,     setNotifComment]     = useState(true);

  // プライバシー設定
  const [privacyProfile,  setPrivacyProfile]  = useState(true);
  const [privacyActivity, setPrivacyActivity] = useState(true);

  const NOTIF_KEYS = {
    newMessage: 'notif_new_message',
    challenge:  'notif_challenge',
    like:       'notif_like',
    comment:    'notif_comment',
  };
  const PRIVACY_KEYS = {
    profile:  'privacy_profile',
    activity: 'privacy_activity',
  };

  // 通知・プライバシー設定をストレージから復元
  useEffect(() => {
    AsyncStorage.multiGet([
      NOTIF_KEYS.newMessage, NOTIF_KEYS.challenge, NOTIF_KEYS.like, NOTIF_KEYS.comment,
      PRIVACY_KEYS.profile, PRIVACY_KEYS.activity,
    ]).then((pairs) => {
      const map = Object.fromEntries(pairs.map(([k, v]) => [k, v]));
      if (map[NOTIF_KEYS.newMessage]  !== null) setNotifNewMessage(map[NOTIF_KEYS.newMessage]  !== 'false');
      if (map[NOTIF_KEYS.challenge]   !== null) setNotifChallenge(map[NOTIF_KEYS.challenge]    !== 'false');
      if (map[NOTIF_KEYS.like]        !== null) setNotifLike(map[NOTIF_KEYS.like]              !== 'false');
      if (map[NOTIF_KEYS.comment]     !== null) setNotifComment(map[NOTIF_KEYS.comment]        !== 'false');
      if (map[PRIVACY_KEYS.profile]   !== null) setPrivacyProfile(map[PRIVACY_KEYS.profile]   !== 'false');
      if (map[PRIVACY_KEYS.activity]  !== null) setPrivacyActivity(map[PRIVACY_KEYS.activity] !== 'false');
    });
  }, []);

  // サーバープロフィールが読み込まれたらローカル状態に反映
  useEffect(() => {
    if (profile?.name) setDisplayName(profile.name);
    if (profile?.bio !== undefined) setBio(profile.bio);
  }, [profile]);

  const toggleNotif = async (key: string, value: boolean) => {
    await AsyncStorage.setItem(key, String(value));
  };
  const togglePrivacy = async (key: string, value: boolean) => {
    await AsyncStorage.setItem(key, String(value));
  };

  const handleSettingItem = (action: string) => {
    setSettingModal(action as 'notifications' | 'privacy' | 'help');
  };

  const openEdit = () => {
    setEditName(displayName);
    setEditBio(bio);
    setEditVisible(true);
  };

  const saveEdit = async () => {
    const trimName = editName.trim() || displayName;
    const trimBio = editBio.trim();
    setDisplayName(trimName);
    setBio(trimBio);
    await AsyncStorage.multiSet([[PROFILE_NAME_KEY, trimName], [PROFILE_BIO_KEY, trimBio]]);
    const token = await authStorage.getToken();
    if (token) {
      await api.post('/profile/edit', { name: trimName, bio: trimBio }, token);
    }
    setEditVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={openPicker} activeOpacity={0.85} style={styles.avatarWrapper}>
            <LinearGradient colors={[Colors.primaryFixed, Colors.surfaceContainerHigh]} style={styles.avatarLarge}>
              <AvatarSprite presetId={avatarId} size={56} />
            </LinearGradient>
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={11} color={Colors.onPrimary} />
            </View>
          </TouchableOpacity>
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{displayName}</Text>
            <TouchableOpacity onPress={openEdit} style={styles.editNameBtn} hitSlop={8}>
              <Ionicons name="pencil-outline" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          {handle ? <Text style={styles.handle}>{handle}</Text> : null}
          <Text style={styles.bio}>{bio || '自己紹介を追加しよう'}</Text>
        </View>

        <AvatarPicker
          visible={pickerVisible}
          selectedId={avatarId}
          onSelect={selectAvatar}
          onClose={closePicker}
        />

        {/* Stats */}
        <BlurView intensity={20} tint="light" style={styles.statsCard}>
          {STATS.map((stat, i) => (
            <View key={i} style={[styles.statItem, i < STATS.length - 1 && styles.statItemBorder]}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </BlurView>

        {/* My ponds */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>所属している池</Text>
          {ponds.length === 0 ? (
            <View style={styles.noPonds}>
              <Text style={styles.noPondsText}>まだ池に入っていません</Text>
              <TouchableOpacity onPress={handleJoinPond} style={styles.joinPondBtn}>
                <Text style={styles.joinPondBtnText}>池に入る →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            ponds.map((pond, i) => (
              <View key={i} style={styles.pondRow}>
                <View style={styles.pondRowIcon}>
                  <FieldIcon field={pond.field} color={Colors.secondary} size={20} />
                </View>
                <View style={styles.pondRowInfo}>
                  <Text style={styles.pondRowField}>{FIELD_LABELS[pond.field] ?? pond.field}</Text>
                  <Text style={styles.pondRowLevel}>{pond.level} · {Levels[pond.level]?.description}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>設定</Text>
          <View style={styles.settingsCard}>
            {SETTINGS_ITEMS.map((item, i) => (
              <TouchableOpacity key={i} style={styles.settingsRow} onPress={() => handleSettingItem(item.action)}>
                <Ionicons name={item.iconName} size={20} color={Colors.onSurfaceVariant} />
                <Text style={styles.settingsLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>ログアウト（オンボーディングに戻る）</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 編集モーダル */}
      <Modal visible={editVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalWrap} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setEditVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>プロフィールを編集</Text>
            <Text style={styles.inputLabel}>表示名</Text>
            <TextInput
              style={styles.textInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="表示名を入力"
              placeholderTextColor={Colors.outlineVariant}
              maxLength={30}
              returnKeyType="next"
            />
            <Text style={styles.inputLabel}>自己紹介</Text>
            <TextInput
              style={[styles.textInput, styles.textInputMulti]}
              value={editBio}
              onChangeText={setEditBio}
              placeholder="自己紹介を入力"
              placeholderTextColor={Colors.outlineVariant}
              multiline
              maxLength={150}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{editBio.length} / 150</Text>
            <TouchableOpacity onPress={saveEdit} style={styles.saveBtn}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryContainer]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveBtnGradient}
              >
                <Text style={styles.saveBtnText}>保存する</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditVisible(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* プッシュ通知モーダル */}
      <Modal visible={settingModal === 'notifications'} animationType="slide" transparent>
        <View style={styles.modalWrap}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setSettingModal(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>プッシュ通知</Text>
            {[
              { label: '新着メッセージ',       value: notifNewMessage, key: NOTIF_KEYS.newMessage, set: setNotifNewMessage },
              { label: 'チャレンジ参加・クリア', value: notifChallenge,  key: NOTIF_KEYS.challenge,  set: setNotifChallenge },
              { label: 'いいね',               value: notifLike,       key: NOTIF_KEYS.like,       set: setNotifLike },
              { label: 'コメント',             value: notifComment,    key: NOTIF_KEYS.comment,    set: setNotifComment },
            ].map((item) => (
              <View key={item.key} style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>{item.label}</Text>
                <Switch
                  value={item.value}
                  onValueChange={(v) => { item.set(v); toggleNotif(item.key, v); }}
                  trackColor={{ false: Colors.outlineVariant, true: Colors.primaryFixedDim }}
                  thumbColor={item.value ? Colors.primary : Colors.surfaceContainerHigh}
                />
              </View>
            ))}
            <TouchableOpacity onPress={() => setSettingModal(null)} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>閉じる</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* プライバシー設定モーダル */}
      <Modal visible={settingModal === 'privacy'} animationType="slide" transparent>
        <View style={styles.modalWrap}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setSettingModal(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>プライバシー設定</Text>
            {[
              { label: 'プロフィールを公開する',   desc: '他のメンバーがあなたのプロフィールを閲覧できます', value: privacyProfile,  key: PRIVACY_KEYS.profile,  set: setPrivacyProfile },
              { label: 'アクティビティを公開する', desc: '投稿・チャレンジ参加履歴が他のメンバーに見えます', value: privacyActivity, key: PRIVACY_KEYS.activity, set: setPrivacyActivity },
            ].map((item) => (
              <View key={item.key} style={styles.toggleRowLarge}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>{item.label}</Text>
                  <Text style={styles.toggleDesc}>{item.desc}</Text>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={(v) => { item.set(v); togglePrivacy(item.key, v); }}
                  trackColor={{ false: Colors.outlineVariant, true: Colors.primaryFixedDim }}
                  thumbColor={item.value ? Colors.primary : Colors.surfaceContainerHigh}
                />
              </View>
            ))}
            <TouchableOpacity onPress={() => setSettingModal(null)} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>閉じる</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ヘルプモーダル */}
      <Modal visible={settingModal === 'help'} animationType="slide" transparent>
        <View style={styles.modalWrap}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setSettingModal(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>ヘルプ</Text>
            {[
              { icon: 'water-outline'       as const, title: '池とは？',         body: '同じ分野・レベルの仲間と学ぶグループです。チャットで交流したり、チャレンジに一緒に挑戦できます。' },
              { icon: 'flash-outline'       as const, title: 'チャレンジとは？', body: '毎週更新されるお題に回答して仲間と競いましょう。クリアするとポイントが貯まります。' },
              { icon: 'fish-outline'        as const, title: 'AI魚とは？',       body: '池の会話が止まったときに話題を提供してくれるAIです。チャット画面の🐟ボタンから呼び出せます。' },
              { icon: 'star-outline'        as const, title: 'ポイントとは？',   body: 'チャレンジをクリアすると獲得できます。池内ランキングに反映されます。' },
              { icon: 'help-circle-outline' as const, title: 'お問い合わせ',     body: 'ご不明な点はサポートまでご連絡ください。', isLink: true },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.helpItem}
                activeOpacity={item.isLink ? 0.7 : 1}
                onPress={item.isLink ? () => Linking.openURL('mailto:support@pond-app.example') : undefined}
              >
                <View style={styles.helpIconWrap}>
                  <Ionicons name={item.icon} size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.helpTitle}>{item.title}</Text>
                  <Text style={styles.helpBody}>{item.body}</Text>
                </View>
                {item.isLink && <Ionicons name="chevron-forward" size={16} color={Colors.outlineVariant} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setSettingModal(null)} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>閉じる</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  blob: { position: 'absolute', borderRadius: Radius.full, opacity: 0.3 },
  blob1: { top: -60, right: -30, width: width * 0.55, height: width * 0.55, backgroundColor: Colors.primaryFixed },
  blob2: { top: 300, left: -50, width: width * 0.5, height: width * 0.5, backgroundColor: Colors.secondaryFixed },
  content: { paddingTop: 72, paddingHorizontal: Spacing.lg, gap: Spacing.xl },
  profileHeader: { alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.lg },
  avatarWrapper: { position: 'relative', marginBottom: Spacing.sm },
  editBadge: {
    position: 'absolute', bottom: 2, right: 2, width: 24, height: 24,
    borderRadius: Radius.full, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.surface,
  },
  avatarLarge: {
    width: 88, height: 88, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 20,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  displayName: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22, color: Colors.onSurface },
  editNameBtn: {
    width: 28, height: 28, borderRadius: Radius.full,
    backgroundColor: Colors.primaryFixed, alignItems: 'center', justifyContent: 'center',
  },
  handle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant },
  bio: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 22, marginTop: Spacing.xs },
  statsCard: { flexDirection: 'row', borderRadius: Radius.xl, overflow: 'hidden', padding: Spacing.lg },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statItemBorder: { borderRightWidth: 1, borderRightColor: `${Colors.outlineVariant}66` },
  statValue: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: Colors.primary },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.onSurfaceVariant, textAlign: 'center' },
  section: { gap: Spacing.md },
  sectionTitle: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, color: Colors.onSurface },
  noPonds: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', gap: Spacing.md },
  noPondsText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant },
  joinPondBtn: { backgroundColor: Colors.primaryFixed, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full },
  joinPondBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.primary },
  pondRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.lg, padding: Spacing.md,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8,
  },
  pondRowIcon: { width: 44, height: 44, borderRadius: Radius.full, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  pondRowInfo: { flex: 1 },
  pondRowField: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 15, color: Colors.onSurface },
  pondRowLevel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant },
  settingsCard: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.xl, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8,
  },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: `${Colors.surfaceContainerHigh}aa`,
  },
  settingsLabel: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 15, color: Colors.onSurface },
  logoutBtn: { padding: Spacing.lg, alignItems: 'center' },
  logoutText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant, textDecorationLine: 'underline' },
  modalWrap: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing.xl, paddingBottom: 48, gap: Spacing.md,
  },
  modalHandle: { width: 40, height: 4, borderRadius: Radius.full, backgroundColor: Colors.outlineVariant, alignSelf: 'center', marginBottom: Spacing.sm },
  modalTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.onSurface, textAlign: 'center' },
  inputLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.onSurfaceVariant },
  textInput: {
    backgroundColor: Colors.surfaceContainerLow, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.onSurface,
  },
  textInputMulti: { minHeight: 100, textAlignVertical: 'top' },
  charCount: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.outlineVariant, textAlign: 'right', marginTop: -Spacing.sm },
  saveBtn: { borderRadius: Radius.full, overflow: 'hidden', marginTop: Spacing.sm },
  saveBtnGradient: { paddingVertical: 14, alignItems: 'center', borderRadius: Radius.full },
  saveBtnText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#fff' },
  cancelBtn: { alignItems: 'center', paddingVertical: 10 },
  cancelBtnText: { fontFamily: 'Inter_500Medium', fontSize: 15, color: Colors.onSurfaceVariant },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerLow },
  toggleLabel: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 15, color: Colors.onSurface },
  toggleDesc: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  toggleRowLarge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerLow },
  helpItem: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerLow },
  helpIconWrap: { width: 36, height: 36, borderRadius: Radius.full, backgroundColor: Colors.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  helpTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.onSurface },
  helpBody: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant, lineHeight: 18, marginTop: 2 },
});
