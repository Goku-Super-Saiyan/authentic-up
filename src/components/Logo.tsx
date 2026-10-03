import { useId, useMemo } from "react";
import { emblemSvg, type EmblemVariant } from "../brand/emblem";
import { BRAND } from "../brand/brand";

export function Emblem({ className = "", variant = "full", animated = false }: { className?: string; variant?: EmblemVariant; animated?: boolean }) {
  const id = "e" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const html = useMemo(() => emblemSvg(id, variant, animated), [id, variant, animated]);
  return <span className={`inline-block [&>svg]:block [&>svg]:h-full [&>svg]:w-full ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`flex min-w-0 items-center ${compact ? "gap-2 min-[360px]:gap-2.5" : "gap-2.5"}`}>
      <Emblem className={`shrink-0 ${compact ? "h-10 w-[34px]" : "h-12 w-[42px]"}`} animated />
      <span className="flex min-w-0 flex-col leading-none">
        {/* On the narrowest phones the name shrinks a little, and is cut short rather than pushing the bag off screen. */}
        <span lang="en" className={`truncate font-display leading-none tracking-tight ${compact ? "text-[20px] min-[360px]:text-[22px]" : "text-[22px]"}`}>
          {BRAND.word} <span className="zari-text">UP</span>
        </span>
        <span className="mt-1 hidden text-[11px] text-mist sm:block">{BRAND.hindi}</span>
      </span>
    </span>
  );
}
