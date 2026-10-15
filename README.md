# うちの推しアプリ（推しノート）

推しの似顔絵アバターを作って、好きなもの・苦手なもの・性格・誕生日や記念日・メモを記録するアプリです。

- Next.js（App Router）
- Supabase（メールアドレスとパスワードの認証、Postgres）
- Vercel にデプロイ

## セットアップ

### 1. Supabase

1. [Supabase](https://supabase.com) でプロジェクトを作成します。
2. データベースの定義は、複数のアプリで共有する [uebahide/supabase-db](https://github.com/uebahide/supabase-db) で管理しています。そちらの README の手順でマイグレーションを適用してください（このアプリは `oshi` スキーマの `oshis` テーブルを使います）。
   - Settings > Data API の Exposed schemas に `oshi` と `core` を追加します。
3. Authentication > Sign In / Providers > Email で「Confirm email」をオフにします（登録してすぐログインできるようにするため。オンのままだと確認メールのリンクを開くまでログインできません）。
4. Settings > API から Project URL と anon（または publishable）キーを控えます。

### 2. ローカルで動かす

```bash
cp .env.example .env.local   # 値を Supabase のものに書き換える
npm install
npm run dev
```

`.env.local` はプロジェクトのいちばん上（`package.json` と同じ場所）に置き、書き換えたら `npm run dev` を起動し直してください。キーは `NEXT_PUBLIC_SUPABASE_ANON_KEY` の代わりに `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` という名前でも読めます。

http://localhost:3000 を開き、「新規登録」からメールアドレスとパスワードを登録すると使えます。

### 3. Vercel

1. Vercel でこのリポジトリをインポートします（Framework は Next.js が自動で選ばれます）。
2. Environment Variables に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定してデプロイします。
3. 発行された URL を Supabase の Authentication > URL Configuration の Site URL に設定します（同じ Supabase を使う他のアプリがすでに Site URL を使っている場合は、Redirect URLs に追加します）。

## データの持ち方

- 1人の推しが `oshi.oshis` テーブルの1行です（Supabase は他のアプリと共有しているので、このアプリのテーブルはすべて `oshi` スキーマに置きます）。項目は `data`（jsonb）にまとめて入っています。
- アバター写真は 320px に縮小して `data.avatar` に入れています。
- 画面の「書き出し」で JSON にバックアップでき、「読み込み」で戻せます。
