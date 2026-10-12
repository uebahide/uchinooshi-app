export type Look = {
  skin: string;
  hair: string;
  back: string;
  bangs: string;
  eyes: string;
  eyeColor: string;
  mouth: string;
  acc: string;
  blush: string; // "1" | ""
  outfit: string; // "" = 推し色と同じ
};

export type AvatarMode = "face" | "photo" | "glyph";

export type Birthday = { y: number | null; m: number | null; d: number | null };
export type SpecialDate = { id: string; label: string; date: string };
export type CustomSection = { id: string; title: string; items: string[] };
export type Note = { id: string; date: string; text: string };

export type Oshi = {
  id: string;
  name: string;
  relation: string;
  color: string;
  avMode: AvatarMode;
  look: Look | null;
  avatar: string; // 写真 (data URL)
  glyph: string;
  birthday: Birthday;
  dates: SpecialDate[];
  likes: string[];
  dislikes: string[];
  personality: string;
  custom: CustomSection[];
  notes: Note[];
  sample?: boolean;
  createdAt: number;
  updatedAt: number;
};
