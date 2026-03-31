export type PondMember = {
  id: string;
  name: string;
  avatarId: string;
  level: string;
  isMe?: boolean;
};

export type PondInstance = {
  pondId: string;
  field: string;
  level: string;
  label: string;
  members: PondMember[]; // シードメンバー4人（+自分で5人）
};

export const SEED_POND_INSTANCES: PondInstance[] = [
  // ── プログラミング ──────────────────────────────────────
  {
    pondId: 'prog-aoi-A', field: 'programming', level: '碧の池', label: 'A',
    members: [
      { id: 'pa1', name: 'かわうそ太郎', avatarId: 'turtle',    level: '碧の池' },
      { id: 'pa2', name: 'コイ子',       avatarId: 'coral',     level: '碧の池' },
      { id: 'pa3', name: 'サクラ鯛',     avatarId: 'seahorse',  level: '碧の池' },
      { id: 'pa4', name: 'ミナミ',       avatarId: 'squid',     level: '碧の池' },
    ],
  },
  {
    pondId: 'prog-aoi-B', field: 'programming', level: '碧の池', label: 'B',
    members: [
      { id: 'pb1', name: 'ウミ太郎',     avatarId: 'orca',      level: '碧の池' },
      { id: 'pb2', name: 'ナギ',         avatarId: 'manta',     level: '碧の池' },
      { id: 'pb3', name: 'アオ',         avatarId: 'submarine', level: '碧の池' },
      { id: 'pb4', name: 'タカ',         avatarId: 'sailboat',  level: '碧の池' },
    ],
  },
  {
    pondId: 'prog-sumi-A', field: 'programming', level: '澄み池', label: 'A',
    members: [
      { id: 'ps1', name: 'サクラ鯛',     avatarId: 'seahorse',  level: '澄み池' },
      { id: 'ps2', name: 'めだか花子',   avatarId: 'jellyfish', level: '澄み池' },
      { id: 'ps3', name: 'ハル',         avatarId: 'octopus',   level: '澄み池' },
      { id: 'ps4', name: 'ソラ',         avatarId: 'fishbowl',  level: '澄み池' },
    ],
  },
  {
    pondId: 'prog-deep-A', field: 'programming', level: '深碧池', label: 'A',
    members: [
      { id: 'pd1', name: 'フナ次郎',     avatarId: 'diver',     level: '深碧池' },
      { id: 'pd2', name: 'リク',         avatarId: 'treasure',  level: '深碧池' },
      { id: 'pd3', name: 'カナ',         avatarId: 'deepfish',  level: '深碧池' },
      { id: 'pd4', name: 'ツキ',         avatarId: 'lighthouse',level: '深碧池' },
    ],
  },
  // ── 数学 ────────────────────────────────────────────────
  {
    pondId: 'math-sumi-A', field: 'math', level: '澄み池', label: 'A',
    members: [
      { id: 'ms1', name: 'めだか花子',   avatarId: 'jellyfish', level: '澄み池' },
      { id: 'ms2', name: 'さくら鯛',     avatarId: 'coral',     level: '澄み池' },
      { id: 'ms3', name: 'ユウ',         avatarId: 'octopus',   level: '澄み池' },
      { id: 'ms4', name: 'アキ',         avatarId: 'squid',     level: '澄み池' },
    ],
  },
  {
    pondId: 'math-sumi-B', field: 'math', level: '澄み池', label: 'B',
    members: [
      { id: 'mb1', name: 'リョウ',       avatarId: 'turtle',    level: '澄み池' },
      { id: 'mb2', name: 'ケン',         avatarId: 'seahorse',  level: '澄み池' },
      { id: 'mb3', name: 'マイ',         avatarId: 'manta',     level: '澄み池' },
      { id: 'mb4', name: 'シオ',         avatarId: 'sailboat',  level: '澄み池' },
    ],
  },
  {
    pondId: 'math-aoi-A', field: 'math', level: '碧の池', label: 'A',
    members: [
      { id: 'ma1', name: 'かわうそ太郎', avatarId: 'turtle',    level: '碧の池' },
      { id: 'ma2', name: 'コイ子',       avatarId: 'coral',     level: '碧の池' },
      { id: 'ma3', name: 'ノア',         avatarId: 'orca',      level: '碧の池' },
      { id: 'ma4', name: 'レン',         avatarId: 'submarine', level: '碧の池' },
    ],
  },
  {
    pondId: 'math-deep-A', field: 'math', level: '深碧池', label: 'A',
    members: [
      { id: 'md1', name: 'かわうそ太郎', avatarId: 'turtle',    level: '深碧池' },
      { id: 'md2', name: 'ソウ',         avatarId: 'diver',     level: '深碧池' },
      { id: 'md3', name: 'カイ',         avatarId: 'treasure',  level: '深碧池' },
      { id: 'md4', name: 'ハナ',         avatarId: 'deepfish',  level: '深碧池' },
    ],
  },
  // ── 英語 ────────────────────────────────────────────────
  {
    pondId: 'eng-deep-A', field: 'english', level: '深碧池', label: 'A',
    members: [
      { id: 'ed1', name: 'フナ次郎',     avatarId: 'diver',     level: '深碧池' },
      { id: 'ed2', name: 'コイ子',       avatarId: 'jellyfish', level: '深碧池' },
      { id: 'ed3', name: 'めだか花子',   avatarId: 'coral',     level: '深碧池' },
      { id: 'ed4', name: 'ミオ',         avatarId: 'lighthouse',level: '深碧池' },
    ],
  },
  {
    pondId: 'eng-aoi-A', field: 'english', level: '碧の池', label: 'A',
    members: [
      { id: 'ea1', name: 'さくら鯛',     avatarId: 'seahorse',  level: '碧の池' },
      { id: 'ea2', name: 'コイ子',       avatarId: 'coral',     level: '碧の池' },
      { id: 'ea3', name: 'ヒナ',         avatarId: 'octopus',   level: '碧の池' },
      { id: 'ea4', name: 'イブ',         avatarId: 'squid',     level: '碧の池' },
    ],
  },
  {
    pondId: 'eng-sumi-A', field: 'english', level: '澄み池', label: 'A',
    members: [
      { id: 'es1', name: 'めだか花子',   avatarId: 'jellyfish', level: '澄み池' },
      { id: 'es2', name: 'トオル',       avatarId: 'turtle',    level: '澄み池' },
      { id: 'es3', name: 'カナ',         avatarId: 'manta',     level: '澄み池' },
      { id: 'es4', name: 'ユキ',         avatarId: 'sailboat',  level: '澄み池' },
    ],
  },
  // ── アート ──────────────────────────────────────────────
  {
    pondId: 'art-aoi-A', field: 'art', level: '碧の池', label: 'A',
    members: [
      { id: 'aa1', name: 'コイ子',       avatarId: 'jellyfish', level: '碧の池' },
      { id: 'aa2', name: 'さくら鯛',     avatarId: 'seahorse',  level: '碧の池' },
      { id: 'aa3', name: 'めだか花子',   avatarId: 'coral',     level: '碧の池' },
      { id: 'aa4', name: 'ナツ',         avatarId: 'octopus',   level: '碧の池' },
    ],
  },
  {
    pondId: 'art-sumi-A', field: 'art', level: '澄み池', label: 'A',
    members: [
      { id: 'as1', name: 'さくら鯛',     avatarId: 'seahorse',  level: '澄み池' },
      { id: 'as2', name: 'ヒロ',         avatarId: 'turtle',    level: '澄み池' },
      { id: 'as3', name: 'ミク',         avatarId: 'squid',     level: '澄み池' },
      { id: 'as4', name: 'アン',         avatarId: 'fishbowl',  level: '澄み池' },
    ],
  },
  // ── 音楽 ────────────────────────────────────────────────
  {
    pondId: 'music-aoi-A', field: 'music', level: '碧の池', label: 'A',
    members: [
      { id: 'mua1', name: 'さくら鯛',   avatarId: 'seahorse',  level: '碧の池' },
      { id: 'mua2', name: 'フナ次郎',   avatarId: 'diver',     level: '碧の池' },
      { id: 'mua3', name: 'コウ',       avatarId: 'orca',      level: '碧の池' },
      { id: 'mua4', name: 'シン',       avatarId: 'submarine', level: '碧の池' },
    ],
  },
  {
    pondId: 'music-sumi-A', field: 'music', level: '澄み池', label: 'A',
    members: [
      { id: 'mus1', name: 'かわうそ太郎', avatarId: 'turtle',   level: '澄み池' },
      { id: 'mus2', name: 'コイ子',     avatarId: 'coral',     level: '澄み池' },
      { id: 'mus3', name: 'ゆな',       avatarId: 'jellyfish', level: '澄み池' },
      { id: 'mus4', name: 'りく',       avatarId: 'fishbowl',  level: '澄み池' },
    ],
  },
  // ── 科学 ────────────────────────────────────────────────
  {
    pondId: 'sci-sumi-A', field: 'science', level: '澄み池', label: 'A',
    members: [
      { id: 'ssa1', name: 'めだか花子',  avatarId: 'coral',     level: '澄み池' },
      { id: 'ssa2', name: 'かわうそ太郎',avatarId: 'turtle',    level: '澄み池' },
      { id: 'ssa3', name: 'さくら鯛',   avatarId: 'seahorse',  level: '澄み池' },
      { id: 'ssa4', name: 'ジン',       avatarId: 'octopus',   level: '澄み池' },
    ],
  },
  {
    pondId: 'sci-aoi-A', field: 'science', level: '碧の池', label: 'A',
    members: [
      { id: 'sca1', name: 'フナ次郎',   avatarId: 'diver',     level: '碧の池' },
      { id: 'sca2', name: 'コイ子',     avatarId: 'jellyfish', level: '碧の池' },
      { id: 'sca3', name: 'タケ',       avatarId: 'submarine', level: '碧の池' },
      { id: 'sca4', name: 'アオイ',     avatarId: 'manta',     level: '碧の池' },
    ],
  },
  // ── 物理 ────────────────────────────────────────────────
  {
    pondId: 'phy-sumi-A', field: 'physics', level: '澄み池', label: 'A',
    members: [
      { id: 'pya1', name: 'かわうそ太郎', avatarId: 'turtle',    level: '澄み池' },
      { id: 'pya2', name: 'さくら鯛',    avatarId: 'seahorse',  level: '澄み池' },
      { id: 'pya3', name: 'ユウ',        avatarId: 'octopus',   level: '澄み池' },
      { id: 'pya4', name: 'イチ',        avatarId: 'squid',     level: '澄み池' },
    ],
  },
  {
    pondId: 'phy-aoi-A', field: 'physics', level: '碧の池', label: 'A',
    members: [
      { id: 'pyb1', name: 'フナ次郎',    avatarId: 'diver',     level: '碧の池' },
      { id: 'pyb2', name: 'コイ子',      avatarId: 'coral',     level: '碧の池' },
      { id: 'pyb3', name: 'ナオ',        avatarId: 'orca',      level: '碧の池' },
      { id: 'pyb4', name: 'シュン',      avatarId: 'submarine', level: '碧の池' },
    ],
  },
  // ── 化学 ────────────────────────────────────────────────
  {
    pondId: 'che-sumi-A', field: 'chemistry', level: '澄み池', label: 'A',
    members: [
      { id: 'cha1', name: 'めだか花子',  avatarId: 'jellyfish', level: '澄み池' },
      { id: 'cha2', name: 'コイ子',      avatarId: 'coral',     level: '澄み池' },
      { id: 'cha3', name: 'モモ',        avatarId: 'fishbowl',  level: '澄み池' },
      { id: 'cha4', name: 'ルイ',        avatarId: 'octopus',   level: '澄み池' },
    ],
  },
  {
    pondId: 'che-aoi-A', field: 'chemistry', level: '碧の池', label: 'A',
    members: [
      { id: 'chb1', name: 'さくら鯛',   avatarId: 'seahorse',  level: '碧の池' },
      { id: 'chb2', name: 'フナ次郎',   avatarId: 'diver',     level: '碧の池' },
      { id: 'chb3', name: 'アサ',       avatarId: 'manta',     level: '碧の池' },
      { id: 'chb4', name: 'タイ',       avatarId: 'treasure',  level: '碧の池' },
    ],
  },
  // ── 生物 ────────────────────────────────────────────────
  {
    pondId: 'bio-sumi-A', field: 'biology', level: '澄み池', label: 'A',
    members: [
      { id: 'bia1', name: 'さくら鯛',   avatarId: 'seahorse',  level: '澄み池' },
      { id: 'bia2', name: 'コイ子',     avatarId: 'jellyfish', level: '澄み池' },
      { id: 'bia3', name: 'ナナ',       avatarId: 'coral',     level: '澄み池' },
      { id: 'bia4', name: 'リオ',       avatarId: 'squid',     level: '澄み池' },
    ],
  },
  {
    pondId: 'bio-aoi-A', field: 'biology', level: '碧の池', label: 'A',
    members: [
      { id: 'bib1', name: 'かわうそ太郎', avatarId: 'turtle',  level: '碧の池' },
      { id: 'bib2', name: 'めだか花子',   avatarId: 'jellyfish', level: '碧の池' },
      { id: 'bib3', name: 'ウミ',        avatarId: 'orca',     level: '碧の池' },
      { id: 'bib4', name: 'ソウ',        avatarId: 'diver',    level: '碧の池' },
    ],
  },
  // ── 歴史 ────────────────────────────────────────────────
  {
    pondId: 'his-sumi-A', field: 'history', level: '澄み池', label: 'A',
    members: [
      { id: 'hia1', name: 'フナ次郎',   avatarId: 'diver',     level: '澄み池' },
      { id: 'hia2', name: 'さくら鯛',   avatarId: 'seahorse',  level: '澄み池' },
      { id: 'hia3', name: 'タロウ',     avatarId: 'turtle',    level: '澄み池' },
      { id: 'hia4', name: 'ハナ',       avatarId: 'fishbowl',  level: '澄み池' },
    ],
  },
  {
    pondId: 'his-aoi-A', field: 'history', level: '碧の池', label: 'A',
    members: [
      { id: 'hib1', name: 'めだか花子',  avatarId: 'jellyfish', level: '碧の池' },
      { id: 'hib2', name: 'コイ子',      avatarId: 'coral',     level: '碧の池' },
      { id: 'hib3', name: 'アキラ',      avatarId: 'octopus',   level: '碧の池' },
      { id: 'hib4', name: 'チハル',      avatarId: 'squid',     level: '碧の池' },
    ],
  },
  // ── 地理 ────────────────────────────────────────────────
  {
    pondId: 'geo-sumi-A', field: 'geography', level: '澄み池', label: 'A',
    members: [
      { id: 'gea1', name: 'コイ子',      avatarId: 'coral',     level: '澄み池' },
      { id: 'gea2', name: 'かわうそ太郎', avatarId: 'turtle',   level: '澄み池' },
      { id: 'gea3', name: 'スズ',        avatarId: 'manta',     level: '澄み池' },
      { id: 'gea4', name: 'カイ',        avatarId: 'sailboat',  level: '澄み池' },
    ],
  },
  {
    pondId: 'geo-aoi-A', field: 'geography', level: '碧の池', label: 'A',
    members: [
      { id: 'geb1', name: 'フナ次郎',    avatarId: 'diver',     level: '碧の池' },
      { id: 'geb2', name: 'さくら鯛',    avatarId: 'seahorse',  level: '碧の池' },
      { id: 'geb3', name: 'ミズキ',      avatarId: 'lighthouse',level: '碧の池' },
      { id: 'geb4', name: 'ケン',        avatarId: 'submarine', level: '碧の池' },
    ],
  },
  // ── 国語 ────────────────────────────────────────────────
  {
    pondId: 'jpn-sumi-A', field: 'japanese', level: '澄み池', label: 'A',
    members: [
      { id: 'jna1', name: 'めだか花子',  avatarId: 'jellyfish', level: '澄み池' },
      { id: 'jna2', name: 'さくら鯛',   avatarId: 'seahorse',  level: '澄み池' },
      { id: 'jna3', name: 'アオイ',     avatarId: 'fishbowl',  level: '澄み池' },
      { id: 'jna4', name: 'コトネ',     avatarId: 'coral',     level: '澄み池' },
    ],
  },
  {
    pondId: 'jpn-aoi-A', field: 'japanese', level: '碧の池', label: 'A',
    members: [
      { id: 'jnb1', name: 'かわうそ太郎', avatarId: 'turtle',  level: '碧の池' },
      { id: 'jnb2', name: 'コイ子',       avatarId: 'coral',   level: '碧の池' },
      { id: 'jnb3', name: 'マユ',         avatarId: 'octopus', level: '碧の池' },
      { id: 'jnb4', name: 'ヒロキ',       avatarId: 'squid',   level: '碧の池' },
    ],
  },
  // ── 倫理・哲学 ──────────────────────────────────────────
  {
    pondId: 'eth-sumi-A', field: 'ethics', level: '澄み池', label: 'A',
    members: [
      { id: 'eta1', name: 'さくら鯛',   avatarId: 'seahorse',  level: '澄み池' },
      { id: 'eta2', name: 'フナ次郎',   avatarId: 'diver',     level: '澄み池' },
      { id: 'eta3', name: 'テツ',       avatarId: 'lighthouse',level: '澄み池' },
      { id: 'eta4', name: 'リン',       avatarId: 'treasure',  level: '澄み池' },
    ],
  },
  {
    pondId: 'eth-aoi-A', field: 'ethics', level: '碧の池', label: 'A',
    members: [
      { id: 'etb1', name: 'めだか花子',  avatarId: 'jellyfish', level: '碧の池' },
      { id: 'etb2', name: 'コイ子',      avatarId: 'coral',     level: '碧の池' },
      { id: 'etb3', name: 'ソラ',        avatarId: 'fishbowl',  level: '碧の池' },
      { id: 'etb4', name: 'ユウキ',      avatarId: 'orca',      level: '碧の池' },
    ],
  },
  // ── 経済 ────────────────────────────────────────────────
  {
    pondId: 'eco-sumi-A', field: 'economics', level: '澄み池', label: 'A',
    members: [
      { id: 'eca1', name: 'コイ子',      avatarId: 'coral',     level: '澄み池' },
      { id: 'eca2', name: 'かわうそ太郎', avatarId: 'turtle',   level: '澄み池' },
      { id: 'eca3', name: 'ワタル',      avatarId: 'manta',     level: '澄み池' },
      { id: 'eca4', name: 'サキ',        avatarId: 'squid',     level: '澄み池' },
    ],
  },
  {
    pondId: 'eco-aoi-A', field: 'economics', level: '碧の池', label: 'A',
    members: [
      { id: 'ecb1', name: 'フナ次郎',    avatarId: 'diver',     level: '碧の池' },
      { id: 'ecb2', name: 'さくら鯛',    avatarId: 'seahorse',  level: '碧の池' },
      { id: 'ecb3', name: 'マサ',        avatarId: 'submarine', level: '碧の池' },
      { id: 'ecb4', name: 'ナルミ',      avatarId: 'sailboat',  level: '碧の池' },
    ],
  },
];

/** 指定分野・レベルの池IDリストを返す */
export function getPondIdsForFieldLevel(field: string, level: string): string[] {
  return SEED_POND_INSTANCES
    .filter((p) => p.field === field && p.level === level)
    .map((p) => p.pondId);
}

/** 指定分野・レベルで空きがある池を返す（memberCount < 4 → 自分が入って5人以内） */
export function assignPondId(field: string, level: string): string {
  const available = SEED_POND_INSTANCES.find(
    (p) => p.field === field && p.level === level && p.members.length < 4
  );
  if (available) return available.pondId;
  // 全インスタンスが4人（+自分で満杯）の場合は最初のものを返す
  const first = SEED_POND_INSTANCES.find((p) => p.field === field && p.level === level);
  if (first) return first.pondId;
  return `${field}-${level}-A`.replace(/\s/g, '_');
}

export const PURPOSE_OPTIONS = [
  '独学・自習したい',
  '仲間と一緒に学びたい',
  'プロジェクトを作りたい',
  '試験・資格取得を目指したい',
  '趣味として楽しみたい',
];

/** pondId からインスタンスを取得 */
export function getPondInstance(pondId: string): PondInstance | undefined {
  return SEED_POND_INSTANCES.find((p) => p.pondId === pondId);
}

/** pondId からラベル (A/B/...) を取得 */
export function getPondLabel(pondId: string): string {
  return SEED_POND_INSTANCES.find((p) => p.pondId === pondId)?.label ?? '';
}

/** チャットメッセージのユーザー名 → avatarId マッピング */
export const CHAT_USER_AVATARS: Record<string, string> = {
  'かわうそ太郎': 'turtle',
  'めだか花子':   'jellyfish',
  'コイ子':       'coral',
  'フナ次郎':     'diver',
  'さくら鯛':     'seahorse',
  'ミナミ':       'squid',
  'ノア':         'orca',
  'ソラ':         'fishbowl',
  'ハル':         'octopus',
  'リク':         'treasure',
  'カナ':         'manta',
  'ツキ':         'lighthouse',
};

export function getAvatarIdByName(name: string): string {
  return CHAT_USER_AVATARS[name] ?? 'fishbowl';
}

/** 池の全メンバー（シード4人 + 自分） */
export function getPondMembers(pondId: string, myAvatarId?: string): PondMember[] {
  const instance = getPondInstance(pondId);
  if (!instance) return [];
  const me: PondMember = {
    id: 'me',
    name: 'あなた',
    avatarId: myAvatarId ?? 'fishbowl',
    level: instance.level,
    isMe: true,
  };
  return [me, ...instance.members];
}
