# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

HonoフレームワークとDrizzle ORM、SQLite/libsqlを使用したREST APIアプリケーションのためのTypeScript monorepoです。pnpm workspacesとTurborepoを使用しています。

## よく使うコマンド

### 開発

- `pnpm dev` - 全ての開発サーバーを起動（Turborepoを使用）
- `pnpm build` - 全てのパッケージをビルド
- `pnpm lint` / `pnpm lint:fix` - 自動修正付きのLint実行
- `pnpm type-check` - ワークスペース全体のTypeScript型チェック

### データベース操作（apps/hono-api内で実行）

- `pnpm db:generate` - スキーマ変更からマイグレーションファイルを生成
- `pnpm db:migrate` - データベースにマイグレーションを適用
- `pnpm db:push` - スキーマ変更を直接適用（開発時）
- `pnpm db:studio` - データベース管理用のDrizzle Studioを開く

### 環境設定

- apps/hono-apiで`.env.example`を`.env`にコピー
- デフォルトデータベース: `file:./local.db` (SQLite)
- 本番環境用: libsql用に`DATABASE_URL`と`DATABASE_AUTH_TOKEN`を設定

## アーキテクチャ

### Monorepo構造

- `apps/hono-api/` - メインAPIアプリケーション
- `packages/eslint-config/` - 共有ESLint設定
- `packages/tsconfig/` - 共有TypeScript設定

### Hono APIアーキテクチャ（Clean Architecture + DDD）

```
src/
├── domain/                    # ビジネスエンティティとインターフェース
│   ├── task.ts               # ファクトリメソッド付きTaskエンティティ
│   └── interface/            # リポジトリインターフェース
├── application/service/      # ユースケースとアプリケーションサービス
└── infrastructure/          # 外部関心事
    ├── database/            # スキーマと接続
    ├── repository/          # リポジトリ実装
    ├── routes/              # HTTPルートハンドラー
    ├── env.ts               # Zodによる環境変数バリデーション
    └── server.ts            # アプリケーションブートストラップ
```

### 主要パターン

- **リポジトリパターン**: ドメインインターフェースをインフラストラクチャで実装
- **エンティティファクトリ**: `Task.create()`でnanoid生成、`Task.restore()`で永続化
- **依存性注入**: Honoミドルウェアでのコンテキストベース依存性注入
- **環境変数バリデーション**: `infrastructure/env.ts`でのZodスキーマ

## データベーススキーマ

### テーブル

- **users**: id（text/nanoid）、name、email、timestamps
- **tasks**: id（text/nanoid）、name、created_by/updated_by（usersへのFK）、timestamps

### ワークフロー

1. `src/infrastructure/database/schema.ts`でスキーマを変更
2. `pnpm db:generate`でマイグレーションを作成
3. `pnpm db:migrate`で変更を適用

## 開発メモ

### TypeScript設定

- `.js`インポート拡張子付きのESモジュール（Node.js用に必須）
- 厳密な型チェックが有効
- モジュール解決: `nodenext`

### Lintルール

- アルファベット順でのインポート整理
- インポートの明示的なファイル拡張子
- 重複インポートの禁止
- ESLintフラット設定形式

### ID生成

- 全てのエンティティIDにnanoidを使用（Taskエンティティで既に設定済み）
- データベースではtext主キーを使用、自動インクリメントなし

### エラーハンドリング

- 起動時にZodで環境変数をバリデーション
- Drizzleによる型安全なデータベース操作
- リポジトリパターンでデータアクセスエラーを分離

## 新機能の追加

### 新しいエンティティ

1. `src/domain/`にドメインエンティティを作成
2. `src/domain/interface/`にリポジトリインターフェースを定義
3. `src/infrastructure/repository/`にリポジトリを実装
4. `src/infrastructure/database/schema.ts`にデータベーススキーマを追加
5. マイグレーションを生成・実行

### 新しいルート

1. `src/infrastructure/routes/`にルートハンドラーを作成
2. `src/infrastructure/server.ts`に登録
3. 必要に応じてコンテキストにリポジトリを追加
