import { Colors } from '@/constants/theme';
import type { LevelKey } from '@/constants/levels';

export type PondEntry = {
  field: string;
  level: LevelKey;
  pondId: string;
};

export const LEVEL_ORDER: LevelKey[] = ['澄み池', '碧の池', '深碧池', '蒼淵'];

export const LEVEL_GRADIENTS: Record<LevelKey, [string, string]> = {
  '澄み池': [Colors.primaryFixed, Colors.surfaceContainerHigh],
  '碧の池': [Colors.primaryFixedDim, Colors.primaryFixed],
  '深碧池': [Colors.primaryContainer, Colors.primaryFixedDim],
  '蒼淵': [Colors.primary, Colors.primaryContainer],
};

export type { LevelKey };
