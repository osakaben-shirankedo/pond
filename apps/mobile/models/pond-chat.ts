import type { LevelKey } from '@/constants/theme';

export type ChatMessage = {
  id: string;
  user: string;
  avatar: string;
  level: LevelKey;
  content: string;
  time: string;
  isMe: boolean;
};

export const SEED_MESSAGES: Record<string, Omit<ChatMessage, 'id' | 'isMe'>[]> = {
  programming: [
    { user: 'かわうそ太郎', avatar: 'か', level: '碧の池', content: 'みなさん今TypeScript書いてますか？型推論が楽しすぎる', time: '10:12' },
    { user: 'フナ次郎', avatar: 'ふ', level: '深碧池', content: 'TSいいよね。anyを使わない縛りで書くとかなり力がつく', time: '10:14' },
    { user: 'めだか花子', avatar: 'め', level: '澄み池', content: 'まだJSです…TSって最初から入れた方がいいですか？', time: '10:17' },
    { user: 'かわうそ太郎', avatar: 'か', level: '碧の池', content: '絶対最初から入れた方がいい！後から移行がしんどい', time: '10:19' },
    { user: 'コイ子', avatar: 'こ', level: '澄み池', content: '今週のチャレンジのAPI連携、みんなどのくらい進んだ？', time: '10:35' },
    { user: 'フナ次郎', avatar: 'ふ', level: '深碧池', content: 'とりあえずfetch完成。エラーハンドリングが残ってる', time: '10:38' },
  ],
  math: [
    { user: 'さくら鯛', avatar: 'さ', level: '澄み池', content: '二次方程式の解の公式、ようやく暗記できた！', time: '09:05' },
    { user: 'めだか花子', avatar: 'め', level: '碧の池', content: 'わかるw 最初しんどいよね。微分に入るともっと楽しくなる', time: '09:08' },
    { user: 'かわうそ太郎', avatar: 'か', level: '深碧池', content: '積分まで来ると世界変わる。面積が求められる感動', time: '09:11' },
    { user: 'さくら鯛', avatar: 'さ', level: '澄み池', content: '今は確率やってます。組み合わせとか楽しい', time: '09:20' },
    { user: 'コイ子', avatar: 'こ', level: '碧の池', content: '確率いいよね。ベイズ定理まで行くと実用的になってくる', time: '09:25' },
  ],
  english: [
    { user: 'フナ次郎', avatar: 'ふ', level: '深碧池', content: 'TOEIC 750越えた！リスニングはPodcast 1.5倍速がよかった', time: '11:00' },
    { user: 'さくら鯛', avatar: 'さ', level: '碧の池', content: 'すごい！私は今600台で停滞中…', time: '11:03' },
    { user: 'めだか花子', avatar: 'め', level: '澄み池', content: 'シャドーイングって効果ありますか？', time: '11:06' },
    { user: 'フナ次郎', avatar: 'ふ', level: '深碧池', content: 'シャドーイングかなり効く。最初はゆっくりから', time: '11:08' },
    { user: 'コイ子', avatar: 'こ', level: '碧の池', content: 'Netflixの英語字幕で見るのもいい。楽しいし続く', time: '11:15' },
  ],
  art: [
    { user: 'コイ子', avatar: 'こ', level: '碧の池', content: '今週のチャレンジ「影の描き方」、光源意識したら急に上手くなった', time: '14:00' },
    { user: 'さくら鯛', avatar: 'さ', level: '澄み池', content: '私も！影って奥深いよね。色も混ぜると立体感でる', time: '14:05' },
    { user: 'めだか花子', avatar: 'め', level: '碧の池', content: 'デジタルと手書きどっちで練習してる？', time: '14:10' },
    { user: 'コイ子', avatar: 'こ', level: '碧の池', content: '手書きから始めてiPadに移行した。どっちも大事だと思う', time: '14:13' },
  ],
  music: [
    { user: 'かわうそ太郎', avatar: 'か', level: '澄み池', content: 'ドレミファソラシド覚えたぞ！次はコードかな', time: '16:00' },
    { user: 'フナ次郎', avatar: 'ふ', level: '深碧池', content: 'コードはC・G・Am・Fで大体の曲弾ける。まずそこから！', time: '16:04' },
    { user: 'さくら鯛', avatar: 'さ', level: '碧の池', content: 'Cメジャーだけで色んな曲できるの感動する', time: '16:08' },
    { user: 'コイ子', avatar: 'こ', level: '澄み池', content: 'ギターとピアノどっちがおすすめ？', time: '16:15' },
    { user: 'フナ次郎', avatar: 'ふ', level: '深碧池', content: '独学ならギターかな。コードブックがわかりやすい', time: '16:18' },
  ],
  science: [
    { user: 'めだか花子', avatar: 'め', level: '碧の池', content: '化学式の暗記コツある？元素記号が全然頭に入らない', time: '13:00' },
    { user: 'かわうそ太郎', avatar: 'か', level: '深碧池', content: '語呂合わせが最強。水兵リーベ僕の船…古典的だけど効く', time: '13:04' },
    { user: 'さくら鯛', avatar: 'さ', level: '澄み池', content: '周期表のパターンで覚えると応用がきく', time: '13:07' },
    { user: 'フナ次郎', avatar: 'ふ', level: '碧の池', content: '今は物理やってる。運動方程式が面白い', time: '13:20' },
    { user: 'めだか花子', avatar: 'め', level: '碧の池', content: '物理いいな。ベクトルと合わせて理解すると気持ちいい', time: '13:25' },
  ],
};
