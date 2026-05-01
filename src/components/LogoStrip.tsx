"use client";

const LOGOS = ["JANATICS", "SKYFAST", "SKYTECH", "INDOCELL", "TUSSOR"];

function LogoItem({ label, idx }: { label: string; idx: number }) {
  return (
    <div
      className="flex h-9 items-center justify-center text-[#7b8290] opacity-90"
      style={{
        fontFamily: idx % 2 === 0 ? "var(--font-mono), monospace" : "var(--font-sans), sans-serif",
        fontWeight: idx % 2 === 0 ? 500 : 700,
        letterSpacing: idx % 2 === 0 ? ".16em" : "-.01em",
        fontSize: idx % 2 === 0 ? 12 : 16,
      }}
    >
      {label}
    </div>
  );
}

export default function LogoStrip() {
  return (
    <section className="border-b border-line bg-white py-12">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <p className="mb-6 text-center text-[13px] text-muted">Trusted on production floors at</p>

        {/* desktop: static 5-col grid (md and up) — unchanged */}
        <div className="hidden md:grid md:grid-cols-5 md:items-center md:gap-8">
          {LOGOS.map((l, i) => <LogoItem key={l} label={l} idx={i} />)}
        </div>

        {/* mobile: continuous marquee (below md)
            Seamless loop: track = 2× logo set, w-max prevents wrapping.
            translateX(-50%) scrolls exactly one full set width → lands on
            the second copy's start → no visible seam when animation loops. */}
        <div
          className="md:hidden overflow-hidden w-full"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          }}
        >
          <div className="flex w-max animate-marquee motion-reduce:animate-none">
            {[...LOGOS, ...LOGOS].map((l, i) => (
              <div key={i} className="mx-8 flex-shrink-0">
                <LogoItem label={l} idx={i % LOGOS.length} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
