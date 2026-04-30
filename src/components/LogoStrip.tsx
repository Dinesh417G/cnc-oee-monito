"use client";

const LOGOS = ["NORTHGRID", "AXIOM MFG", "PARALLAX", "IRONWORKS", "KILN & CO", "MERIDIAN"];

export default function LogoStrip() {
  return (
    <section className="border-b border-line bg-white py-12">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <p className="mb-6 text-center text-[13px] text-muted">Trusted on production floors at</p>
        <div className="grid grid-cols-3 items-center gap-5 md:grid-cols-6 md:gap-8">
          {LOGOS.map((l, i) => (
            <div key={l} className="flex h-9 items-center justify-center text-[#7b8290] opacity-90"
                 style={{
                   fontFamily: i % 2 === 0 ? "var(--font-mono), monospace" : "var(--font-sans), sans-serif",
                   fontWeight: i % 2 === 0 ? 500 : 700,
                   letterSpacing: i % 2 === 0 ? ".16em" : "-.01em",
                   fontSize: i % 2 === 0 ? 12 : 16,
                 }}>
              {l}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
