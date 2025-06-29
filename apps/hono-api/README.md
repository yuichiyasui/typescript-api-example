# Hono API

HonoフレームワークとDrizzle ORM、SQLite/libsqlを使用したREST APIアプリケーションです。

## 機能

- ユーザー登録・ログイン・ログアウト
- JWT認証（アクセストークン・リフレッシュトークン）
- タスク管理API
- OpenAPI仕様書（Swagger UI）
- TypeScript完全対応

## Getting Started

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 環境変数の設定

`.env.example`を`.env`にコピーし、必要な環境変数を設定してください。

```bash
cp .env.example .env
```

### 3. JWT秘密鍵の生成

JWT認証に必要な秘密鍵を生成します。以下のいずれかの方法で32文字以上の安全な文字列を生成してください。

#### 方法1: Node.jsを使用

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 方法2: OpenSSLを使用

```bash
openssl rand -hex 32
```

#### 方法3: オンラインジェネレーター

安全なパスワードジェネレーターを使用して64文字以上の文字列を生成してください。

### 4. .envファイルの更新

生成した秘密鍵を`.env`ファイルに設定してください。

```bash
# JWT Authentication
JWT_SECRET=生成した秘密鍵1をここに入力
JWT_REFRESH_SECRET=生成した秘密鍵2をここに入力
```

**重要**:

- `JWT_SECRET`と`JWT_REFRESH_SECRET`は異なる値を使用してください
- 本番環境では必ず安全な秘密鍵を使用してください
- 秘密鍵は絶対にGitにコミットしないでください

### 5. データベースの設定

```bash
# マイグレーションファイルの生成
pnpm db:generate

# データベースにマイグレーションを適用
pnpm db:migrate
```

### 6. 開発サーバーの起動

```bash
pnpm dev
```

サーバーが起動すると、以下のURLでアクセスできます：

- API: http://localhost:3000
- Swagger UI: http://localhost:3000/docs
- OpenAPI仕様書: http://localhost:3000/openapi.json

## API エンドポイント

### 認証不要

- `POST /users/register` - ユーザー登録
- `POST /users/login` - ユーザーログイン

### 認証必要

- `POST /users/logout` - ユーザーログアウト
- `GET /tasks` - タスク一覧取得

## 認証について

このAPIはJWT（JSON Web Token）ベースの認証を使用しています。

### 認証フロー

1. ユーザー登録: `POST /users/register`
2. ログイン: `POST /users/login`
   - 成功時、アクセストークン（30分有効）とリフレッシュトークン（7日有効）がHTTPOnlyクッキーで設定されます
3. 認証が必要なAPIへのアクセス
   - クッキーのアクセストークンが自動的に検証されます
4. ログアウト: `POST /users/logout`
   - 認証クッキーがクリアされます

### パスワード要件

- 8文字以上128文字以下
- 大文字を1文字以上含む
- 小文字を1文字以上含む
- 数字を1文字以上含む
- 特殊文字を1文字以上含む (!@#$%^&\*()\_+-=[]{};"\\|,.<>/?)

## 開発用コマンド

```bash
# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# 本番サーバー起動
pnpm start

# Lint
pnpm lint
pnpm lint:fix

# 型チェック
pnpm type-check

# テスト
pnpm test
pnpm test:run
pnpm test:ui

# データベース操作
pnpm db:generate  # マイグレーションファイル生成
pnpm db:migrate   # マイグレーション実行
pnpm db:push      # スキーマを直接適用（開発時）
pnpm db:studio    # Drizzle Studio起動
```

## プロジェクト構成

```
src/
├── domain/                    # ビジネスエンティティとインターフェース
│   ├── task.ts               # Taskエンティティ
│   ├── user.ts               # Userエンティティ
│   ├── value/                # 値オブジェクト
│   │   └── password.ts       # パスワード値オブジェクト
│   └── interface/            # リポジトリインターフェース
├── application/service/      # ユースケースとアプリケーションサービス
└── infrastructure/          # 外部関心事
    ├── auth/                # 認証関連
    │   ├── jwt.ts           # JWT処理
    │   └── middleware.ts    # 認証ミドルウェア
    ├── database/            # データベーススキーマと接続
    ├── repository/          # リポジトリ実装
    ├── routes/              # HTTPルートハンドラー
    ├── schemas/             # APIスキーマ定義
    ├── middleware/          # その他のミドルウェア
    ├── context.ts           # アプリケーションコンテキスト
    ├── env.ts               # 環境変数バリデーション
    ├── logger.ts            # ログ設定
    └── server.ts            # アプリケーションブートストラップ
```

## 技術スタック

- **フレームワーク**: Hono
- **ORM**: Drizzle ORM
- **データベース**: SQLite (開発) / libSQL (本番)
- **認証**: JWT
- **バリデーション**: Zod
- **ドキュメント**: OpenAPI 3.0 / Swagger UI
- **ログ**: Pino
- **パスワードハッシュ**: bcrypt
- **テスト**: Vitest
- **型チェック**: TypeScript
- **Lint**: ESLint
