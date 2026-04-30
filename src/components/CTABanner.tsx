"use client";
import { useModalStore } from "@/lib/modalStore";

export default function CTABanner() {
  const openModal = useModalStore((s) => s.openModal);
  return (
    <section className="relative overflow-hidden bg-navy py-24 text-white">
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_50%_80%_at_80%_50%,black_20%,transparent_70%)]" />
      <div className="relative mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-8 px-6 md:px-10">
        <h2 className="m-0 max-w-[22ch] text-3xl font-bold tracking-[-.02em] md:text-4xl lg:text-[44px]">
          Ship OEE to your shop floor in a week, not a quarter.
        </h2>
        <button onClick={openModal} className="inline-flex h-[46px] items-center gap-2 bg-white px-6 text-[15px] font-medium text-navy hover:bg-[#dbe3ff]">
          Book a demo
          <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square"/></svg>
        </button>
      </div>
    </section>
  );
}
