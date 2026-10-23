import Avatar from "./Avatar";
import { bdText, daysClass, daysLabel, daysUntil, parseDate } from "@/lib/dates";
import type { Oshi } from "@/lib/types";

type Props = { o: Oshi; onEdit: () => void };

/** 見るための詳細カード。書き込みは「編集する」から編集画面で行う */
export default function Profile({ o, onEdit }: Props) {
  const b = o.birthday;
  const u = b.m && b.d ? daysUntil(b.m, b.d) : null;
  const dates = o.dates
    .map((e) => {
      const p = parseDate(e.date);
      return { e, p, du: p ? daysUntil(p.m, p.d) : null };
    })
    .sort((a, c) => (a.du?.days ?? 999) - (c.du?.days ?? 999));
  const notes = [...o.notes].sort((a, c) => c.date.localeCompare(a.date));
  const custom = o.custom.filter((c) => c.title || c.items.length);
  const empty = !u && !dates.length && !o.likes.length && !o.dislikes.length && !o.personality.trim() && !custom.length && !notes.length;

  return (
    <article className="sheet profile" style={{ "--c": o.color } as React.CSSProperties}>
      <div className="phero">
        <button className="btn sm editbtn" onClick={onEdit}>✎ 編集する</button>
        <Avatar o={o} size="big" />
        <span className="prel">{o.relation}</span>
        <h2 className="pname">{o.name || "名前未設定"}</h2>
        {u && (
          <div className="pbd">
            <span>🎂 {bdText(b)}</span>
            <span className={`pill ${daysClass(u.days)}`}>{daysLabel(u.days)}{b.y ? `で${u.year - b.y}歳` : ""}</span>
          </div>
        )}
      </div>

      {o.sample && <div className="banner pbanner">これはサンプルです。「編集する」から自由に書き換えられます。</div>}

      {empty ? (
        <div className="pempty">
          <p>まだ何も書かれていません。好きなものや誕生日を書き込んでみましょう。</p>
          <button className="btn primary" onClick={onEdit}>✎ 書き込む</button>
        </div>
      ) : (
        <div className="pbody">
          {o.personality.trim() && (
            <section className="pcard wide">
              <h3>性格</h3>
              <p className="quote">{o.personality}</p>
            </section>
          )}
          {o.likes.length > 0 && (
            <section className="pcard">
              <h3>♡ 好きなもの</h3>
              <div className="chips">{o.likes.map((x, i) => <span key={i} className="chip like">{x}</span>)}</div>
            </section>
          )}
          {o.dislikes.length > 0 && (
            <section className="pcard">
              <h3>✕ 苦手なもの</h3>
              <div className="chips">{o.dislikes.map((x, i) => <span key={i} className="chip">{x}</span>)}</div>
            </section>
          )}
          {dates.length > 0 && (
            <section className="pcard">
              <h3>記念日</h3>
              <ul className="plist">
                {dates.map(({ e, p, du }) => (
                  <li key={e.id}>
                    <div><b>{e.label}</b><small>{p ? `${p.y}.${p.m}.${p.d}` : ""}{p && du && du.year - p.y > 0 ? ` ・ ${du.year - p.y}周年` : ""}</small></div>
                    {du && <span className={`days ${daysClass(du.days)}`}>{daysLabel(du.days)}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {custom.map((c) => (
            <section key={c.id} className="pcard">
              <h3>{c.title || "項目"}</h3>
              <div className="chips">{c.items.map((x, i) => <span key={i} className="chip">{x}</span>)}</div>
            </section>
          ))}
          {notes.length > 0 && (
            <section className="pcard wide">
              <h3>メモ・できごと</h3>
              <ol className="timeline">
                {notes.map((n) => (
                  <li key={n.id}><time>{n.date.replaceAll("-", ".")}</time><p>{n.text}</p></li>
                ))}
              </ol>
            </section>
          )}
        </div>
      )}
    </article>
  );
}
