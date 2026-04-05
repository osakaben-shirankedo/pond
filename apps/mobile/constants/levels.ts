import { Colors } from './theme';

export const Levels = {
  澄み池: { label: '澄み池', description: '入門・始めたばかり', color: Colors.primaryFixed },
  碧の池: { label: '碧の池', description: '基礎が固まってきた', color: Colors.primaryFixedDim },
  深碧池: { label: '深碧池', description: '応用・コンテスト経験あり', color: Colors.primaryContainer },
  蒼淵: { label: '蒼淵', description: '達人・プロレベル', color: Colors.primary },
} as const;

export type LevelKey = keyof typeof Levels;

export const LEVEL_CHAT_BG: Record<string, string> = {
  '澄み池': '#f0faff',
  '碧の池': '#d6eef8',
  '深碧池': '#a8cfe3',
  '蒼淵':   '#7aaec8',
};
