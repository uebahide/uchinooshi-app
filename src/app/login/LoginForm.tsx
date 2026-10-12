"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setState("error");
      setMessage(error.message);
    } else {
      setState("sent");
    }
  }

  if (state === "sent") {
    return <p>{email} にログイン用のリンクを送りました。このブラウザでメールのリンクを開いてください。</p>;
  }

  return (
    <form onSubmit={onSubmit}>
      <label className="label" htmlFor="email">メールアドレス</label>
      <input id="email" className="field" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      <button className="btn primary" disabled={state === "sending"} style={{ justifyContent: "center", padding: "10px 16px" }}>
        {state === "sending" ? "送信中…" : "ログインリンクを送る"}
      </button>
      {state === "error" && <p className="err">送れませんでした：{message}</p>}
    </form>
  );
}
