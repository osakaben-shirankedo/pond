import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { WaterRippleButton } from '@/components/water-ripple-button';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  onAddPond: () => void;
};

export function EmptyPondsState({ onAddPond }: Props) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="water" size={56} color={Colors.primaryFixed} style={styles.icon} />
      <Text style={styles.emptyTitle}>まだ池がありません</Text>
      <Text style={styles.emptyDesc}>「+ 池を追加」から分野を選んで池に入ろう</Text>
      <WaterRippleButton
        onPress={onAddPond}
        style={styles.emptyBtnWrapper}
        rippleSize={72}
        rippleColor="rgba(255, 255, 255, 0.6)"
      >
        <LinearGradient
          colors={[Colors.primary, Colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.emptyBtn}
        >
          <Text style={styles.emptyBtnText}>池に入る</Text>
        </LinearGradient>
      </WaterRippleButton>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: { alignItems: 'center', paddingTop: 80, gap: Spacing.md },
  icon: { marginBottom: 8 },
  emptyTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 22,
    color: Colors.onSurface,
  },
  emptyDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyBtnWrapper: {
    marginTop: Spacing.md,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  emptyBtn: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: Radius.full,
  },
  emptyBtnText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: Colors.onPrimary,
  },
});
