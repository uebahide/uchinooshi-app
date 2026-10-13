"use client";

import { COLORS, GLYPHS } from "@/lib/constants";
import { EYECOLORS, faceSVG, HAIRS, LOOK_OPTS, randomLook, SKINS } from "@/lib/face";
import type { AvatarMode, Look, Oshi } from "@/lib/types";

type Props = {
  o: Oshi;
  open: boolean;
  onToggle: (open: boolean) => void;
  update: (fn: (o: Oshi) => void) => void;
  onPickPhoto: () => void;
};

const TABS: [AvatarMode, string][] = [["face", "似顔絵"], ["photo", "写真"], ["glyph", "絵文字・頭文字"]];

export default function AvatarMaker({ o, open, onToggle, update, onPickPhoto }: Props) {
  const L = o.look ?? randomLook();
  const mode = o.avMode;

  const setLook = (key: keyof Look, v: string) =>
    update((x) => {
      x.look = { ...(x.look ?? randomLook()), [key]: v };
      x.avMode = "face";
    });

  const options = (k: keyof typeof LOOK_OPTS, label: string) => (
    <div className="mrow" key={label}>
      <span className="label">{label}</span>
      <div className="opts">
        {LOOK_OPTS[k].map(([v, t]) => (
          <button key={v} className="opt" aria-pressed={(L[k] || "") === v} aria-label={t} onClick={() => setLook(k, v)}>
            <span className="mini" dangerouslySetInnerHTML={{ __html: faceSVG({ ...L, [k]: v }, o.color) }} />
            <span>{t}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const swatches = (k: keyof Look, label: string, list: string[], sameAsOshi = false) => (
    <div className="mrow" key={label}>
      <span className="label">{label}</span>
      <div className="swatches left">
        {sameAsOshi && (
          <button className="sw same" aria-pressed={!L[k]} aria-label="推し色と同じ" onClick={() => setLook(k, "")}>推し色</button>
        )}
        {list.map((c) => (
          <button key={c} className="sw" style={{ "--s": c } as React.CSSProperties} aria-pressed={L[k] === c} aria-label={`${label} ${c}`} onClick={() => setLook(k, c)} />
        ))}
      </div>
    </div>
  );

  return (
    <details className="maker" open={open} onToggle={(e) => onToggle((e.target as HTMLDetailsElement).open)}>
      <summary>アバターを作る・変える</summary>
      <div className="mbody">
        <div className="tabs" role="group" aria-label="アバターの種類">
          {TABS.map(([m, t]) => (
            <button
              key={m}
              className="tab"
              aria-pressed={mode === m}
              onClick={() => {
                update((x) => {
                  x.avMode = m;
                  if (m === "face" && !x.look) x.look = randomLook();
                });
                if (m === "photo" && !o.avatar) onPickPhoto();
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {mode === "face" && (
          <>
            <div className="mgrid">
              {swatches("skin", "肌の色", SKINS)}
              {swatches("hair", "髪の色", HAIRS)}
              {options("back", "髪の長さ・髪型")}
              {options("bangs", "前髪")}
              {options("eyes", "目の形")}
              {swatches("eyeColor", "目の色", EYECOLORS)}
              {options("mouth", "口")}
              {options("acc", "アクセサリー")}
              {options("blush", "ほっぺ")}
              {swatches("outfit", "服の色", COLORS, true)}
            </div>
            <div className="row">
              <button className="btn sm" onClick={() => update((x) => { x.look = { ...randomLook(), outfit: x.look?.outfit ?? "" }; x.avMode = "face"; })}>
                おまかせで作る
              </button>
            </div>
          </>
        )}

        {mode === "photo" && (
          <div className="row">
            <button className="btn sm primary" onClick={onPickPhoto}>{o.avatar ? "写真を変える" : "写真を選ぶ"}</button>
            {o.avatar && (
              <button className="btn sm ghost" onClick={() => update((x) => { x.avatar = ""; x.avMode = x.look ? "face" : "glyph"; })}>
                写真を外す
              </button>
            )}
            <span className="status">正方形に切り抜いて保存します</span>
          </div>
        )}

        {mode === "glyph" && (
          <div className="glyphs left">
            {GLYPHS.map((g) => (
              <button key={g || "initial"} aria-pressed={(o.glyph || "") === g} aria-label={g || "頭文字"} onClick={() => update((x) => { x.glyph = g; x.avMode = "glyph"; })}>
                {g || (o.name || "？").charAt(0)}
              </button>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}
