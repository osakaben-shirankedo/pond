import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export function ChallengesEmptyState() {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="trophy-outline" size={48} color={Colors.primaryFixed} />
      <Text style={styles.emptyText}>まだ挑戦したチャレンジはありません</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 16 },
  emptyText: { fontSize: 14, color: Colors.onSurfaceVariant },
});