import { COLORS } from "./constants";
import { randomLook } from "./face";
import type { AvatarMode, Oshi } from "./types";

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

export function newOshi(partial: Partial<Oshi> = {}): Oshi {
  const now = Date.now();
  return {
    id: uid(),
    name: "",
    relation: "アイドル",
    color: COLORS[Math.floor(Math.random() * 8)],
    avMode: "face",
    look: randomLook(),
    avatar: "",
    glyph: "",
    birthday: { y: null, m: null, d: null },
    dates: [],
    likes: [],
    dislikes: [],
    personality: "",
    custom: [],
    notes: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

/** DB から読んだ値や読み込んだ JSON を、欠けた項目を補って Oshi にする */
export function normalize(raw: Partial<Oshi> & { id: string }): Oshi {
  const base = newOshi({ look: null, avMode: "glyph" });
  return { ...base, ...raw, look: raw.look ?? null, avMode: raw.avMode ?? (raw.avatar ? "photo" : raw.look ? "face" : "glyph") };
}

/** 実際に表示するアバターの種類（写真モードなのに写真が無い、などを補正） */
export function avMode(o: Oshi): AvatarMode {
  const m = o.avMode;
  if (m === "photo" && !o.avatar) return o.look ? "face" : "glyph";
  if (m === "face" && !o.look) return "glyph";
  return m;
}

export function sampleOshi(): Oshi {
  return newOshi({
    name: "星野ひかり",
    relation: "アイドル",
    color: "#8a5cf5",
    glyph: "🌙",
    sample: true,
    avMode: "face",
    look: { skin: "#fde6d4", hair: "#4a2f24", back: "long", bangs: "pattsun", eyes: "kira", eyeColor: "#8a5cf5", mouth: "smile", acc: "ribbon", blush: "1", outfit: "" },
    birthday: { y: 2003, m: 11, d: 3 },
    dates: [
      { id: uid(), label: "初めてライブに行った日", date: "2024-03-16" },
      { id: uid(), label: "デビュー記念日", date: "2021-07-07" },
    ],
    likes: ["いちごミルク", "猫", "夜の散歩", "90年代のシティポップ"],
    dislikes: ["トマト", "早起き", "ホラー映画"],
    personality: "人見知りだけど、話し始めると止まらない。ファンの名前をよく覚えている。落ち込むと甘いものを食べて元気になるタイプ。",
    custom: [
      { id: uid(), title: "メンバーカラー・呼び方", items: ["紫", "ひかりん"] },
      { id: uid(), title: "プレゼントの候補", items: ["猫モチーフの文具", "いちごのお菓子"] },
    ],
    notes: [{ id: uid(), date: "2026-09-20", text: "配信で「最近ギターを練習してる」って言ってた。次のツアーで弾くかも。" }],
  });
}

export function matches(o: Oshi, q: string) {
  if (!q) return true;
  return JSON.stringify([o.name, o.relation, o.likes, o.dislikes, o.personality, o.custom, o.notes]).toLowerCase().includes(q);
}

export function resizeImage(file: File, size = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = reject;
    r.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const s = Math.min(img.width, img.height);
        const c = document.createElement("canvas");
        c.width = c.height = size;
        c.getContext("2d")!.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        resolve(c.toDataURL("image/jpeg", 0.82));
      };
      img.src = r.result as string;
    };
    r.readAsDataURL(file);
  });
}
