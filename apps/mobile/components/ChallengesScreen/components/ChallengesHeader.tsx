import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Radius, Spacing } from '@/constants/theme';

export function ChallengesHeader({ week }: { week: number }) {
  return (
    <BlurView intensity={20} tint="light" style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>週次チャレンジ</Text>
        <Text style={styles.headerSubtitle}>AIが池ごとにお題を自動生成</Text>
      </View>
      <View style={styles.weekBadge}>
        <Text style={styles.weekBadgeText}>Week {week}</Text>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.onSurface },
  headerSubtitle: { fontSize: 12, color: Colors.onSurfaceVariant },
  weekBadge: { backgroundColor: Colors.primaryFixed, paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full },
  weekBadgeText: { fontWeight: '600', fontSize: 13, color: Colors.primary },
});