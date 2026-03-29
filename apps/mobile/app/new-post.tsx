import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Radius, Spacing, Levels } from '@/constants/theme';
import type { LevelKey } from '@/constants/theme';

const { width } = Dimensions.get('window');
const MAX_CHARS = 280;

type PondEntry = { field: string; level: LevelKey };

const FIELD_LABELS: Record<string, string> = {
  programming: 'プログラミング',
  math: '数学',
  english: '英語',
  art: 'アート',
  music: '音楽',
  science: '科学',
};

function FieldIcon({ field, color, size = 16 }: { field: string; color: string; size?: number }) {
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

export default function NewPostScreen() {
  const [ponds, setPonds] = useState<PondEntry[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    AsyncStorage.getItem('pond_ponds').then((stored) => {
      if (stored) {
        const loaded: PondEntry[] = JSON.parse(stored);
        setPonds(loaded);
        if (loaded.length > 0) setSelectedField(loaded[0].field);
      }
    });
    // Auto-focus after modal animation settles
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const selectedPond = ponds.find((p) => p.field === selectedField);
  const canPost = content.trim().length > 0 && selectedField !== null;
  const remaining = MAX_CHARS - content.length;

  const handlePost = async () => {
    if (!canPost || !selectedPond) return;

    const newPost = {
      id: `user-${Date.now()}`,
      user: 'あなた',
      avatar: 'あ',
      pond: FIELD_LABELS[selectedPond.field] ?? selectedPond.field,
      level: selectedPond.level,
      field: selectedPond.field,
      content: content.trim(),
      likes: 0,
      time: 'たった今',
      liked: false,
    };

    const stored = await AsyncStorage.getItem('pond_user_posts');
    const existing = stored ? JSON.parse(stored) : [];
    await AsyncStorage.setItem('pond_user_posts', JSON.stringify([newPost, ...existing]));
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <BlurView intensity={20} tint="light" style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} hitSlop={12}>
          <Ionicons name="close" size={22} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>新しい投稿</Text>
        <TouchableOpacity
          onPress={handlePost}
          disabled={!canPost}
          style={[styles.postBtn, !canPost && styles.postBtnDisabled]}
        >
          <LinearGradient
            colors={canPost ? [Colors.primary, Colors.primaryContainer] : [Colors.outlineVariant, Colors.outlineVariant]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.postBtnGradient}
          >
            <Text style={styles.postBtnText}>投稿する</Text>
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Composer row */}
        <View style={styles.composerRow}>
          {/* Avatar */}
          <LinearGradient
            colors={[Colors.primaryFixed, Colors.surfaceContainerHigh]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>あ</Text>
          </LinearGradient>

          {/* Input area */}
          <View style={styles.inputArea}>
            {selectedPond && (
              <View style={styles.selectedFieldRow}>
                <FieldIcon field={selectedPond.field} color={Colors.primary} size={13} />
                <Text style={styles.selectedFieldLabel}>
                  {FIELD_LABELS[selectedPond.field] ?? selectedPond.field}
                </Text>
                <Text style={styles.selectedLevelLabel}>{selectedPond.level}</Text>
              </View>
            )}
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={content}
              onChangeText={(t) => { if (t.length <= MAX_CHARS) setContent(t); }}
              placeholder="今日学んだこと、シェアしよう…"
              placeholderTextColor={Colors.outlineVariant}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Field selector */}
        {ponds.length > 0 && (
          <View style={styles.fieldSection}>
            <Text style={styles.fieldSectionLabel}>投稿する池</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.fieldChips}
            >
              {ponds.map((pond) => {
                const active = selectedField === pond.field;
                return (
                  <TouchableOpacity
                    key={pond.field}
                    onPress={() => setSelectedField(pond.field)}
                    style={[styles.fieldChip, active && styles.fieldChipActive]}
                  >
                    <FieldIcon
                      field={pond.field}
                      color={active ? Colors.primary : Colors.onSurfaceVariant}
                      size={14}
                    />
                    <Text style={[styles.fieldChipLabel, active && styles.fieldChipLabelActive]}>
                      {FIELD_LABELS[pond.field] ?? pond.field}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {ponds.length === 0 && (
          <View style={styles.noPondHint}>
            <Text style={styles.noPondHintText}>
              先に池を追加すると投稿できます
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Character counter */}
      <View style={styles.footer}>
        <Text style={[styles.charCount, remaining < 20 && styles.charCountWarn]}>
          {remaining}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    overflow: 'hidden',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 17,
    color: Colors.onSurface,
  },
  postBtn: {
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  postBtnDisabled: {
    opacity: 0.55,
  },
  postBtnGradient: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  postBtnText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    color: '#fff',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  composerRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: Colors.primary,
  },
  inputArea: {
    flex: 1,
    gap: Spacing.xs,
  },
  selectedFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  selectedFieldLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: Colors.primary,
  },
  selectedLevelLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  input: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.onSurface,
    lineHeight: 24,
    minHeight: 120,
    paddingTop: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.outlineVariant,
  },
  fieldSection: {
    gap: Spacing.sm,
  },
  fieldSectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  fieldChips: {
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  fieldChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fieldChipActive: {
    backgroundColor: Colors.primaryFixed,
    borderColor: `${Colors.primary}33`,
  },
  fieldChipLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  fieldChipLabelActive: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  noPondHint: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  noPondHintText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  footer: {
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 32 : Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.outlineVariant,
  },
  charCount: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  charCountWarn: {
    color: '#e05c7b',
  },
});
