import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/theme';

export function ChallengeBanner() {
  return (
    <LinearGradient
      colors={[Colors.primary, Colors.secondary]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      <Ionicons name="flash" size={32} color="#fff" />
      <View>
        <Text style={styles.title}>チャレンジ期間中！</Text>
        <Text style={styles.desc}>参加して同じ池の仲間と競おう</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: Radius.xl,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  title: { fontWeight: '700', fontSize: 18, color: '#fff' },
  desc: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
});