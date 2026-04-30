import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';

interface Props {
  activeTab: 'active' | 'past';
  onTabChange: (tab: 'active' | 'past') => void;
  pastCount: number;
}

export function ChallengesTabs({ activeTab, onTabChange, pastCount }: Props) {
  return (
    <View style={styles.tabRow}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'active' && styles.tabActive]}
        onPress={() => onTabChange('active')}
      >
        <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>今週のチャレンジ</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'past' && styles.tabActive]}
        onPress={() => onTabChange('past')}
      >
        <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>過去のチャレンジ</Text>
        {pastCount > 0 && (
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{pastCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerLow,
    backgroundColor: Colors.surface,
  },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '500', color: Colors.onSurfaceVariant },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },
  tabBadge: { backgroundColor: Colors.primaryFixed, borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 2 },
  tabBadgeText: { fontWeight: '700', fontSize: 10, color: Colors.primary },
});