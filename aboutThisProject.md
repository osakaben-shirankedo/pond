# pond

updated 2026/03/29 13:52(JST)

## 概要

このアプリは、学習者がより良く学習できるようにサポートするアプリです。
学習者は質問に答え、同レベル帯の学習者とグループを作ることで、互いに高めあうことができます。
このアプリでは、そのグループのことを「池」と読んでいます。

## 機能

- プロフィール
- タイムライン
- 参加している池の一覧
- 池のチャット
- 池のメンバー一覧
- 池の作成（AIが自動で作成,5人程度）
- 池の脱退

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
│  └─ server (Hono.js)/
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
   ├─ db/
   │  ├─ User
   │  ├─ ChatRoom
   │  ├─ Message
   │  ├─ Profile
   │  └─ Prompt
   ├─ ui
   └─ utils
```

## 技術方針

### Server

サーバーではクリーンアーキテクチャを採用。
各レイヤー間はDIを徹底すること。

セッション管理にはJWTを使用。

#### .env file

- OPENAI_API_KEY: string
- OPENAI_API_BASE_URL: string (local llmを使用する予定)

#### endpoint

- GET /health
- POST /register
- POST /register/profile
- POST /login
- POST /logout
- GET /ike/list
- GET /ike/:ike_id/status
  - 人数、レベル、特徴
- GET /ike/:ike_id/chat
- POST /ike/:ike_id/chat/message
- POST /ike/:ike_id/chat/:message_id/edit
- POST /ike/:ike_id/chat/:message_id/delete
- POST /ike/:ike_id/chat/:message_id/reply
- POST /timeline/post
- POST /timeline/like/:message_id
- POST /timeline/unlike/:message_id
- POST /timeline/reply/:message_id
- POST /timeline/unreply/:message_id

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
- name: string
- email: string
- password: string
- created_at: string
- updated_at: string

#### Ike

- id: string
- name: string
- description: string
- memberIds: string[] (user id)
- chatRoomId: string
- created_at: string
- updated_at: string

#### ChatRoom

- id: string
- messages: string[] (message id)
- created_at: string
- updated_at: string

#### Message

- id: string
- user_id: string
- content: string
- created_at: string
- updated_at: string

#### Profile

- id: string
- user_id: string
- name: string
- bio: string
- avatar: string
- created_at: string
- updated_at: string

#### Personality

- id: string
- user_id: string
- personality_description: string
- created_at: string
- updated_at: string

#### Prompt

- id: string
- model: string
- purpose: string
- content: string
- created_at: string
- updated_at: string

#### purpose

- analyze_ike
  - 存在する池の分析
- asign_ike
  - ユーザーを池にアサイン
- create_ike
  - 新しい池の作成

### その他

AIのAPIの呼び出しにはOpenAI API互換のエントリーポイントを使用。

- https://{hostname}/v1/models
- https://{hostname}/v1/response
- https://{hostname}/v1/completions
- https://{hostname}/v1/chat/completions
- https://{hostname}/v1/embeddings
