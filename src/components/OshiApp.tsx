"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Detail from "./Detail";
import Home from "./Home";
import Profile from "./Profile";
import { todayStr } from "@/lib/dates";
import { newOshi, normalize, sampleOshi } from "@/lib/oshi";
import { createClient } from "@/lib/supabase/client";
import type { Oshi } from "@/lib/types";

type Props = { initialOshis: Oshi[]; email: string; loadError: string | null };

const SAVE_DELAY = 700;

export default function OshiApp({ initialOshis, email, loadError }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [oshis, setOshis] = useState<Oshi[]>(initialOshis);
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [makerOpen, setMakerOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(loadError ? "読み込みに失敗しました。ページを開き直してください" : null);
  const [saving, setSaving] = useState(0);

  const latest = useRef(oshis);
  latest.current = oshis;
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2400);
  }, []);

  // 同じ推しへの保存と削除は1つずつ順番に送る（古い保存が削除のあとに届いて復活しないように）
  const inflight = useRef(new Map<string, Promise<void>>());
  const deleted = useRef(new Set<string>());

  const enqueue = useCallback((id: string, job: () => Promise<void>) => {
    const next = (inflight.current.get(id) ?? Promise.resolve()).then(job, job);
    inflight.current.set(id, next);
    next.finally(() => {
      if (inflight.current.get(id) === next) inflight.current.delete(id);
    });
    return next;
  }, []);

  const flush = useCallback(
    (id: string) => {
      timers.current.delete(id);
      return enqueue(id, async () => {
        if (deleted.current.has(id)) return;
        const o = latest.current.find((x) => x.id === id);
        if (!o) return;
        const { id: _id, ...data } = o;
        setSaving((n) => n + 1);
        const { error } = await supabase.from("oshis").upsert({ id, data });
        setSaving((n) => n - 1);
        if (error) toast("保存できませんでした。通信状態を確認してください");
      });
    },
    [enqueue, supabase, toast],
  );

  const scheduleSave = useCallback(
    (id: string, delay = SAVE_DELAY) => {
      const t = timers.current.get(id);
      if (t) clearTimeout(t);
      timers.current.set(id, setTimeout(() => flush(id), delay));
    },
    [flush],
  );

  // ページを離れる前に、まだ保存していない変更を送る
  useEffect(() => {
    const onHide = () => {
      for (const [id, t] of timers.current) {
        clearTimeout(t);
        flush(id);
      }
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, [flush]);

  // 戻るボタンで一覧（編集中なら詳細カード）に戻れるように、開いている推しを履歴に残す
  useEffect(() => {
    const onPop = () => {
      const p = new URLSearchParams(location.search);
      setOpenId(p.get("oshi"));
      setEditing(p.has("edit"));
    };
    onPop();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const open = (id: string | null, edit = false, maker = false) => {
    setMakerOpen(maker);
    setOpenId(id);
    setEditing(edit);
    history.pushState(null, "", id ? `?oshi=${id}${edit ? "&edit" : ""}` : location.pathname);
    window.scrollTo(0, 0);
  };

  // 編集を終えたら詳細カードへ。編集画面へは詳細カードから来たときだけ履歴を戻る
  const finishEdit = () => {
    if (history.state?.fromProfile) history.back();
    else {
      setEditing(false);
      history.replaceState(null, "", `?oshi=${openId}`);
      window.scrollTo(0, 0);
    }
  };

  const startEdit = () => {
    setEditing(true);
    history.pushState({ fromProfile: true }, "", `?oshi=${openId}&edit`);
    window.scrollTo(0, 0);
  };

  const update = useCallback(
    (id: string) => (fn: (o: Oshi) => void) => {
      setOshis((list) =>
        list.map((o) => {
          if (o.id !== id) return o;
          const next = structuredClone(o);
          fn(next);
          next.updatedAt = Date.now();
          return next;
        }),
      );
      scheduleSave(id);
    },
    [scheduleSave],
  );

  const add = (o: Oshi, openIt: boolean) => {
    setOshis((list) => [...list, o]);
    latest.current = [...latest.current, o];
    scheduleSave(o.id, 0);
    if (openIt) open(o.id, true, true);
  };

  const remove = async (id: string) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
    deleted.current.add(id);
    setOshis((list) => list.filter((o) => o.id !== id));
    open(null);
    let failed = false;
    await enqueue(id, async () => {
      const { error } = await supabase.from("oshis").delete().eq("id", id);
      failed = !!error;
    });
    toast(failed ? "削除できませんでした" : "削除しました");
  };

  const exportData = () => {
    const json = JSON.stringify({ app: "oshi-note", version: 1, exportedAt: new Date().toISOString(), oshis }, null, 2);
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `推しノート_${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      const list: unknown = Array.isArray(parsed) ? parsed : parsed?.oshis;
      if (!Array.isArray(list)) throw new Error();
      const incoming = list
        .filter((r): r is Partial<Oshi> => !!r && typeof r === "object")
        .map((r) => normalize({ ...r, id: typeof r.id === "string" && /^[0-9a-f-]{36}$/i.test(r.id) ? r.id : newOshi().id }));
      setOshis((cur) => {
        const map = new Map(cur.map((o) => [o.id, o]));
        incoming.forEach((o) => map.set(o.id, o));
        const merged = [...map.values()];
        latest.current = merged;
        return merged;
      });
      incoming.forEach((o) => scheduleSave(o.id, 0));
      toast(`${incoming.length}人分を読み込みました`);
    } catch {
      toast("推しノートで書き出したファイルを選んでください");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  const current = openId ? oshis.find((o) => o.id === openId) : undefined;

  return (
    <div className="wrap">
      <header className="top">
        <div className="brand">
          <h1>推しノート</h1>
          <small>{saving > 0 ? "保存中…" : "自動保存"}</small>
        </div>
        <div className="row">
          {current && editing ? (
            <button className="btn primary" onClick={finishEdit}>✓ 完了</button>
          ) : current ? (
            <button className="btn ghost" onClick={() => open(null)}>← 一覧へ</button>
          ) : (
            <>
              <button className="btn primary" data-act="add" onClick={() => add(newOshi(), true)}>＋ 推しを追加</button>
              <button className="btn sm ghost" onClick={signOut} title={email}>ログアウト</button>
            </>
          )}
        </div>
      </header>

      {current && !editing ? (
        <Profile key={current.id} o={current} onEdit={startEdit} />
      ) : current ? (
        <Detail key={current.id} o={current} update={update(current.id)} onDelete={() => remove(current.id)} makerOpen={makerOpen} setMakerOpen={setMakerOpen} toast={toast} />
      ) : (
        <Home
          oshis={oshis}
          onOpen={(id) => open(id)}
          onAdd={() => add(newOshi(), true)}
          onSample={() => { add(sampleOshi(), false); toast("サンプルを追加しました"); }}
          onExport={exportData}
          onImport={importData}
        />
      )}

      {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
    </div>
  );
}
