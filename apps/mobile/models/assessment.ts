import type { LevelKey } from '@/constants/levels';
import { Levels } from '@/constants/levels';
import type { FieldId } from '@/constants/fields';
import { FIELD_LABELS } from '@/models/field';

export { FIELD_LABELS };

export type Message = {
  id: string;
  role: 'ai' | 'user';
  text: string;
};

export type AssessmentStep = {
  question: string;
  options: string[];
};

export const ASSESSMENT_STEPS: Record<string, AssessmentStep[]> = {
  programming: [
    {
      question: 'プログラミングを始めてどのくらいですか？',
      options: ['始めたばかり（〜3ヶ月）', '少し経験あり（3ヶ月〜1年）', '経験あり（1〜3年）', 'かなり経験あり（3年以上）'],
    },
    {
      question: '主にどの言語・環境を使っていますか？',
      options: ['Scratch / ビジュアル言語', 'Python / JavaScript 基礎', 'Webアプリ / API開発', 'OSS貢献・競プロ上級'],
    },
    {
      question: '直近で作ったものを教えてください',
      options: ['まだ何も作ったことない', 'チュートリアル通りに作った', '自分でアレンジして作った', 'オリジナルのサービスを作った'],
    },
  ],
  math: [
    {
      question: '数学はどこまで学習しましたか？',
      options: ['中学数学まで', '高校数学（数I・数A）', '高校数学（数II・B・C）', '大学数学・競技数学'],
    },
    {
      question: '得意な分野はどれですか？',
      options: ['計算・方程式', '図形・幾何', '確率・統計', '微積・線形代数'],
    },
    {
      question: '数学の問題集はどのレベルを使っていますか？',
      options: ['教科書の基本問題', '定番問題集（チャートなど）', '入試・コンテスト問題', '数学オリンピックレベル'],
    },
  ],
  default: [
    {
      question: 'この分野を始めてどのくらいですか？',
      options: ['始めたばかり（〜3ヶ月）', '少し経験あり（3ヶ月〜1年）', '経験あり（1〜3年）', 'かなり経験あり（3年以上）'],
    },
    {
      question: '今の自分のレベルはどのくらいだと思いますか？',
      options: ['入門・基礎を学んでいる', '基礎は身についた', '応用・実践ができる', 'プロ・上級者レベル'],
    },
    {
      question: '直近でどんな活動をしていますか？',
      options: ['入門コンテンツを見ている', '練習・課題に取り組んでいる', 'コンテストや発表をしている', 'メンタリング・指導をしている'],
    },
  ],
};

export function getSteps(field: string): AssessmentStep[] {
  return ASSESSMENT_STEPS[field] ?? ASSESSMENT_STEPS.default;
}

export function judgeLevel(answers: number[]): LevelKey {
  const total = answers.reduce((a, b) => a + b, 0);
  const max = answers.length * 3;
  const ratio = total / max;
  if (ratio < 0.25) return '澄み池';
  if (ratio < 0.5) return '碧の池';
  if (ratio < 0.75) return '深碧池';
  return '蒼淵';
}

export function getLevelDescription(level: LevelKey): string {
  return Levels[level].description;
}

export function buildInitialMessage(field: string, firstQuestion: string): Message {
  return {
    id: '0',
    role: 'ai',
    text: `${FIELD_LABELS[field] ?? field}の池に入る前に、3つだけ質問させてください！\n\n${firstQuestion}`,
  };
}

export { type LevelKey, type FieldId };
