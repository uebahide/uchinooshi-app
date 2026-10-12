"use client";

import { useState } from "react";
import Avatar from "./Avatar";
import { daysClass, daysLabel, daysUntil, upcomingAll } from "@/lib/dates";
import { matches, sampleOshi } from "@/lib/oshi";
import type { Oshi } from "@/lib/types";

function Card({ o, onOpen }: { o: Oshi; onOpen?: () => void }) {
  const u = o.birthday?.m ? daysUntil(o.birthday.m, o.birthday.d) : null;
  const inner = (
    <>
      {o.sample && <span className="sample-tag">サンプル</span>}
      <Avatar o={o} />
      <h3>{o.name || "名前未設定"}</h3>
      <div className="rel">{o.relation}</div>
      {u && (
        <div className="bd">
          🎂 {o.birthday.m}/{o.birthday.d} ・ <span className={daysClass(u.days)}>{daysLabel(u.days)}</span>
        </div>
      )}
      {o.likes.length > 0 && (
        <div className="chips">
          {o.likes.slice(0, 3).map((l, i) => (
            <span key={i} className="chip like">{l}</span>
          ))}
        </div>
      )}
    </>
  );
  const style = { "--c": o.color } as React.CSSProperties;
  return onOpen ? (
    <button className="card" style={style} onClick={onOpen}>{inner}</button>
  ) : (
    <div className="card" style={style}>{inner}</div>
  );
}

type Props = {
  oshis: Oshi[];
  onOpen: (id: string) => void;
  onAdd: () => void;
  onSample: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
};

export default function Home({ oshis, onOpen, onAdd, onSample, onExport, onImport }: Props) {
  const [q, setQ] = useState("");

  if (!oshis.length) {
    return (
      <section className="empty">
        <div>
          <h2>大切な人のこと、ここに全部残そう</h2>
          <p>
            推しを追加して、似顔絵アバターと推し色を決めたら、好きなもの・苦手なもの・性格・誕生日や記念日を書き込んでいきます。誕生日や記念日はトップに「あと何日」で並びます。
          </p>
          <div className="row">
            <button className="btn primary" onClick={onAdd}>＋ 最初の推しを追加</button>
            <button className="btn" onClick={onSample}>サンプルを入れて試す</button>
          </div>
        </div>
        <Card o={sampleOshi()} />
      </section>
    );
  }

  const up = upcomingAll(oshis).slice(0, 5);
  const query = q.trim().toLowerCase();
  const list = oshis.filter((o) => matches(o, query));

  return (
    <>
      {up.length > 0 && (
        <section className="upcoming">
          <span className="label">次の大切な日</span>
          <div className="uplist">
            {up.map((e, i) => (
              <button key={i} className="uprow" onClick={() => onOpen(e.o.id)}>
                <Avatar o={e.o} size="sm" />
                <div className="what">
                  <b>{e.o.name || "名前未設定"}の{e.label}</b>
                  <span>{e.sub}</span>
                </div>
                <span className={`days ${daysClass(e.days)}`}>{daysLabel(e.days)}</span>
              </button>
            ))}
          </div>
        </section>
      )}
      <button className="btn primary fab" onClick={onAdd}>＋ 推しを追加</button>
      <div className="toolbar">
        <input className="search" id="q" type="search" placeholder="名前・好きなもの・メモから探す" value={q} onChange={(e) => setQ(e.target.value)} aria-label="検索" />
        <button className="btn sm" onClick={onExport}>書き出し</button>
        <label className="btn sm" style={{ cursor: "pointer" }}>
          読み込み
          <input type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) onImport(f); }} />
        </label>
      </div>
      {list.length ? (
        <section className="grid">
          {list.map((o) => (
            <Card key={o.id} o={o} onOpen={() => onOpen(o.id)} />
          ))}
        </section>
      ) : (
        <p className="status">「{q}」に当てはまる推しはいません。</p>
      )}
    </>
  );
}
