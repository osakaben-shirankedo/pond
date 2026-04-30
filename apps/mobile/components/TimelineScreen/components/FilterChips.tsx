import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Filter = {
  id: string;
  label: string;
};

type Props = {
  filters: Filter[];
  activeFilter: string;
  onSelect: (filterId: string) => void;
};

export function FilterChips({ filters, activeFilter, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterRow}
      contentContainerStyle={styles.filterContent}
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          onPress={() => onSelect(filter.id)}
          style={[styles.chip, activeFilter === filter.id && styles.chipActive]}
        >
          <Text style={[styles.chipText, activeFilter === filter.id && styles.chipTextActive]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexGrow: 0, paddingVertical: Spacing.sm },
  filterContent: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLow,
  },
  chipActive: { backgroundColor: Colors.primaryFixed },
  chipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  chipTextActive: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
});
