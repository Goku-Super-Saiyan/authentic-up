import { useEffect, useRef } from "react";
import { paintCraft, type ArtKind } from "../art/crafts";

export default function CraftCanvas({ art, seed, className = "", label }: { art: ArtKind; seed: number; className?: string; label?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    let frame = 0;
    const draw = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => paintCraft(cv, art, seed)); };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(cv);
    return () => { ro.disconnect(); cancelAnimationFrame(frame); };
  }, [art, seed]);
  return <canvas ref={ref} className={`block h-full w-full ${className}`} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} />;
}
