import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { FieldIcon } from '@/components/ui/field-icon';
import { FIELD_LABELS } from '@/models/field';
import { useNewPost } from '@/controllers/useNewPost';

export default function NewPostScreen() {
  const {
    ponds,
    selectedField,
    setSelectedField,
    selectedPond,
    content,
    handleContentChange,
    canPost,
    remaining,
    inputRef,
    handlePost,
  } = useNewPost();

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

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
        {/* Composer row */}
        <View style={styles.composerRow}>
          <LinearGradient colors={[Colors.primaryFixed, Colors.surfaceContainerHigh]} style={styles.avatar}>
            <Text style={styles.avatarText}>あ</Text>
          </LinearGradient>
          <View style={styles.inputArea}>
            {selectedPond && (
              <View style={styles.selectedFieldRow}>
                <FieldIcon field={selectedPond.field} color={Colors.primary} size={13} />
                <Text style={styles.selectedFieldLabel}>{FIELD_LABELS[selectedPond.field] ?? selectedPond.field}</Text>
                <Text style={styles.selectedLevelLabel}>{selectedPond.level}</Text>
              </View>
            )}
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={content}
              onChangeText={handleContentChange}
              placeholder="今日学んだこと、シェアしよう…"
              placeholderTextColor={Colors.outlineVariant}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Field selector */}
        {ponds.length > 0 && (
          <View style={styles.fieldSection}>
            <Text style={styles.fieldSectionLabel}>投稿する池</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fieldChips}>
              {ponds.map((pond) => {
                const active = selectedField === pond.field;
                return (
                  <TouchableOpacity
                    key={pond.field}
                    onPress={() => setSelectedField(pond.field)}
                    style={[styles.fieldChip, active && styles.fieldChipActive]}
                  >
                    <FieldIcon field={pond.field} color={active ? Colors.primary : Colors.onSurfaceVariant} size={14} />
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
            <Text style={styles.noPondHintText}>先に池を追加すると投稿できます</Text>
          </View>
        )}
      </ScrollView>

      {/* Character counter */}
      <View style={styles.footer}>
        <Text style={[styles.charCount, remaining < 20 && styles.charCountWarn]}>{remaining}</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
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
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: Colors.onSurface },
  postBtn: { borderRadius: Radius.full, overflow: 'hidden' },
  postBtnDisabled: { opacity: 0.55 },
  postBtnGradient: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full },
  postBtnText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#fff' },
  body: { flex: 1 },
  bodyContent: { padding: Spacing.lg, gap: Spacing.lg },
  composerRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  avatar: { width: 44, height: 44, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.primary },
  inputArea: { flex: 1, gap: Spacing.xs },
  selectedFieldRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  selectedFieldLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: Colors.primary },
  selectedLevelLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.onSurfaceVariant },
  input: { fontFamily: 'Inter_400Regular', fontSize: 16, color: Colors.onSurface, lineHeight: 24, minHeight: 120, paddingTop: 4 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.outlineVariant },
  fieldSection: { gap: Spacing.sm },
  fieldSectionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: Colors.onSurfaceVariant },
  fieldChips: { gap: Spacing.sm, paddingVertical: 2 },
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
  fieldChipActive: { backgroundColor: Colors.primaryFixed, borderColor: `${Colors.primary}33` },
  fieldChipLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Colors.onSurfaceVariant },
  fieldChipLabelActive: { color: Colors.primary, fontFamily: 'Inter_600SemiBold' },
  noPondHint: { alignItems: 'center', paddingVertical: Spacing.xl },
  noPondHintText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant },
  footer: {
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 32 : Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.outlineVariant,
  },
  charCount: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Colors.onSurfaceVariant },
  charCountWarn: { color: '#e05c7b' },
});
