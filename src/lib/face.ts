import type { Look } from "./types";

// 人型アバター。パーツの組み合わせから 120x120 の SVG 文字列を作る。
export const SKINS = ["#fde6d4","#f7d0b0","#eab48c","#cf9168","#9c6646","#6b4430"];
export const HAIRS = ["#1f1a1c","#4a2f24","#8b5a3c","#d9a05b","#f0d58f","#c9c9d6","#e874a6","#6a7de8","#8a5cf5","#d8453c","#4fae8a"];
export const EYECOLORS = ["#2b1d16","#6b4226","#3c6fd8","#3f9b6b","#8a5cf5","#d0436e","#b8862e"];
export const LOOK_OPTS: Record<"back" | "bangs" | "eyes" | "mouth" | "acc" | "blush", [string, string][]> = {
  back:  [["short","ショート"],["bob","ボブ"],["medium","ミディアム"],["long","ロング"],["twin","ツインテール"],["pony","ポニーテール"],["bun","お団子"]],
  bangs: [["pattsun","ぱっつん"],["side","横流し"],["center","センター分け"],["choppy","ギザギザ"],["up","おでこ出し"]],
  eyes:  [["maru","まる"],["kira","キラキラ"],["tare","たれ目"],["tsuri","つり目"],["niko","にっこり"],["cool","切れ長"]],
  mouth: [["smile","にこっ"],["open","口あけ"],["small","ちょこん"],["cat","ω"],["flat","むっ"]],
  acc:   [["none","なし"],["glasses","メガネ"],["ribbon","リボン"],["pin","ヘアピン"],["cat","ネコミミ"],["earring","ピアス"]],
  blush: [["1","あり"],["","なし"]],
};
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random()*a.length)];
export function randomLook(): Look {
  return {skin:pick(SKINS.slice(0,4)), hair:pick(HAIRS), back:pick(LOOK_OPTS.back)[0], bangs:pick(LOOK_OPTS.bangs)[0],
    eyes:pick(LOOK_OPTS.eyes)[0], eyeColor:pick(EYECOLORS), mouth:pick(LOOK_OPTS.mouth.slice(0,4))[0], acc:"none", blush:"1", outfit:""};
}
const HEX = /^#[0-9a-f]{3,8}$/i;
const safe = (c: string | undefined, fallback: string) => (c && HEX.test(c) ? c : fallback);

export function faceSVG(L: Look, oshiColor: string): string {
  const color = safe(oshiColor, "#ff6fa8");
  const s = safe(L.skin, SKINS[0]), h = safe(L.hair, HAIRS[1]), ec = safe(L.eyeColor, EYECOLORS[0]), out = safe(L.outfit, color);
  const shade=`fill:color-mix(in srgb, ${s} 80%, #6b2f1c)`, hd=`color-mix(in srgb, ${h} 65%, black)`;
  const ink="#2a1f24";
  const mir = (inner: string) => `<g transform="translate(120 0) scale(-1 1)">${inner}</g>`;
  const both = (inner: string) => inner + mir(inner);
  // back hair mass (behind body)
  const crown = `<ellipse cx="60" cy="50" rx="28.5" ry="29" fill="${h}"/>`;
  let back = crown, locks = "";
  switch(L.back){
    case "bob": back = `<path d="M31 50 C31 20 89 20 89 50 L90 80 C80 87 40 87 30 80 Z" fill="${h}"/>`; break;
    case "medium": back = `<path d="M31 50 C31 20 89 20 89 50 L90 84 C80 90 40 90 30 84 Z" fill="${h}"/>`;
      locks = both(`<path d="M32 54 C29 72 30 88 33 100 C37 102 42 101 45 98 C41 86 39 72 39 58 Z" fill="${h}"/>`); break;
    case "long": back = `<path d="M30 50 C30 18 90 18 90 50 L94 112 C80 118 40 118 26 112 Z" fill="${h}"/>`;
      locks = both(`<path d="M32 54 C28 76 28 100 31 120 L46 120 C42 100 39 76 39 58 Z" fill="${h}"/>`); break;
    case "twin": locks = both(`<path d="M30 46 C14 54 12 92 22 112 C26 104 30 96 32 84 C34 70 34 58 34 50 Z" fill="${h}"/><circle cx="31" cy="47" r="3.4" fill="${out}"/>`); break;
    case "pony": back = crown + `<path d="M84 36 C104 40 104 78 96 100 C92 88 88 70 80 52 Z" fill="${h}"/>`; break;
    case "bun": back = crown + `<circle cx="60" cy="20" r="11" fill="${h}"/>`; break;
  }
  if(L.acc==="cat") back = both(`<path d="M35 38 L37 12 L56 28 Z" fill="${h}"/><path d="M38.5 32 L39.5 18 L50 27 Z" fill="#f4a3b8"/>`) + back;
  const body = `<path d="M14 120 C16 100 34 90 60 90 C86 90 104 100 106 120 Z" fill="${out}"/><path d="M50 90.5 L60 101 L70 90.5" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="2"/>`;
  const neck = `<rect x="52" y="74" width="16" height="18" rx="4" fill="${s}"/><rect x="52" y="78" width="16" height="5" style="${shade}" opacity=".55"/>`;
  const ears = both(`<ellipse cx="35.5" cy="58" rx="4.5" ry="6.5" fill="${s}"/><ellipse cx="36" cy="58" rx="2" ry="3.5" style="${shade}" opacity=".6"/>`);
  const head = `<ellipse cx="60" cy="55" rx="25" ry="28" fill="${s}"/>`;
  const blush = L.blush ? both(`<ellipse cx="44" cy="66" rx="5" ry="2.6" fill="#ff6f91" opacity=".35"/>`) : "";
  let eyes: string;
  const ball = (rx: number, ry: number) => both(`<ellipse cx="50" cy="59" rx="${rx}" ry="${ry}" fill="${ec}"/><ellipse cx="50" cy="${59+ry*.25}" rx="${rx*.55}" ry="${ry*.5}" fill="${ink}" opacity=".55"/><circle cx="${50-rx*.35}" cy="${59-ry*.38}" r="${rx*.36}" fill="#fff"/>`);
  switch(L.eyes){
    case "kira": eyes = ball(4.6,5.6) + both(`<circle cx="51.6" cy="61.4" r=".9" fill="#fff"/><path d="M44.5 54.5 Q50 51.5 55.5 54" fill="none" stroke="${ink}" stroke-width="1.8" stroke-linecap="round"/>`); break;
    case "tare": eyes = ball(3.6,4.2) + both(`<path d="M45 57 Q50 52.5 55 54.5" fill="none" stroke="${ink}" stroke-width="1.7" stroke-linecap="round"/>`); break;
    case "tsuri": eyes = ball(3.6,4.2) + both(`<path d="M45 54 Q50 53 55 56.5" fill="none" stroke="${ink}" stroke-width="1.7" stroke-linecap="round"/>`); break;
    case "niko": eyes = both(`<path d="M45.5 60 Q50 54.5 54.5 60" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`); break;
    case "cool": eyes = both(`<path d="M45 59 Q50 56 55.5 58.5" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/><ellipse cx="50.5" cy="59.5" rx="2.6" ry="1.8" fill="${ec}"/>`); break;
    default: eyes = ball(3.6,4.2);
  }
  const brows = both(`<path d="M45 ${L.eyes==="tsuri"?"49.5 Q50 47.5 55 48.5":L.eyes==="tare"?"48 Q50 47.5 55 49.5":"49 Q50 47 55 49"}" fill="none" stroke="${hd}" stroke-width="1.6" stroke-linecap="round"/>`);
  const nose = `<path d="M60 63.5 L59 65.5" stroke="#7a4a35" stroke-opacity=".45" stroke-width="1.2" stroke-linecap="round"/>`;
  const m = ({
    open:`<path d="M54.5 68.5 Q60 77 65.5 68.5 Z" fill="#b8435a"/><path d="M56.5 72.5 Q60 75 63.5 72.5" fill="none" stroke="#ff9db0" stroke-width="1.6" stroke-linecap="round"/>`,
    small:`<path d="M58 70.5 Q60 72 62 70.5" fill="none" stroke="${ink}" stroke-width="1.6" stroke-linecap="round"/>`,
    cat:`<path d="M54.5 69 Q57.2 72.5 60 69.5 Q62.8 72.5 65.5 69" fill="none" stroke="${ink}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,
    flat:`<path d="M56.5 71 L63.5 71" stroke="${ink}" stroke-width="1.6" stroke-linecap="round"/>`,
  } as Record<string, string>)[L.mouth] || `<path d="M55 69 Q60 74 65 69" fill="none" stroke="${ink}" stroke-width="1.7" stroke-linecap="round"/>`;
  const fronts: Record<string, string> = {
    side:`<path d="M33 58 C29 18 91 18 87 58 C85 48 82 42 78 38 C70 46 52 50 36 48 C34 51 33.5 54 33 58 Z" fill="${h}"/>`,
    center:`<path d="M33 60 C29 18 91 18 87 60 C84 44 72 34 60 31 C48 34 36 44 33 60 Z" fill="${h}"/>`,
    choppy:`<path d="M33 58 C29 18 91 18 87 58 L85 45 L79 49 L74 41 L67 48 L60 40 L53 48 L46 41 L41 49 L35 45 Z" fill="${h}"/>`,
    up:`<path d="M34 50 C30 20 90 20 86 50 C78 36 42 36 34 50 Z" fill="${h}"/>`,
  };
  const front = fronts[L.bangs] || `<path d="M33 58 C29 18 91 18 87 58 C86 52 85 48 84 45 L36 45 C35 48 34 52 33 58 Z" fill="${h}"/>`;
  const shine = `<path d="M44 30 Q52 25 62 26" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2.5" stroke-linecap="round"/>`;
  const acc = ({
    glasses: both(`<circle cx="50" cy="59" r="7.2" fill="#fff" fill-opacity=".12" stroke="${ink}" stroke-width="1.6"/><path d="M42.8 58 L36 56" stroke="${ink}" stroke-width="1.6"/>`) + `<path d="M57 58 Q60 56.5 63 58" fill="none" stroke="${ink}" stroke-width="1.6"/>`,
    ribbon: `<g transform="translate(80 28) rotate(18)"><path d="M0 0 L-12 -8 L-12 8 Z M0 0 L12 -8 L12 8 Z" fill="${out}" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/><circle r="3.4" fill="${out}" stroke="#fff" stroke-width="1.2"/></g>`,
    pin: `<path d="M38 38 L48 33 M39 42 L49 37" stroke="#f2c230" stroke-width="2.4" stroke-linecap="round"/>`,
    earring: both(`<circle cx="35" cy="66.5" r="2.2" fill="#f2c230"/>`),
  } as Record<string, string>)[L.acc] || "";
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="120" height="120" style="fill:color-mix(in srgb, ${color} 26%, #fff)"/>${back}${body}${locks}${neck}${ears}${head}${blush}${eyes}${brows}${nose}${m}${front}${shine}${acc}</svg>`;
}
