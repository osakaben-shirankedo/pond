import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  visible: boolean;
  value: string;
  bottomInset: number;
  onChangeText: (text: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

export function EditPostSheet({
  visible,
  value,
  bottomInset,
  onChangeText,
  onCancel,
  onSave,
}: Props) {
  if (!visible) return null;

  const disabled = value.trim().length === 0;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.overlayBackdrop} activeOpacity={1} onPress={onCancel} />
      <View style={[styles.editSheet, { paddingBottom: bottomInset }]}>
        <View style={styles.editHeader}>
          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.editCancel}>キャンセル</Text>
          </TouchableOpacity>
          <Text style={styles.editTitle}>投稿を編集</Text>
          <TouchableOpacity onPress={onSave} disabled={disabled}>
            <Text style={[styles.editSave, disabled && styles.editSaveDisabled]}>保存</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.editInput}
          value={value}
          onChangeText={onChangeText}
          multiline
          autoFocus
          maxLength={300}
          placeholderTextColor={Colors.onSurfaceVariant}
        />
        <Text style={styles.editCharCount}>{300 - value.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  editSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '70%',
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerLow,
  },
  editTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: Colors.onSurface,
  },
  editCancel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Colors.onSurfaceVariant,
  },
  editSave: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 15,
    color: Colors.primary,
  },
  editSaveDisabled: { opacity: 0.4 },
  editInput: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.onSurface,
    lineHeight: 24,
    padding: Spacing.lg,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  editCharCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    textAlign: 'right',
    paddingRight: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
});
