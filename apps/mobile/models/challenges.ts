export type Challenge = {
  id: string;
  field: string;
  level: string;
  title: string;
  description: string;
  daysLeft: number;
  participants: number;
  joined: boolean;
};

export const FIELD_ID_MAP: Record<string, string> = {
  'プログラミング': 'programming',
  '数学': 'math',
  '英語': 'english',
  'アート': 'art',
};

export const CHALLENGES: Challenge[] = [
  {
    id: '1',
    field: 'プログラミング',
    level: '碧の池',
    title: 'REST APIを実装しよう',
    description: '好きな言語でCRUDができるREST APIを実装して投稿しよう。エンドポイント設計も工夫してみて！',
    daysLeft: 4,
    participants: 23,
    joined: false,
  },
  {
    id: '2',
    field: '数学',
    level: '澄み池',
    title: '連立方程式チャレンジ',
    description: '今週の問題：x + 2y = 7, 3x - y = 5 を解いて、解き方を説明してみよう',
    daysLeft: 2,
    participants: 31,
    joined: true,
  },
  {
    id: '3',
    field: '英語',
    level: '深碧池',
    title: '英語日記チャレンジ',
    description: '今週は毎日3文以上の英語日記を書いて投稿しよう。テーマは「今週学んだこと」',
    daysLeft: 5,
    participants: 18,
    joined: false,
  },
  {
    id: '4',
    field: 'アート',
    level: '碧の池',
    title: '影の描き方マスター',
    description: '光源を1つ設定して、影をリアルに描こう。立体感を意識した作品を投稿してね',
    daysLeft: 3,
    participants: 15,
    joined: false,
  },
];
