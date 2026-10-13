import type { Birthday, Oshi } from "./types";

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** 次に m月d日 が来るまでの日数（今日なら0）。2/29 は平年なら 2/28 として扱う。 */
export function daysUntil(m: number | null, d: number | null, now = new Date()) {
  if (!m || !d) return null;
  const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const make = (y: number) => {
    const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    return new Date(y, m - 1, m === 2 && d === 29 && !leap ? 28 : d);
  };
  let next = make(t0.getFullYear());
  if (next < t0) next = make(t0.getFullYear() + 1);
  return { days: Math.round((next.getTime() - t0.getTime()) / 86400000), year: next.getFullYear() };
}

export const daysLabel = (n: number) => (n === 0 ? "今日！" : n === 1 ? "明日" : `あと${n}日`);
export const daysClass = (n: number) => (n === 0 ? "today" : n <= 14 ? "soon" : "");

export function parseDate(s: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
  return m ? { y: +m[1], m: +m[2], d: +m[3] } : null;
}

export function bdText(b: Birthday | undefined) {
  if (!b || !b.m || !b.d) return "";
  return `${b.y ? b.y + "年" : ""}${b.m}月${b.d}日`;
}

export type Upcoming = { o: Oshi; label: string; sub: string; days: number; year: number };

export function upcomingAll(oshis: Oshi[]): Upcoming[] {
  const out: Upcoming[] = [];
  for (const o of oshis) {
    const b = o.birthday;
    if (b && b.m && b.d) {
      const u = daysUntil(b.m, b.d)!;
      out.push({ o, label: "誕生日", sub: b.y ? `${u.year - b.y}歳になる` : bdText(b), ...u });
    }
    for (const e of o.dates || []) {
      const p = parseDate(e.date);
      if (!p) continue;
      const u = daysUntil(p.m, p.d)!;
      out.push({ o, label: e.label || "記念日", sub: u.year - p.y > 0 ? `${u.year - p.y}周年` : `${p.m}月${p.d}日`, ...u });
    }
  }
  return out.sort((a, b) => a.days - b.days);
}
