import { Colors } from '@/constants/theme';

export type Comment = {
  id: string;
  postId: string;
  user: string;
  avatarId: string;
  content: string;
  time: string;
};

export type Post = {
  id: string;
  user: string;
  avatar: string;
  avatarId?: string;
  pond: string;
  level: string;
  field: string;
  pondId: string;
  content: string;
  likes: number;
  time: string;
  liked: boolean;
  comments: Comment[];
};

export const SEED_POSTS: Post[] = [
  {
    id: '1',
    user: 'かわうそ太郎',
    avatar: 'か',
    pond: 'プログラミング',
    level: '碧の池',
    field: 'programming',
    pondId: 'prog-aoi-A',
    content: 'TypeScriptのジェネリクス、ようやく理解できた！型推論が気持ちいい。同じ池の人でTSやってる人いたら話しましょ',
    likes: 12,
    time: '3分前',
    liked: false,
    comments: [
      { id: 'c1', postId: '1', user: 'サクラ鯛', avatarId: 'seahorse', content: '自分もジェネリクスで詰まってた！', time: '2分前' },
    ],
  },
  {
    id: '2',
    user: 'めだか花子',
    avatar: 'め',
    pond: '数学',
    level: '澄み池',
    field: 'math',
    pondId: 'math-sumi-A',
    content: '二次方程式の解の公式、やっとスラスラ言えるようになった！\nx = (-b ± √(b²-4ac)) / 2a\n同じく苦手な人、一緒に頑張ろう',
    likes: 8,
    time: '15分前',
    liked: false,
    comments: [],
  },
  {
    id: '3',
    user: 'フナ次郎',
    avatar: 'ふ',
    pond: '英語',
    level: '深碧池',
    field: 'english',
    pondId: 'eng-deep-A',
    content: 'TOEIC 750点突破した！リスニング対策はPodcastを1.5倍速で聴くのが効いた気がする。次は800点目指すぞ',
    likes: 24,
    time: '1時間前',
    liked: true,
    comments: [
      { id: 'c2', postId: '3', user: 'コイ子', avatarId: 'jellyfish', content: 'すごい！自分も試してみます', time: '45分前' },
      { id: 'c3', postId: '3', user: 'めだか花子', avatarId: 'coral', content: '800点も頑張れ〜！', time: '30分前' },
    ],
  },
  {
    id: '4',
    user: 'コイ子',
    avatar: 'こ',
    pond: 'アート',
    level: '碧の池',
    field: 'art',
    pondId: 'art-aoi-A',
    content: '今週のチャレンジ「影の描き方」、初めてちゃんと立体感出せた気がする！光源を意識するだけでこんなに変わるんだね',
    likes: 19,
    time: '2時間前',
    liked: false,
    comments: [],
  },
  {
    id: '5',
    user: 'サクラ鯛',
    avatar: 'さ',
    pond: 'プログラミング',
    level: '澄み池',
    field: 'programming',
    pondId: 'prog-sumi-A',
    content: 'Pythonで初めてスクレイピングした！requestsとBeautifulSoup使ったら思ったより簡単だった。次は自動化に挑戦する',
    likes: 15,
    time: '3時間前',
    liked: false,
    comments: [],
  },
];

export const LEVEL_COLORS: Record<string, string> = {
  '澄み池': Colors.primaryFixed,
  '碧の池': Colors.primaryFixedDim,
  '深碧池': Colors.primaryContainer,
  '蒼淵': Colors.primary,
};
