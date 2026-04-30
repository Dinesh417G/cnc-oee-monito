"use client";
import dynamic from "next/dynamic";
import { useModalStore } from "@/lib/modalStore";
const HeroScreenshot = dynamic(() => import("./HeroScreenshot"), { ssr: false });

export default function Hero() {
  const openModal = useModalStore((s) => s.openModal);
  return (
    <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-white to-[#f4f6fb] pt-20">
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(15,98,254,.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,98,254,.05)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black_30%,transparent_80%)]" />
      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 px-6 md:px-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
        <div className="flex flex-col gap-6 py-10 lg:py-16">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
            OEE Monitoring &mdash; Digital Twin &mdash; Shop Floor
          </span>
          <h1 className="text-balance text-5xl font-bold leading-[1.02] tracking-[-0.025em] text-navy md:text-6xl lg:text-[76px]">
            See every CNC machine. Cut hidden downtime in half.
          </h1>
          <p className="max-w-[46ch] text-pretty text-base leading-relaxed text-muted md:text-[19px]">
            ElectronIx OEE Monitoring brings real-time Availability, Performance, and Quality
            from every spindle on your floor into one operator-grade view —
            with drill-down to the part, the shift, and the root cause.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <button onClick={openModal} className="inline-flex h-[46px] items-center gap-2 bg-primary px-6 text-[15px] font-medium text-white hover:bg-primary-700">
              Start free trial
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square"/></svg>
            </button>
            <button onClick={openModal} className="inline-flex h-[46px] items-center border border-ink px-6 text-[15px] font-medium hover:bg-ink hover:text-white">
              Watch 2-min tour
            </button>
          </div>
          <div className="mt-5 flex flex-wrap gap-6 border-t border-line pt-5 text-[13px] text-muted">
            <span><b className="font-semibold text-ink">OEE = A &times; P &times; Q</b></span>
            <span>5-second sample rate</span>
            <span>Edge agent &bull; MQTT &bull; OPC UA</span>
            <span>SOC 2 Type II</span>
          </div>
        </div>
        <div className="py-6">
          <HeroScreenshot />
        </div>
      </div>
    </section>
  );
}
