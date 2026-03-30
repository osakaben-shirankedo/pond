import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRef, useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { AVATAR_PRESETS } from '@/models/profile';
import { AvatarSprite } from '@/components/avatar-sprite';

const { width, height } = Dimensions.get('window');
// Cap to a mobile-like width so the picker looks right on web preview too
const PICKER_WIDTH = Math.min(width, 430);
const SHEET_HEIGHT = Math.min(height * 0.58, 520);
const CELL_SIZE = Math.min(Math.floor((PICKER_WIDTH - Spacing.lg * 2 - Spacing.sm * 3) / 4), 90);
const ICON_SIZE = Math.floor(CELL_SIZE * 0.56);

type Props = {
  visible: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
};

export function AvatarPicker({ visible, selectedId, onSelect, onClose }: Props) {
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        stiffness: 220,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Bottom sheet */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        <BlurView intensity={60} tint="light" style={styles.sheetInner}>
          {/* Handle + header */}
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>アイコンを選ぶ</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <Ionicons name="close" size={20} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Grid */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.grid}
          >
            <View style={styles.gridRow}>
              {AVATAR_PRESETS.map((preset) => {
                const active = preset.id === selectedId;
                return (
                  <TouchableOpacity
                    key={preset.id}
                    onPress={() => { onSelect(preset.id); onClose(); }}
                    activeOpacity={0.7}
                    style={[styles.cell, { width: CELL_SIZE, height: CELL_SIZE + 20 }]}
                  >
                    <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                      <AvatarSprite
                        presetId={preset.id}
                        size={ICON_SIZE}
                      />
                    </View>
                    <Text
                      style={[styles.label, active && styles.labelActive]}
                      numberOfLines={1}
                    >
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </BlurView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    height: SHEET_HEIGHT,
  },
  sheetInner: {
    width: PICKER_WIDTH,
    flex: 1,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    overflow: 'hidden',
    paddingBottom: 32,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.outlineVariant,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 17,
    color: Colors.onSurface,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cell: {
    alignItems: 'center',
    gap: 6,
    justifyContent: 'flex-start',
    paddingTop: Spacing.xs,
  },
  iconWrap: {
    width: CELL_SIZE - 8,
    height: CELL_SIZE - 8,
    borderRadius: Radius.lg,
    backgroundColor: '#CAE4FB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#CAE4FB',
  },
  iconWrapActive: {
    backgroundColor: '#CAE4FB',
    borderColor: Colors.primary,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  labelActive: {
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
});
