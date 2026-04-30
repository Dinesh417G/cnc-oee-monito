"use client";
import { useEffect } from "react";
import { useModalStore } from "@/lib/modalStore";

export default function ContactModal() {
  const { open, closeModal } = useModalStore();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeModal]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,17,65,0.55)", backdropFilter: "blur(4px)" }}
      onClick={closeModal}
    >
      <div
        className="relative w-full max-w-md border border-line bg-white shadow-[0_32px_64px_-24px_rgba(0,17,65,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-block h-5 w-5 bg-navy relative flex-shrink-0"
              style={{ backgroundImage: "none" }}>
              <span className="absolute inset-x-[5px] top-[9px] h-[3px] bg-primary" />
              <span className="absolute inset-y-[5px] left-[9px] w-[3px] bg-primary" />
            </span>
            <span className="font-bold tracking-tight text-navy">ElectronIx</span>
          </div>
          <button
            onClick={closeModal}
            className="flex h-7 w-7 items-center justify-center text-muted hover:bg-line hover:text-ink"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* body */}
        <div className="px-6 py-8 flex flex-col gap-6">
          <div>
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary mb-2">
              Get in touch
            </p>
            <h2 className="text-2xl font-bold leading-tight tracking-tight text-navy">
              Talk to our team
            </h2>
            <p className="mt-2 text-sm text-muted">
              We&apos;ll get back to you within one business day to set up your trial or demo.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <a
              href="mailto:contact@electronix.io"
              className="flex items-center gap-4 border border-line p-4 hover:border-primary hover:bg-[#f4f8ff] transition-colors"
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-[#eaf1ff] text-primary text-lg">
                ✉
              </span>
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Email</p>
                <p className="mt-0.5 font-semibold text-navy">contact@electronix.io</p>
              </div>
            </a>

            <a
              href="tel:+18005550199"
              className="flex items-center gap-4 border border-line p-4 hover:border-primary hover:bg-[#f4f8ff] transition-colors"
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-[#eaf1ff] text-primary text-lg">
                ☎
              </span>
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Phone</p>
                <p className="mt-0.5 font-semibold text-navy">+1 (800) 555-0199</p>
              </div>
            </a>
          </div>

          <button
            onClick={closeModal}
            className="mt-2 h-[46px] w-full bg-primary text-[15px] font-medium text-white hover:bg-primary-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
