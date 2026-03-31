# pond

updated 2026/03/29 13:52(JST)

## 概要

このアプリは、学習者がより良く学習できるようにサポートするアプリです。
学習者は質問に答え、同レベル帯の学習者とグループを作ることで、互いに高めあうことができます。
このアプリでは、そのグループのことを「池」と呼んでいます。

Pondは、AI時代に「自分で学ぶ意味」を取り戻すためのコミュニティ学習アプリです。同じレベル・同じ目的を持つ5人程度の少人数グループ「池」に参加し、教え合い・競い合いながら学習を進めます。少人数だからこそ発言しやすく、似た現在地の仲間がいるからこそ自分の進捗を客観的に確認できます。共同で取り組む「チャレンジ」機能により、学習の継続と成長を自然に促します。ランクや数字を目標にするのではなく、本当の実力を上げることを目的とした、AI時代の新しい学び方の場です。

## 機能

- プロフィール
- タイムライン
- 参加している池の一覧
- 池のチャット
- 池のメンバー一覧
- 池の作成（AIが自動で作成,5人程度）
- 池の脱退
- チャレンジの一覧
- チャレンジのステータス
- チャレンジの参加(個人)
- チャレンジの参加（池単位）

## 技術スタック

- Bun.js
- Turborepo
- Hono.js
- Expo
  - Moti
- Next.js
- SQLite

## フォルダ構成

```
pond/
├─ apps/
│  ├─ web (Next.js)
│  ├─ mobile (Expo app)
│  └─ server (Hono.js,cloudflare worker)/
│     ├─ index.js (server entry point)
│     ├─ domain/
│     │  ├─ User
│     │  ├─ ChatRoom
│     │  ├─ Message
│     │  ├─ Profile
│     │  └─ Prompt
│     ├─ services
│     └─ infrastructure
└─ packages/
   ├─ ui
   └─ utils
```

## 技術方針

### TODO

- 404用のページ

### Server

サーバーではクリーンアーキテクチャを採用。
各レイヤー間はDIを徹底すること。

セッション管理にはJWTを使用。

ホスティングにはcloudflare workerを使用。

フレームワークはHono

DBはcloudflare d1

ORMはDrizzle

型はzod

#### .env file

- OPENAI_API_KEY: string
- OPENAI_API_BASE_URL: string (local llmを使用する予定)

#### オブジェクト管理

- ike
  - chatRoomId (/ike/{:ike_id}/chatで使用するチャットのid)
  - ...

- ChatRoom
  - これはDBとマッピングする。
  - エンドポイントは `/ike/{:ike_id}/chat`
  - ...

#### endpoint

- GET /health
  - 動作チェック
- POST /register
  - 登録
- POST /register/profile
  - プロフィール登録
- POST /login
  - ログイン
- POST /logout
  - ログアウト

- POST /ike/apply
  - 質問の回答を送信し、池にアサインされる。
- GET /ike/list
  - マイ池の一覧
  - response item
    - id: string
    - ikeName: string
    - members_id: string[]
    - level: string
    - category: string
    - description: string
- GET /ike/:ike_id/status
  - 人数、レベル、特徴
- GET /ike/:ike_id/chat
  - 池のチャット
- POST /ike/:ike_id/chat/message
  - 池のチャットにメッセージを追加
- POST /ike/:ike_id/chat/:message_id/edit
  - 池のチャットに(自分の)メッセージを編集
- POST /ike/:ike_id/chat/:message_id/delete
  - 池のチャットに(自分の)メッセージを削除
- POST /ike/:ike_id/chat/:message_id/reply
  - 池のチャットにメッセージをリプライ

- GET /timeline
  - タイムラインを取得
- POST /timeline/post
  - タイムラインに投稿
- POST /timeline/like/:message_id
  - タイムラインに投稿をいいね
- POST /timeline/unlike/:message_id
  - タイムラインに投稿をいいね解除
- POST /timeline/reply/:message_id
  - タイムラインに投稿にリプライ
- POST /timeline/unreply/:message_id
  - タイムラインに投稿のリプライ解除

- GET /challenge/list
  - チャレンジの一覧
- GET /challenge/:challenge_id/status
  - チャレンジのステータス
- POST /challenge/:challenge_id/join
  - チャレンジに参加
- POST /challenge/:challenge_id/leave
  - チャレンジを辞退
- POST /challenge/:challenge_id/submit
  - チャレンジを提出
- GET /challenge/:challenge_id/others_answers
  - 他のユーザーの提出を取得(自分が提出している場合のみ)

- GET /profile
  - プロフィールを取得
- POST /profile/edit
  - プロフィールを編集
- GET /profile/:user_id
  - プロフィールを取得
- POST /profile/:user_id/edit
  - プロフィールを編集
- GET /challenge/list
  - チャレンジの一覧
- GET /challenge/:challenge_id/status
  - チャレンジのステータス
- GET /challenge/:challenge_id/chat
  - チャレンジのチャット

### Admin web

簡易的なwebサーバーで構築

- プロンプトの設定

### Web

ウェブではNext.jsを採用。

#### ログイン画面

emailとpasswordを入力するフォーム。
サーバーと接続し、検証し、検証が成功すればホーム画面に遷移

#### アカウント新規作成画面

#### コンテンツ

- (tab)タイムライン
  - 呟くボタン
  - タイムライン
    - いいね
    - リプライ
  - お気に入りのコンテンツごとのセパレート（例：すべて｜プログラミング｜英語｜料理）
- (tab)マイ池
  - 参加している池の一覧
- (tab)チャレンジ
  - 参加している池にあったチャレンジの一覧
- (tab)プロフィール
  - アイコン
  - id
  - 名前
  - 自己紹介
  - 投稿数
  - もらったいいね数
  - 参加チャレンジ数
  - 所属している池
- (tab)設定
  - プッシュ通知
  - プライバシー設定
  - ヘルプ
  - ログアウト

### Mobile

モバイルではExpoを採用。

#### ログイン画面

emailとpasswordを入力するフォーム。
サーバーと接続し、検証し、検証が成功すればホーム画面に遷移

#### アカウント新規作成画面

emailとpasswordを入力するフォーム。
サーバーと接続し、検証し、検証が成功すればホーム画面に遷移

#### コンテンツ

- (tab)タイムライン
  - 呟くボタン
  - タイムライン
    - いいね
    - リプライ
  - お気に入りのコンテンツごとのセパレート（例：すべて｜プログラミング｜英語｜料理）
- (tab)マイ池
  - 参加している池の一覧
- (tab)チャレンジ
  - 参加している池にあったチャレンジの一覧
- (tab)プロフィール
  - アイコン
  - id
  - 名前
  - 自己紹介
  - 投稿数
  - もらったいいね数
  - 参加チャレンジ数
  - 所属している池
- (tab)設定
  - プッシュ通知
  - プライバシー設定
  - ヘルプ
  - ログアウト

#### アニメーション

- いいね
  - Xのような弾けるようにいいね
- 池に入る
  - 薄い水紋が中心から画面全体を移動に画面を遷移

### Database

データベースではSQLiteを採用。
システムの規模が大きくなれば、PostgreSQLに移行する可能性あり。

### 各種オブジェクト

#### User

- id: string
- user_id: string
- nickname: string
- email: string
- encrypted_password: string
- belonging_ike_ids: string[]
- created_at: string
- updated_at: string

##### PublicRange

- all
- ike
- profile

#### Profile

- id: string
- user_id: string
- name: string
- bio: string
- avatar: string
- created_at: string
- updated_at: string

#### Personality(unused)

- id: string
- user_id: string
- personality_description: string
- created_at: string
- updated_at: string

#### Ike

- id: string
- ikeName: string
- category: string
- level: IkeLevel
- description: string
- memberIds: string[] (user id)
- chatRoomId: string
- joined_challenges: string[] (challenge id)
- created_at: string
- updated_at: string

#### IkeLevel

- 澄み池
- 碧の池
- 深碧池
- 蒼淵

#### ChatRoom

- id: string
- messages: string[] (message id)
- created_at: string
- updated_at: string

#### Message

- id: string
- user_id: string
- content: string
- public_range: PublicRange
- created_at: string
- updated_at: string

#### TimelineHolder

- id: string
- contents: timelineItem[]
- created_at: string
- updated_at: string

#### timelineItem

ユーザーに表示されるタイムラインはマイ池と同じカテゴリーの全レベル帯のコンテンツを確認することが、できます。

- id: string
- user_id: string
- ike_id: string
- ike_category: string
- content: string
- created_at: string
- updated_at: string

#### Challenge

チャレンジはAIによって作成されます。
チャレンジの管理方法はチャレンジの中に参加した池ごとに（管理用オブジェクト）池チャレンジを作成し、管理します。
さらに、池チャレンジの中に答えを配置し、いつでも見返せるようにします。
また同じ帯のレベルのみが参加できます。
池チャレンジの参加者が0になった場合池ごと辞退となります。

- id: string
- title: string
- description: string
- joined_ike_challenge_id: string (joined_ike_challenge_id)
- level: IkeLevel
- timelimit: Date
- created_at: string
- updated_at: string

#### JoinedIkeChallenge

- id: string
- ike_id: string
- challenge_id: string
- joined_user_ids: string[]
- answers: string[] (challengeAnswer id)
- created_at: string
- updated_at: string

#### ChallengeAnswer

- id: string
- user_id: string
- answer: string
- created_at: string
- updated_at: string

#### Prompt

- id: string
- model: string
- purpose: Purpose
- content: string
- created_at: string
- updated_at: string

##### Purpose

- analyze_ike
  - 存在する池の分析
- asign_ike
  - ユーザーを池にアサイン
- create_ike
  - 新しい池の作成

### その他

#### AI

AIのAPIの呼び出しにはOpenAI API互換のエントリーポイントを使用。

- https://{hostname}/v1/models
- https://{hostname}/v1/response
- https://{hostname}/v1/completions
- https://{hostname}/v1/chat/completions
- https://{hostname}/v1/embeddings
