import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { FieldIcon } from '@/components/ui/field-icon';
import { FIELD_ID_MAP } from '@/models/challenges';

export function ChallengeCard({ challenge, isPast, onJoin, onLeave }: any) {
  const ch = challenge;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.fieldTag}>
          <FieldIcon field={FIELD_ID_MAP[ch.field] ?? ch.field} size={14} color={Colors.onSurfaceVariant} />
          <Text style={styles.fieldTagText}>{ch.field}</Text>
        </View>
        <View style={[styles.levelTag, ch.level === '蒼淵' && styles.levelTagDark]}>
          <Text style={styles.levelTagText}>{ch.level}</Text>
        </View>
        {ch.isSubjective && (
          <View style={styles.subjectiveTag}>
            <Text style={styles.subjectiveTagText}>AI採点</Text>
          </View>
        )}
      </View>

      <Text style={styles.cardTitle}>{ch.title}</Text>
      <Text style={styles.cardDesc}>{ch.description}</Text>

      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={Colors.onSurfaceVariant} />
          <Text style={styles.metaText}>残り{ch.daysLeft}日</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="people-outline" size={14} color={Colors.onSurfaceVariant} />
          <Text style={styles.metaText}>{ch.participants}人参加中</Text>
        </View>
      </View>

      {/* 条件分岐によるボタン表示 */}
      {isPast ? (
        <ActionButton 
          onPress={() => router.push({ pathname: '/challenge-submit', params: { challengeId: ch.id, mode: 'timeline' } })}
          icon="list" label="みんなの回答を見る" colors={[Colors.secondary, Colors.secondaryContainer]}
        />
      ) : ch.passed ? (
        <View style={styles.row}>
          <View style={styles.passedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#fff" />
            <Text style={styles.passedText}>クリア済み</Text>
          </View>
          <ActionButton 
            onPress={() => router.push({ pathname: '/challenge-submit', params: { challengeId: ch.id, mode: 'timeline' } })}
            icon="list" label="みんなの回答" colors={[Colors.secondary, Colors.secondaryContainer]}
          />
        </View>
      ) : ch.joined ? (
        <View style={styles.row}>
          <TouchableOpacity onPress={onLeave} style={styles.leaveBtn}>
            <Ionicons name="close-circle-outline" size={16} color="#e05c7b" />
            <Text style={styles.leaveBtnText}>やめる</Text>
          </TouchableOpacity>
          <ActionButton 
            onPress={() => router.push({ pathname: '/challenge-submit', params: { challengeId: ch.id } })}
            icon="send" label="提出する" colors={[Colors.primary, Colors.primaryContainer]}
          />
        </View>
      ) : (
        <ActionButton onPress={onJoin} icon="people" label="チームで参加する" colors={[Colors.primary, Colors.primaryContainer]} />
      )}
    </View>
  );
}

// 内部用共通ボタン
const ActionButton = ({ onPress, icon, label, colors }: any) => (
  <TouchableOpacity onPress={onPress} style={{ flex: 1 }}>
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGradient}>
      <Ionicons name={icon} size={15} color="#fff" />
      <Text style={styles.btnText}>{label}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.xl, padding: 20, gap: 12 },
  cardHeader: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  fieldTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceContainerLow, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  fieldTagText: { fontSize: 12, color: Colors.onSurfaceVariant },
  levelTag: { backgroundColor: Colors.primaryFixed, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  levelTagDark: { backgroundColor: Colors.primary },
  levelTagText: { fontSize: 11, color: Colors.primary },
  subjectiveTag: { backgroundColor: `${Colors.secondary}33`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  subjectiveTagText: { fontSize: 11, color: Colors.secondary },
  cardTitle: { fontSize: 18, fontWeight: '700', color: Colors.onSurface },
  cardDesc: { fontSize: 14, color: Colors.onSurfaceVariant, lineHeight: 22 },
  cardMeta: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: Colors.onSurfaceVariant },
  row: { flexDirection: 'row', gap: 8 },
  btnGradient: { paddingVertical: 14, borderRadius: Radius.full, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  leaveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#fde8ed', borderRadius: Radius.full },
  leaveBtnText: { fontWeight: '600', color: '#e05c7b', fontSize: 15 },
  passedBadge: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: Colors.primary, borderRadius: Radius.full },
  passedText: { fontWeight: '600', color: '#fff', fontSize: 15 },
});