import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { Levels } from '@/constants/levels';
import { FieldIcon } from '@/components/ui/field-icon';
import { LEVEL_GRADIENTS, type PondEntry } from '@/models/pond';
import { FIELD_LABELS } from '@/models/field';
import { getPondLabel } from '@/models/pond-instance';

type Props = {
  pond: PondEntry;
  levelOrder: string[];
  unread: boolean;
  onOpen: (field: string, level: string, pondId?: string) => void;
  onReassess: (field: string) => void;
};

export function PondCard({ pond, levelOrder, unread, onOpen, onReassess }: Props) {
  const levelIndex = levelOrder.indexOf(pond.level);
  const progress = (levelIndex + 1) / levelOrder.length;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onOpen(pond.field, pond.level, pond.pondId)}
      style={styles.pondCard}
    >
      {unread && <View style={styles.pondUnreadDot} />}
      <LinearGradient
        colors={LEVEL_GRADIENTS[pond.level]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.pondCardGradient}
      >
        <View style={styles.pondCardHeader}>
          <View style={styles.pondIcon}>
            <FieldIcon field={pond.field} color={Colors.secondary} size={22} />
          </View>
          <View style={styles.pondInfo}>
            <Text style={styles.pondFieldName}>{FIELD_LABELS[pond.field] ?? pond.field}</Text>
            <Text style={styles.pondLevelName}>
              {pond.level}
              {getPondLabel(pond.pondId) ? ` 池${getPondLabel(pond.pondId)}` : ''}
            </Text>
          </View>
          <TouchableOpacity onPress={() => onReassess(pond.field)} style={styles.reassessBtn}>
            <Text style={styles.reassessBtnText}>再査定</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.pondLevelDesc}>{Levels[pond.level]?.description}</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            {levelOrder.map((level, index) => (
              <Text
                key={level}
                style={index === levelIndex ? styles.progressLevelActive : styles.progressLevelInactive}
              >
                {level}
                {index < levelOrder.length - 1 ? ' → ' : ''}
              </Text>
            ))}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pondCard: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3,
  },
  pondUnreadDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 12,
    height: 12,
    borderRadius: Radius.full,
    backgroundColor: '#e05c7b',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 10,
  },
  pondCardGradient: { padding: Spacing.xl, gap: Spacing.md },
  pondCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  pondIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pondInfo: { flex: 1 },
  pondFieldName: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: Colors.onSurface,
  },
  pondLevelName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.primary,
  },
  reassessBtn: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  reassessBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: Colors.primary,
  },
  pondLevelDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  progressContainer: { gap: Spacing.xs },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  progressLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  progressLevelActive: {
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
  progressLevelInactive: { color: Colors.outlineVariant },
});
