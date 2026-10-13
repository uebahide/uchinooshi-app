import LoginForm from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="login">
      <h1 style={{ fontSize: "2rem", fontWeight: 900 }}>推しノート</h1>
      <p>大切な人のこと、ここに全部残そう。メールアドレスとパスワードでログインします。</p>
      {error === "link" && <p className="err">メールのリンクが無効か期限切れです。もう一度ログインしてください。</p>}
      <LoginForm />
    </main>
  );
}
