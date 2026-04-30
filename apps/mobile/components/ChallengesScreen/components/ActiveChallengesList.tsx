import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Radius, Spacing } from '@/constants/theme';

export function ActiveChallengesList({ items }: { items: any[] }) {
  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="flash" size={14} color={Colors.primary} />
        <Text style={styles.title}>参加中のチャレンジ</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{items.length}</Text>
        </View>
      </View>
      
      {items.map((ch) => (
        <View key={ch.id} style={styles.item}>
          <View style={styles.info}>
            <Text style={styles.itemTitle} numberOfLines={1}>{ch.title}</Text>
            <Text style={styles.itemMeta}>{ch.field} · 残り{ch.daysLeft}日</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/challenge-submit', params: { challengeId: ch.id } })}
            style={styles.submitBtn}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryContainer]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <Ionicons name="send" size={13} color="#fff" />
              <Text style={styles.btnText}>提出</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: `${Colors.primary}22`,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  title: { fontWeight: '700', fontSize: 14, color: Colors.primary, flex: 1 },
  badge: { backgroundColor: Colors.primaryFixed, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontWeight: '700', fontSize: 11, color: Colors.primary },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.surfaceContainerLow },
  info: { flex: 1 },
  itemTitle: { fontWeight: '600', fontSize: 14, color: Colors.onSurface },
  itemMeta: { fontSize: 11, color: Colors.onSurfaceVariant, marginTop: 2 },
  submitBtn: { borderRadius: Radius.full, overflow: 'hidden' },
  btnGradient: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8 },
  btnText: { fontWeight: '700', fontSize: 13, color: '#fff' },
});