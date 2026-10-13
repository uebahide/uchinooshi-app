# うちの推しアプリ（推しノート）

推しの似顔絵アバターを作って、好きなもの・苦手なもの・性格・誕生日や記念日・メモを記録するアプリです。

- Next.js（App Router）
- Supabase（メールのログインリンク認証、Postgres）
- Vercel にデプロイ

## セットアップ

### 1. Supabase

1. [Supabase](https://supabase.com) でプロジェクトを作成します。
2. SQL Editor で `supabase/migrations/0001_oshis.sql` を実行します（`oshis` テーブルと、本人だけが読み書きできる RLS を作ります）。
3. Authentication > URL Configuration で次を設定します。
   - Site URL: 本番の URL（例 `https://uchinooshi-app.vercel.app`）
   - Redirect URLs: `http://localhost:3000/auth/callback` と `https://<本番のドメイン>/auth/callback`
4. Settings > API から Project URL と anon（または publishable）キーを控えます。

### 2. ローカルで動かす

```bash
cp .env.example .env.local   # 値を Supabase のものに書き換える
npm install
npm run dev
```

`.env.local` はプロジェクトのいちばん上（`package.json` と同じ場所）に置き、書き換えたら `npm run dev` を起動し直してください。キーは `NEXT_PUBLIC_SUPABASE_ANON_KEY` の代わりに `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` という名前でも読めます。

http://localhost:3000 を開き、メールアドレスを入れて届いたリンクを同じブラウザで開くとログインできます。

### 3. Vercel

1. Vercel でこのリポジトリをインポートします（Framework は Next.js が自動で選ばれます）。
2. Environment Variables に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定してデプロイします。
3. 発行された URL を Supabase の Site URL / Redirect URLs に追加します。

## データの持ち方

- 1人の推しが `oshis` テーブルの1行です。項目は `data`（jsonb）にまとめて入っています。
- アバター写真は 320px に縮小して `data.avatar` に入れています。
- 画面の「書き出し」で JSON にバックアップでき、「読み込み」で戻せます。
