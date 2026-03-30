import { Colors } from '@/constants/theme';

export type Post = {
  id: string;
  user: string;
  avatar: string;
  pond: string;
  level: string;
  field: string;
  content: string;
  likes: number;
  time: string;
  liked: boolean;
};

export const SEED_POSTS: Post[] = [
  {
    id: '1',
    user: 'かわうそ太郎',
    avatar: 'か',
    pond: 'プログラミング',
    level: '碧の池',
    field: 'programming',
    content: 'TypeScriptのジェネリクス、ようやく理解できた！型推論が気持ちいい。同じ池の人でTSやってる人いたら話しましょ',
    likes: 12,
    time: '3分前',
    liked: false,
  },
  {
    id: '2',
    user: 'めだか花子',
    avatar: 'め',
    pond: '数学',
    level: '澄み池',
    field: 'math',
    content: '二次方程式の解の公式、やっとスラスラ言えるようになった！\nx = (-b ± √(b²-4ac)) / 2a\n同じく苦手な人、一緒に頑張ろう',
    likes: 8,
    time: '15分前',
    liked: false,
  },
  {
    id: '3',
    user: 'フナ次郎',
    avatar: 'ふ',
    pond: '英語',
    level: '深碧池',
    field: 'english',
    content: 'TOEIC 750点突破した！リスニング対策はPodcastを1.5倍速で聴くのが効いた気がする。次は800点目指すぞ',
    likes: 24,
    time: '1時間前',
    liked: true,
  },
  {
    id: '4',
    user: 'コイ子',
    avatar: 'こ',
    pond: 'アート',
    level: '碧の池',
    field: 'art',
    content: '今週のチャレンジ「影の描き方」、初めてちゃんと立体感出せた気がする！光源を意識するだけでこんなに変わるんだね',
    likes: 19,
    time: '2時間前',
    liked: false,
  },
  {
    id: '5',
    user: 'サクラ鯛',
    avatar: 'さ',
    pond: 'プログラミング',
    level: '澄み池',
    field: 'programming',
    content: 'Pythonで初めてスクレイピングした！requestsとBeautifulSoup使ったら思ったより簡単だった。次は自動化に挑戦する',
    likes: 15,
    time: '3時間前',
    liked: false,
  },
];

export const LEVEL_COLORS: Record<string, string> = {
  '澄み池': Colors.primaryFixed,
  '碧の池': Colors.primaryFixedDim,
  '深碧池': Colors.primaryContainer,
  '蒼淵': Colors.primary,
};

export const TIMELINE_FILTERS = [
  { id: 'all', label: 'すべて' },
  { id: 'programming', label: 'プログラミング' },
  { id: 'math', label: '数学' },
  { id: 'english', label: '英語' },
  { id: 'art', label: 'アート' },
];
