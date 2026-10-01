const EN = ["Banarasi", "Chikankari", "Zardozi", "Kaanch", "Attar", "Nakkashi", "Parchinkari", "Terracotta", "Dari", "Jali"];
const HI = ["बनारसी", "चिकनकारी", "ज़रदोज़ी", "काँच", "इत्र", "नक्काशी", "पच्चीकारी", "टेराकोटा", "दरी", "जाली"];

function Row({ words, reverse, outline }: { words: string[]; reverse?: boolean; outline?: boolean }) {
  const items = [...words, ...words];
  return (
    <div className="flex overflow-hidden" aria-hidden="true">
      <div className="flex shrink-0 items-center gap-10 pr-10" style={{ animation: `marquee ${reverse ? 70 : 55}s linear infinite ${reverse ? "reverse" : ""}` }}>
        {items.map((w, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className={`font-display whitespace-nowrap text-[clamp(44px,8vw,110px)] leading-[1.15] ${outline ? "text-outline" : "text-ivory"}`}>{w}</span>
            <svg width="26" height="26" viewBox="0 0 20 20" className="shrink-0 fill-zari"><path d="M10 0 12.5 7.5 20 10 12.5 12.5 10 20 7.5 12.5 0 10 7.5 7.5Z" /></svg>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Marquee() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-silk py-6" aria-label="Crafts of Uttar Pradesh">
      <Row words={EN} />
      <Row words={HI} reverse outline />
    </section>
  );
}
