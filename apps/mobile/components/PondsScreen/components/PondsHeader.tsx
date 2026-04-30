import { BlurView } from 'expo-blur';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  onAddPond: () => void;
};

export function PondsHeader({ onAddPond }: Props) {
  return (
    <BlurView intensity={20} tint="light" style={styles.header}>
      <Text style={styles.headerTitle}>マイ池</Text>
      <TouchableOpacity onPress={onAddPond} style={styles.addBtn}>
        <Text style={styles.addBtnText}>+ 池を追加</Text>
      </TouchableOpacity>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    overflow: 'hidden',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 26,
    color: Colors.onSurface,
  },
  addBtn: {
    backgroundColor: Colors.primaryFixed,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  addBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.primary,
  },
});
