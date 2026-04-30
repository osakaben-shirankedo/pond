import { TextInput, TouchableOpacity, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AvatarSprite } from '@/components/avatar-sprite';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  value: string;
  myAvatarId: string;
  tabBarHeight: number;
  onChangeText: (text: string) => void;
  onSend: () => void;
};

export function CommentComposer({
  value,
  myAvatarId,
  tabBarHeight,
  onChangeText,
  onSend,
}: Props) {
  const enabled = value.trim().length > 0;

  return (
    <View style={[styles.inputRow, { paddingBottom: Spacing.md + tabBarHeight }]}>
      <AvatarSprite presetId={myAvatarId} size={36} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="コメントを追加..."
        placeholderTextColor={Colors.onSurfaceVariant}
        multiline
        maxLength={200}
      />
      <TouchableOpacity onPress={onSend} disabled={!enabled} activeOpacity={0.7}>
        <LinearGradient
          colors={
            enabled
              ? [Colors.primary, Colors.primaryContainer]
              : [Colors.surfaceContainerLow, Colors.surfaceContainerLow]
          }
          style={styles.sendBtn}
        >
          <Ionicons
            name="send"
            size={18}
            color={enabled ? '#fff' : Colors.onSurfaceVariant}
          />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerLow,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.onSurface,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
