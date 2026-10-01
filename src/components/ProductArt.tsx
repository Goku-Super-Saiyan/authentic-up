import type { Product } from "../data/catalog";
import CraftCanvas from "./CraftCanvas";

// Shows the product photo when one exists, otherwise the craft's drawn artwork.
export default function ProductArt({ p, className = "", label }: { p: Product; className?: string; label?: string }) {
  if (p.photo) return <img src={p.photo} alt={label ?? p.name} loading="lazy" className={`block h-full w-full object-cover ${className}`} />;
  return <CraftCanvas art={p.art} seed={p.seed} className={className} label={label} />;
}
