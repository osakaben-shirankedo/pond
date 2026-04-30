import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { WaterRippleButton } from '@/components/water-ripple-button';
import { FieldIcon } from '@/components/ui/field-icon';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { FIELD_LABELS } from '@/models/field';

const { width } = Dimensions.get('window');

type Props = {
  fieldIds: string[];
  onExplore: (fieldId: string) => void;
};

export function ExploreFieldsSection({ fieldIds, onExplore }: Props) {
  return (
    <View style={styles.exploreSection}>
      <Text style={styles.exploreSectionTitle}>他の分野を探す</Text>
      <View style={styles.exploreGrid}>
        {fieldIds.map((fieldId) => (
          <WaterRippleButton
            key={fieldId}
            onPress={() => onExplore(fieldId)}
            style={styles.exploreCard}
            rippleSize={48}
          >
            <BlurView intensity={15} tint="light" style={styles.exploreCardBlur}>
              <FieldIcon field={fieldId} color={Colors.secondary} size={24} />
              <Text style={styles.exploreLabel}>{FIELD_LABELS[fieldId]}</Text>
            </BlurView>
          </WaterRippleButton>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  exploreSection: { marginTop: Spacing.xl },
  exploreSectionTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: Colors.onSurface,
    marginBottom: Spacing.md,
  },
  exploreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  exploreCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  exploreCardBlur: {
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: `${Colors.primary}1A`,
  },
  exploreLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: Colors.onSecondaryContainer,
  },
});
