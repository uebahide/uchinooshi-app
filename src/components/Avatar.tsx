import { faceSVG } from "@/lib/face";
import { avMode } from "@/lib/oshi";
import type { Oshi } from "@/lib/types";

export default function Avatar({ o, size = "" }: { o: Oshi; size?: "" | "big" | "sm" }) {
  const mode = avMode(o);
  const style = { "--c": o.color } as React.CSSProperties;
  if (mode === "photo") {
    return (
      <div className={`av ${size}`} style={style}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={o.avatar} alt="" />
      </div>
    );
  }
  if (mode === "face" && o.look) {
    return <div className={`av ${size}`} style={style} dangerouslySetInnerHTML={{ __html: faceSVG(o.look, o.color) }} />;
  }
  return (
    <div className={`av ${size}`} style={style}>
      {o.glyph || (o.name || "？").trim().charAt(0) || "？"}
    </div>
  );
}
