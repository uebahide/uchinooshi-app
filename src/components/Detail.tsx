"use client";

import { useRef, useState } from "react";
import Avatar from "./Avatar";
import AvatarMaker from "./AvatarMaker";
import { COLORS, RELATIONS } from "@/lib/constants";
import { daysClass, daysLabel, daysUntil, parseDate, todayStr } from "@/lib/dates";
import { resizeImage, uid } from "@/lib/oshi";
import type { Oshi } from "@/lib/types";

type Props = {
  o: Oshi;
  update: (fn: (o: Oshi) => void) => void;
  onDelete: () => void;
  makerOpen: boolean;
  setMakerOpen: (v: boolean) => void;
  toast: (msg: string) => void;
};

function ChipsEditor({ items, cls, onAdd, onRemove, inputId }: { items: string[]; cls: string; onAdd: (v: string) => void; onRemove: (i: number) => void; inputId: string }) {
  const [v, setV] = useState("");
  return (
    <>
      <div className="chips">
        {items.length ? (
          items.map((x, i) => (
            <span key={i} className={`chip ${cls}`}>
              {x}
              <button aria-label={`${x}を削除`} onClick={() => onRemove(i)}>×</button>
            </span>
          ))
        ) : (
          <span className="status">まだありません</span>
        )}
      </div>
      <form
        className="adder"
        onSubmit={(e) => {
          e.preventDefault();
          const t = v.trim();
          if (!t) return;
          onAdd(t);
          setV("");
        }}
      >
        <input className="field" id={inputId} placeholder="入力して Enter" autoComplete="off" value={v} onChange={(e) => setV(e.target.value)} />
        <button className="btn sm">追加</button>
      </form>
    </>
  );
}

export default function Detail({ o, update, onDelete, makerOpen, setMakerOpen, toast }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dLabel, setDLabel] = useState("");
  const [dDate, setDDate] = useState("");
  const [nText, setNText] = useState("");
  const [nDate, setNDate] = useState(todayStr());
  const fileRef = useRef<HTMLInputElement>(null);

  const b = o.birthday;
  const u = b.m && b.d ? daysUntil(b.m, b.d) : null;
  const sheetStyle = { "--c": o.color } as React.CSSProperties;

  async function onPhoto(file: File) {
    try {
      const url = await resizeImage(file, 320);
      update((x) => { x.avatar = url; x.avMode = "photo"; });
      toast("写真を設定しました");
    } catch {
      toast("この画像は読み込めませんでした。JPEG か PNG を選んでください");
    }
  }

  return (
    <article className="sheet" style={sheetStyle}>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) onPhoto(f); }} />
      <div className="hero">
        <div className="avtools">
          <Avatar o={o} size="big" />
        </div>
        <div className="meta">
          {o.sample && <div className="banner">これはサンプルです。自由に書き換えたり、下の「この推しを削除」で消したりできます。</div>}
          <input className="namein" id="f-name" value={o.name} placeholder="名前を入力" aria-label="名前" onChange={(e) => update((x) => { x.name = e.target.value; })} />
          <div className="row">
            <select className="field" id="f-rel" aria-label="関係" value={o.relation} onChange={(e) => update((x) => { x.relation = e.target.value; })}>
              {RELATIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <span className="label">推し色</span>
            <div className="swatches left" style={{ marginTop: 4 }}>
              {COLORS.map((c) => (
                <button key={c} className="sw" style={{ "--s": c } as React.CSSProperties} aria-label={`色 ${c}`} aria-pressed={o.color === c} onClick={() => update((x) => { x.color = c; })} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <AvatarMaker o={o} open={makerOpen} onToggle={setMakerOpen} update={update} onPickPhoto={() => fileRef.current?.click()} />

      <div className="body">
        <section className="sec">
          <h2>
            誕生日 {u && <span className={`days ${daysClass(u.days)}`}>{daysLabel(u.days)}</span>}
          </h2>
          <div className="row">
            <input className="field" id="f-by" type="number" inputMode="numeric" placeholder="年（任意）" style={{ width: "7.5em" }} aria-label="生まれた年"
              value={b.y ?? ""} onChange={(e) => { const v = parseInt(e.target.value, 10); update((x) => { x.birthday = { ...x.birthday, y: Number.isFinite(v) ? v : null }; }); }} />
            <select className="field" id="f-bm" aria-label="月" value={b.m ?? ""} onChange={(e) => update((x) => { x.birthday = { ...x.birthday, m: e.target.value ? +e.target.value : null }; })}>
              <option value="">月</option>
              {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}月</option>)}
            </select>
            <select className="field" id="f-bd" aria-label="日" value={b.d ?? ""} onChange={(e) => update((x) => { x.birthday = { ...x.birthday, d: e.target.value ? +e.target.value : null }; })}>
              <option value="">日</option>
              {Array.from({ length: 31 }, (_, i) => <option key={i} value={i + 1}>{i + 1}日</option>)}
            </select>
          </div>
          {u && b.y && <span className="status">次の誕生日で {u.year - b.y} 歳</span>}
        </section>

        <section className="sec">
          <h2>記念日</h2>
          <div className="list">
            {o.dates.length ? (
              o.dates.map((e) => {
                const p = parseDate(e.date);
                const du = p ? daysUntil(p.m, p.d) : null;
                return (
                  <div key={e.id} className="drow">
                    <div><b>{e.label}</b> <span className="status">{p ? `${p.y}/${p.m}/${p.d}` : ""}</span></div>
                    <span className={`days ${du ? daysClass(du.days) : ""}`}>{du ? daysLabel(du.days) : ""}</span>
                    <button className="xbtn" aria-label={`${e.label}を削除`} onClick={() => update((x) => { x.dates = x.dates.filter((d) => d.id !== e.id); })}>×</button>
                  </div>
                );
              })
            ) : (
              <span className="status">付き合った日、初めて会った日、デビュー日など</span>
            )}
          </div>
          <form className="row" onSubmit={(e) => {
            e.preventDefault();
            const l = dLabel.trim();
            if (!l || !dDate) return;
            update((x) => { x.dates = [...x.dates, { id: uid(), label: l, date: dDate }]; });
            setDLabel(""); setDDate("");
          }}>
            <input className="field" id="d-label" placeholder="名前（例：初デート）" style={{ flex: "1 1 140px" }} required value={dLabel} onChange={(e) => setDLabel(e.target.value)} />
            <input className="field" id="d-date" type="date" required value={dDate} onChange={(e) => setDDate(e.target.value)} />
            <button className="btn sm">追加</button>
          </form>
        </section>

        <section className="sec">
          <h2>好きなもの</h2>
          <ChipsEditor inputId="add-likes" items={o.likes} cls="like" onAdd={(v) => update((x) => { x.likes = [...x.likes, v]; })} onRemove={(i) => update((x) => { x.likes = x.likes.filter((_, j) => j !== i); })} />
        </section>
        <section className="sec">
          <h2>苦手なもの・嫌いなもの</h2>
          <ChipsEditor inputId="add-dislikes" items={o.dislikes} cls="" onAdd={(v) => update((x) => { x.dislikes = [...x.dislikes, v]; })} onRemove={(i) => update((x) => { x.dislikes = x.dislikes.filter((_, j) => j !== i); })} />
        </section>

        <section className="sec full">
          <h2>性格</h2>
          <textarea className="field" id="f-pers" placeholder="どんな人？ 口ぐせ、喜ぶこと、落ち込んだときのこと…" value={o.personality} onChange={(e) => update((x) => { x.personality = e.target.value; })} />
        </section>

        <section className="sec full">
          <h2>
            自由な項目
            <button className="btn sm" onClick={() => update((x) => { x.custom = [...x.custom, { id: uid(), title: "", items: [] }]; })}>＋ 項目を追加</button>
          </h2>
          {!o.custom.length && <span className="status">「服のサイズ」「好きな食べ物の店」「プレゼント履歴」など、自分で項目を作れます。</span>}
          <div className="grid customs" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
            {o.custom.map((c) => (
              <div key={c.id} className="custom">
                <div className="row" style={{ flexWrap: "nowrap" }}>
                  <input className="ttl" id={`ct-${c.id}`} value={c.title} placeholder="項目名" aria-label="項目名"
                    onChange={(e) => update((x) => { x.custom = x.custom.map((y) => (y.id === c.id ? { ...y, title: e.target.value } : y)); })} />
                  <button className="xbtn" aria-label="項目を削除" onClick={() => update((x) => { x.custom = x.custom.filter((y) => y.id !== c.id); })}>×</button>
                </div>
                <ChipsEditor inputId={`ci-${c.id}`} items={c.items} cls=""
                  onAdd={(v) => update((x) => { x.custom = x.custom.map((y) => (y.id === c.id ? { ...y, items: [...y.items, v] } : y)); })}
                  onRemove={(i) => update((x) => { x.custom = x.custom.map((y) => (y.id === c.id ? { ...y, items: y.items.filter((_, j) => j !== i) } : y)); })} />
              </div>
            ))}
          </div>
        </section>

        <section className="sec full">
          <h2>メモ・できごと</h2>
          <form className="row" style={{ alignItems: "flex-start" }} onSubmit={(e) => {
            e.preventDefault();
            const t = nText.trim();
            if (!t) return;
            update((x) => { x.notes = [...x.notes, { id: uid(), date: nDate || todayStr(), text: t }]; });
            setNText("");
            toast("メモを残しました");
          }}>
            <textarea className="field" id="n-text" placeholder="今日話したこと、言ってたこと、覚えておきたいこと" style={{ minHeight: 60, flex: "1 1 260px" }} required value={nText} onChange={(e) => setNText(e.target.value)} />
            <div className="row" style={{ flexDirection: "column", alignItems: "stretch" }}>
              <input className="field" id="n-date" type="date" value={nDate} onChange={(e) => setNDate(e.target.value)} />
              <button className="btn sm primary">メモを残す</button>
            </div>
          </form>
          <div className="list">
            {[...o.notes].sort((a, c) => c.date.localeCompare(a.date)).map((n) => (
              <div key={n.id} className="note">
                <div><time>{n.date}</time><p>{n.text}</p></div>
                <button className="xbtn" aria-label="メモを削除" onClick={() => update((x) => { x.notes = x.notes.filter((y) => y.id !== n.id); })}>×</button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="foot">
        <span className="status">最終更新 {new Date(o.updatedAt).toLocaleString("ja-JP", { dateStyle: "medium", timeStyle: "short" })}</span>
        {confirmDelete ? (
          <div className="confirm">
            「{o.name || "この推し"}」の記録をすべて削除します。
            <button className="btn sm danger" onClick={onDelete}>削除する</button>
            <button className="btn sm" onClick={() => setConfirmDelete(false)}>やめる</button>
          </div>
        ) : (
          <button className="btn sm danger" onClick={() => setConfirmDelete(true)}>この推しを削除</button>
        )}
      </div>
    </article>
  );
}
