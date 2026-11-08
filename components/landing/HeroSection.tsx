import Link from "next/link";
import { BookOpen, ChevronRight, CirclePlay, MessageCircle, PenLine } from "lucide-react";
import HeroAppPreview from "./HeroAppPreview";
import "./hero.css";

type HeroSectionProps = { user: { fullName: string; role: string } | null };

export default function HeroSection({ user }: HeroSectionProps) {
  const destination = user ? (user.role === "ADMIN" ? "/admin/dashboard" : "/student") : "/register";
  return (
    <section className="landing-hero" aria-labelledby="hero-title">
      <div className="landing-container hero-layout">
        <div className="hero-copy">
          <h1 id="hero-title">Kenali kemampuanmu.<br /><span>Temukan arah belajarmu.</span></h1>
          <p className="hero-description">Mulai dengan tes penempatan bahasa Inggris. Pahami kekuatanmu di enam skill, lalu terus berkembang lewat latihan dan umpan balik AI dalam Bahasa Indonesia.</p>
          <div className="hero-actions">
            <Link href={destination} className="landing-button primary">{user ? "Buka Dashboard" : "Mulai Tes"}<ChevronRight size={18} aria-hidden="true" /></Link>
            <a href="#demo-section" className="landing-button secondary"><CirclePlay size={18} aria-hidden="true" />Lihat Demo</a>
          </div>
          <div className="hero-learning">
            <p>Satu tempat untuk terus berkembang</p>
            <ul aria-label="Modul latihan PRISM">
              <li><BookOpen aria-hidden="true" size={23} />Vocabulary</li>
              <li><PenLine aria-hidden="true" size={23} />Writing</li>
              <li><MessageCircle aria-hidden="true" size={23} />Speaking</li>
            </ul>
          </div>
        </div>
        <div className="hero-preview-position"><HeroAppPreview /></div>
      </div>
    </section>
  );
}
