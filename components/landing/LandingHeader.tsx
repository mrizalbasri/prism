"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Logo from "@/components/ui/Logo";

type LandingHeaderProps = { user: { fullName: string; role: string } | null };
const LINKS = [
  { name: "Tes Penempatan", href: "#placement-test" },
  { name: "Modul Belajar", href: "#ai-learning" },
  { name: "Demo", href: "#demo-section" },
  { name: "FAQ", href: "#faq" },
];

export default function LandingHeader({ user }: LandingHeaderProps) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggleRef.current?.focus(); }
    };
    const closeOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [open]);
  const dashboard = user?.role === "ADMIN" ? "/admin/dashboard" : "/student";
  return (
    <header className="landing-header" ref={headerRef}>
      <div className="landing-container header-row">
        <Link href="/" aria-label="PRISM, beranda" onClick={() => setOpen(false)}><Logo className="h-11 w-36" priority /></Link>
        <nav className="desktop-navigation" aria-label="Navigasi utama">
          {LINKS.map((link) => <a key={link.href} href={link.href}>{link.name}</a>)}
        </nav>
        <div className="desktop-auth">
          {user ? <Link href={dashboard} className="landing-button primary">Dashboard<ArrowUpRight size={16} aria-hidden="true" /></Link> : <><Link href="/login">Masuk</Link><Link href="/register" className="landing-button primary">Mulai Tes<ArrowUpRight size={16} aria-hidden="true" /></Link></>}
        </div>
        <button ref={toggleRef} type="button" className="mobile-menu-toggle" aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"} aria-expanded={open} aria-controls="landing-mobile-menu" onClick={() => setOpen(!open)}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
      </div>
      <nav id="landing-mobile-menu" className="mobile-navigation" aria-label="Navigasi mobile" hidden={!open}>
        {LINKS.map((link) => <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.name}<ArrowUpRight size={16} aria-hidden="true" /></a>)}
        <div className="mobile-auth">
          {user ? <Link href={dashboard} className="landing-button primary" onClick={() => setOpen(false)}>Dashboard</Link> : <><Link href="/login" className="landing-button secondary" onClick={() => setOpen(false)}>Masuk</Link><Link href="/register" className="landing-button primary" onClick={() => setOpen(false)}>Mulai Tes</Link></>}
        </div>
      </nav>
    </header>
  );
}
