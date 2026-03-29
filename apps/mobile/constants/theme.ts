export const Colors = {
  // Depth Spectrum
  surface: '#f7f9ff',
  background: '#f7f9ff',
  surfaceBright: '#f7f9ff',
  surfaceDim: '#bddeff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#edf4ff',
  surfaceContainer: '#e2efff',
  surfaceContainerHigh: '#d8eaff',
  surfaceContainerHighest: '#cde5ff',
  surfaceVariant: '#cde5ff',

  // Primary (Vibrant Cerulean)
  primary: '#006194',
  primaryContainer: '#007bb9',
  primaryFixed: '#cce5ff',
  primaryFixedDim: '#93ccff',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#fdfcff',
  onPrimaryFixed: '#001d31',
  onPrimaryFixedVariant: '#004b73',
  inversePrimary: '#93ccff',

  // Secondary
  secondary: '#2f6388',
  secondaryContainer: '#a3d4ff',
  secondaryFixed: '#cbe6ff',
  secondaryFixedDim: '#9bccf6',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#275c81',
  onSecondaryFixed: '#001e30',
  onSecondaryFixedVariant: '#0e4b6f',

  // Tertiary
  tertiary: '#4e5e68',
  tertiaryContainer: '#667781',
  tertiaryFixed: '#d3e5f1',
  tertiaryFixedDim: '#b7c9d5',
  onTertiary: '#ffffff',
  onTertiaryContainer: '#fbfcff',
  onTertiaryFixed: '#0c1e26',
  onTertiaryFixedVariant: '#384953',

  // Surface Text
  onSurface: '#001d32',
  onSurfaceVariant: '#3f4850',
  onBackground: '#001d32',

  // Inverse
  inverseSurface: '#0e334d',
  inverseOnSurface: '#e7f2ff',

  // Outline
  outline: '#707881',
  outlineVariant: '#bfc7d2',

  // Error
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#93000a',

  // Surface tint
  surfaceTint: '#006398',
};

export const Radius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Levels = {
  澄み池: { label: '澄み池', description: '入門・始めたばかり', color: Colors.primaryFixed },
  碧の池: { label: '碧の池', description: '基礎が固まってきた', color: Colors.primaryFixedDim },
  深碧池: { label: '深碧池', description: '応用・コンテスト経験あり', color: Colors.primaryContainer },
  蒼淵: { label: '蒼淵', description: '達人・プロレベル', color: Colors.primary },
} as const;

export type LevelKey = keyof typeof Levels;

export const Fields = [
  { id: 'programming', label: 'プログラミング', icon: 'terminal' },
  { id: 'math', label: '数学', icon: 'functions' },
  { id: 'english', label: '英語', icon: 'translate' },
  { id: 'art', label: 'アート', icon: 'palette' },
  { id: 'music', label: '音楽', icon: 'music_note' },
  { id: 'science', label: '科学', icon: 'science' },
] as const;

export type FieldId = typeof Fields[number]['id'];
