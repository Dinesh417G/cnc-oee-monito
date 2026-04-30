"use client";
import Link from "next/link";
import { useModalStore } from "@/lib/modalStore";

export default function Nav() {
  const openModal = useModalStore((s) => s.openModal);
  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 md:px-10">
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight">
          <BrandMark />
          <span>ElectronIx</span>
        </Link>
        <div className="hidden gap-7 text-sm text-ink2 md:flex">
          <a href="#product" className="py-1.5 hover:text-primary">Product</a>
          <a href="#why" className="py-1.5 hover:text-primary">Why ElectronIx</a>
          <a href="#integrations" className="py-1.5 hover:text-primary">Integrations</a>
          <a href="#docs" className="py-1.5 hover:text-primary">Docs</a>
          <a href="#pricing" className="py-1.5 hover:text-primary">Pricing</a>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openModal} className="hidden h-9 items-center px-3.5 text-sm md:inline-flex">Sign in</button>
          <button onClick={openModal} className="inline-flex h-9 items-center bg-primary px-4 text-sm font-medium text-white hover:bg-primary-700">
            Book a demo
          </button>
        </div>
      </div>
    </nav>
  );
}

export function BrandMark() {
  return (
    <span className="relative inline-block h-6 w-6 bg-navy">
      <span className="absolute left-1 right-1 top-2.5 h-1 bg-primary" />
      <span className="absolute bottom-1 left-2.5 top-1 w-1 bg-primary" />
    </span>
  );
}
