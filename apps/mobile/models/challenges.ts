export type Challenge = {
  id: string;
  field: string;
  level: string;
  title: string;
  description: string;
  daysLeft: number;
  participants: number;
  joined: boolean;
  isSubjective: boolean;
};

export type ChallengeParticipant = {
  id: string;
  name: string;
  avatarId: string;
  isMe?: boolean;
};

export type SeedSubmission = {
  id: string;
  user: string;
  avatarId: string;
  answer: string;
  time: string;
};

export type MySubmissionResult = {
  answer: string;
  pass: boolean;
  score?: number;
  comment: string;
};

export const CHALLENGE_JOINED_KEY = 'challenge_joined';
export const CHALLENGE_SUBMISSION_KEY = 'challenge_submission';
export const CHALLENGE_PARTICIPATING_KEY = 'challenge_participating';

export const FIELD_ID_MAP: Record<string, string> = {
  'プログラミング': 'programming',
  '数学': 'math',
  '英語': 'english',
  'アート': 'art',
  '音楽': 'music',
  '科学': 'science',
};

export const CHALLENGES: Challenge[] = [
  {
    id: '1',
    field: 'プログラミング',
    level: '碧の池',
    title: 'REST APIを実装しよう',
    description: '好きな言語でCRUDができるREST APIを実装しよう。エンドポイント設計も工夫してみて！',
    daysLeft: 4,
    participants: 23,
    joined: false,
    isSubjective: false,
  },
  {
    id: '2',
    field: '数学',
    level: '澄み池',
    title: '連立方程式チャレンジ',
    description: 'x + 2y = 7, 3x - y = 5 を解いて、解き方を説明してみよう',
    daysLeft: 2,
    participants: 31,
    joined: false,
    isSubjective: false,
  },
  {
    id: '3',
    field: '英語',
    level: '深碧池',
    title: '英語日記チャレンジ',
    description: '今週学んだことを3文以上の英語で書いて投稿しよう',
    daysLeft: 5,
    participants: 18,
    joined: false,
    isSubjective: false,
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
    isSubjective: true,
  },
];

export const SEED_SUBMISSIONS: Record<string, SeedSubmission[]> = {
  '1': [
    { id: 's1-1', user: 'かわうそ太郎', avatarId: 'turtle', answer: 'Node.js + ExpressでCRUD APIを実装しました！GETでリスト取得、POSTで作成、PUT/DELETEで更新削除できます。', time: '5時間前' },
    { id: 's1-2', user: 'コイ子', avatarId: 'coral', answer: 'PythonとFastAPIで実装。/users, /users/{id}のエンドポイントで基本的なCRUDを実現できました！', time: '2時間前' },
  ],
  '2': [
    { id: 's2-1', user: 'さくら鯛', avatarId: 'seahorse', answer: 'x=17/7, y=11/7です。代入法を使って解きました。1式からxを求めて2式に代入する方法です。', time: '4時間前' },
    { id: 's2-2', user: 'めだか花子', avatarId: 'jellyfish', answer: '加減法で解きました。1式×3から2式を引いてyを消去するとx=17/7、代入してy=11/7になります。', time: '1時間前' },
  ],
  '3': [
    { id: 's3-1', user: 'ミオ', avatarId: 'lighthouse', answer: 'Today I learned about React hooks. I spent 3 hours studying useState and useEffect. It was challenging but very rewarding!', time: '6時間前' },
  ],
  '4': [
    { id: 's4-1', user: 'ナツ', avatarId: 'octopus', answer: '光源を左上に設定して、球体の影を描きました。グラデーションで立体感を出すのが難しかったけど、うまくできました！', time: '3時間前' },
  ],
};

export const SEED_PARTICIPANTS: Record<string, ChallengeParticipant[]> = {
  '1': [
    { id: 'pa1', name: 'かわうそ太郎', avatarId: 'turtle' },
    { id: 'pa3', name: 'サクラ鯛', avatarId: 'seahorse' },
  ],
  '2': [
    { id: 'ms1', name: 'めだか花子', avatarId: 'jellyfish' },
    { id: 'ms2', name: 'さくら鯛', avatarId: 'coral' },
    { id: 'ms4', name: 'アキ', avatarId: 'squid' },
  ],
  '3': [
    { id: 'ed1', name: 'フナ次郎', avatarId: 'diver' },
  ],
  '4': [
    { id: 'aa1', name: 'コイ子', avatarId: 'jellyfish' },
    { id: 'aa4', name: 'ナツ', avatarId: 'octopus' },
  ],
};
