// ── Avatar presets ────────────────────────────────────────────
// Individual files in assets/profile_icons/icon-sheet-1-r{row}-c{col}.png
export type AvatarPreset = {
  id: string;
  label: string;
};

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'fishbowl', label: '金魚鉢' },
  { id: 'coral', label: '珊瑚礁' },
  { id: 'squid', label: 'イカ' },
  { id: 'turtle', label: 'ウミガメ' },
  { id: 'diver', label: 'ダイバー' },
  { id: 'sailboat', label: '星読みの海' },
  { id: 'treasure', label: '宝箱' },
  { id: 'schooloffish', label: '魚の群れ' },
  { id: 'octopus', label: 'タコ' },
  { id: 'manta', label: 'マンタ' },
  { id: 'submarine', label: '潜水艦' },
  { id: 'deepfish', label: '深海' },
  { id: 'seacreature', label: '海の生き物' },
  { id: 'jellyfish', label: 'クラゲ' },
  { id: 'lighthouse', label: '灯台' },
  { id: 'seahorse', label: 'タツノオトシゴ' },
];

export const DEFAULT_AVATAR_ID = 'fishbowl';

// ── Stats / Settings ──────────────────────────────────────────
export function buildStats(points: number) {
  return [
    { label: '投稿数', value: '12' },
    { label: 'もらったいいね', value: '84' },
    { label: 'ポイント', value: points.toLocaleString() },
  ];
}

export const SETTINGS_ITEMS = [
  { iconName: 'notifications-outline' as const, label: 'プッシュ通知' },
  { iconName: 'lock-closed-outline' as const, label: 'プライバシー設定' },
  { iconName: 'help-circle-outline' as const, label: 'ヘルプ' },
];
