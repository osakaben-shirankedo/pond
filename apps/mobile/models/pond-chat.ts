import type { LevelKey } from '@/constants/levels';

export type ChatMessage = {
  id: string;
  user: string;
  avatar: string;
  avatarId?: string;
  level: LevelKey;
  content: string;
  time: string;
  isMe: boolean;
  type?: 'normal' | 'challenge' | 'ai_fish' | 'system';
  challengeId?: string;
  challengeTitle?: string;
  replyToId?: string;
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
  physics: [
    { user: 'かわうそ太郎', avatar: 'か', level: '澄み池', content: '等加速度運動ってv=v₀+atの式、どう使い分ければいい？', time: '09:10' },
    { user: 'フナ次郎', avatar: 'ふ', level: '深碧池', content: 'v-tグラフを描くと視覚的に整理しやすい。面積が変位になるのもポイント', time: '09:13' },
    { user: 'さくら鯛', avatar: 'さ', level: '碧の池', content: '力学エネルギー保存則、どこで使えるか迷う…', time: '09:30' },
    { user: 'めだか花子', avatar: 'め', level: '澄み池', content: '摩擦がないときだよ。あれば仕事と熱に変換されてる', time: '09:33' },
    { user: 'コイ子', avatar: 'こ', level: '碧の池', content: '電磁誘導むずい。レンツの法則の向きが毎回わからなくなる', time: '09:50' },
  ],
  chemistry: [
    { user: 'めだか花子', avatar: 'め', level: '澄み池', content: 'モル計算って何度やっても混乱する…単位変換がキモ？', time: '10:00' },
    { user: 'かわうそ太郎', avatar: 'か', level: '碧の池', content: 'mol = 質量÷モル質量 だけ覚えれば大体いける', time: '10:03' },
    { user: 'フナ次郎', avatar: 'ふ', level: '深碧池', content: '酸化還元の半反応式、覚えるより作れるようにした方がいい', time: '10:15' },
    { user: 'さくら鯛', avatar: 'さ', level: '澄み池', content: '有機化学は構造式の書き方から覚えると繋がってくる', time: '10:22' },
    { user: 'コイ子', avatar: 'こ', level: '碧の池', content: 'エステル化の反応式、今日やっとスラスラ書けるようになった', time: '10:38' },
  ],
  biology: [
    { user: 'さくら鯛', avatar: 'さ', level: '澄み池', content: '細胞分裂の順番って何回覚えてもすぐ忘れる…', time: '11:00' },
    { user: 'コイ子', avatar: 'こ', level: '碧の池', content: '語呂合わせ作ると記憶に残りやすい。有糸分裂なら前期〜終期で整理', time: '11:04' },
    { user: 'めだか花子', avatar: 'め', level: '澄み池', content: 'DNAの塩基対、A-T、G-Cはもう完璧。次は転写・翻訳', time: '11:20' },
    { user: 'フナ次郎', avatar: 'ふ', level: '深碧池', content: 'タンパク質合成の流れ、図を自分で描いて覚えると最強', time: '11:24' },
    { user: 'かわうそ太郎', avatar: 'か', level: '碧の池', content: '生態系の物質循環、炭素と窒素の経路どっちが試験に出やすい？', time: '11:40' },
  ],
  history: [
    { user: 'フナ次郎', avatar: 'ふ', level: '澄み池', content: '江戸時代の三大改革、享保・田沼・寛政の内容がいつも混乱する', time: '14:00' },
    { user: 'さくら鯛', avatar: 'さ', level: '碧の池', content: '年号より「前後の流れ」で覚える方が試験で使える', time: '14:05' },
    { user: 'めだか花子', avatar: 'め', level: '澄み池', content: '世界史は地図と一緒に覚えると定着する', time: '14:12' },
    { user: 'コイ子', avatar: 'こ', level: '深碧池', content: '史料問題は問題集だけでなく教科書の脚注も要チェック', time: '14:20' },
    { user: 'かわうそ太郎', avatar: 'か', level: '碧の池', content: '近現代史は範囲広いけど流れを掴むと一気に楽になった', time: '14:35' },
  ],
  geography: [
    { user: 'コイ子', avatar: 'こ', level: '澄み池', content: '気候区分ってどうやって効率よく覚えてる？ケッペン多すぎる', time: '15:00' },
    { user: 'かわうそ太郎', avatar: 'か', level: '碧の池', content: '雨温図を見たらすぐ判断できるよう特徴の一覧表を作った', time: '15:04' },
    { user: 'フナ次郎', avatar: 'ふ', level: '深碧池', content: '農業・工業の統計は地図帳と一緒に見ると理解が深まる', time: '15:15' },
    { user: 'さくら鯛', avatar: 'さ', level: '澄み池', content: '地形図の等高線、間隔が狭いほど急勾配って今日やっと実感できた', time: '15:22' },
    { user: 'めだか花子', avatar: 'め', level: '碧の池', content: '都市問題や人口問題は論述でよく出るから理解優先で', time: '15:40' },
  ],
  japanese: [
    { user: 'めだか花子', avatar: 'め', level: '澄み池', content: '現代文の評論、筆者の主張がつかめなくて迷子になる', time: '08:00' },
    { user: 'さくら鯛', avatar: 'さ', level: '碧の池', content: '逆接の接続詞の後ろが主張という意識だけで変わった', time: '08:04' },
    { user: 'フナ次郎', avatar: 'ふ', level: '深碧池', content: '古文の助動詞、活用表を丸ごと暗記するより識別練習が効く', time: '08:15' },
    { user: 'コイ子', avatar: 'こ', level: '澄み池', content: '古文は「なり」の識別が毎回怪しい…断定？伝聞推定？', time: '08:25' },
    { user: 'かわうそ太郎', avatar: 'か', level: '碧の池', content: '漢文は返り点に慣れたら読む速度が段違いになった', time: '08:38' },
  ],
  ethics: [
    { user: 'さくら鯛', avatar: 'さ', level: '澄み池', content: '功利主義と義務論の違いがいまいちわからない', time: '16:00' },
    { user: 'フナ次郎', avatar: 'ふ', level: '深碧池', content: '功利主義は結果で判断、義務論はカントで行為自体の正しさを問う', time: '16:04' },
    { user: 'めだか花子', avatar: 'め', level: '碧の池', content: 'ソクラテスの「無知の知」って具体的にどういう状態？', time: '16:15' },
    { user: 'コイ子', avatar: 'こ', level: '澄み池', content: '「自分が知らないことを知っている」が出発点になる感じかな', time: '16:18' },
    { user: 'かわうそ太郎', avatar: 'か', level: '碧の池', content: '現代思想まで来るとデリダの脱構築がなかなか難しい', time: '16:35' },
  ],
  economics: [
    { user: 'コイ子', avatar: 'こ', level: '澄み池', content: 'GDPとGNPの違い、毎回テスト前に確認してる…', time: '17:00' },
    { user: 'かわうそ太郎', avatar: 'か', level: '碧の池', content: 'GDPは国内、GNPは国民基準。海外で日本人が稼いだ分はGNP', time: '17:03' },
    { user: 'フナ次郎', avatar: 'ふ', level: '深碧池', content: '需要と供給のグラフ、シフトの方向がいつも混乱する', time: '17:14' },
    { user: 'さくら鯛', avatar: 'さ', level: '澄み池', content: 'インフレとデフレの対策の違いをまとめたら理解が深まった', time: '17:22' },
    { user: 'めだか花子', avatar: 'め', level: '碧の池', content: '景気循環の4段階、回復→好況→後退→不況を今日覚えた！', time: '17:38' },
  ],
};
