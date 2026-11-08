export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowUpRight, BookOpen, Check, Headphones, MessageCircle, PenLine } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import LandingHeader from "@/components/landing/LandingHeader";
import Logo from "@/components/ui/Logo";
import HeroSection from "@/components/landing/HeroSection";
import InteractiveDemo from "@/components/landing/InteractiveDemo";
import FaqAccordion from "@/components/landing/FaqAccordion";
import PlacementTestPreview from "@/components/landing/PlacementTestPreview";
import "./landing.css";

const MODULES = [
  { number: "01", title: "Kosakata yang relevan.", label: "Vocabulary", description: "Perluas kosakata akademik lewat flashcard dan ulasan kata. Bangun kebiasaan belajar, satu kata demi satu kata.", Icon: BookOpen },
  { number: "02", title: "Tulisan yang lebih terarah.", label: "Writing", description: "Latih esai dan paragraf. Dapatkan umpan balik AI tentang tata bahasa, isi, dan struktur dalam Bahasa Indonesia.", Icon: PenLine },
  { number: "03", title: "Lebih percaya diri berbicara.", label: "Speaking", description: "Berlatih lewat skenario percakapan, diskusi, dan presentasi. Kirim rekamanmu untuk mendapatkan umpan balik AI.", Icon: MessageCircle },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  const destination = user ? (user.role === "ADMIN" ? "/admin/dashboard" : "/student") : "/register";
  return (
    <div className="prism-landing" id="top">
      <a href="#landing-main" className="landing-skip">Langsung ke konten</a>
      <LandingHeader user={user} />
      <main id="landing-main" tabIndex={-1}>
        <HeroSection user={user} />
        <div className="landing-campus"><div className="landing-container"><span>DIRANCANG UNTUK KEBUTUHAN AKADEMIK</span><p>President University Pekanbaru</p><span>Kenali potensi. Siapkan langkah berikutnya.</span></div></div>

        <section id="placement-test" className="landing-section">
          <div className="landing-container assessment-layout">
            <div className="section-copy">
              <p className="landing-eyebrow">01 / KENALI TITIK AWALMU</p>
              <h2>Satu tes.<br />Enam sudut pandang.</h2>
              <p>Bahasa Inggris lebih dari sekadar tata bahasa. Lihat gambaran kemampuanmu melalui Vocabulary, Grammar, Listening, Reading, Writing, dan Speaking.</p>
              <ul className="assessment-features">
                <li><Headphones size={21} aria-hidden="true" /><div><h3>Enam skill, satu gambaran utuh</h3><p>Gabungan soal objektif, tulisan, dan respons lisan.</p></div></li>
                <li><Check size={21} aria-hidden="true" /><div><h3>Hasil yang mudah dipahami</h3><p>Lihat skor setiap skill, level kemampuan, dan area yang perlu dilatih.</p></div></li>
                <li><PenLine size={21} aria-hidden="true" /><div><h3>Umpan balik untuk berkembang</h3><p>Penilaian AI membantu mengevaluasi jawaban writing dan speaking.</p></div></li>
              </ul>
            </div>
            <div className="assessment-preview"><p className="preview-label">COBA SATU CONTOH SOAL</p><PlacementTestPreview /></div>
          </div>
        </section>

        <section id="ai-learning" className="landing-section learning-section">
          <div className="landing-container">
            <div className="section-heading"><div><p className="landing-eyebrow">02 / LANJUTKAN DENGAN LATIHAN</p><h2>Hasil tes adalah awal.<br />Belajar jadi langkah berikutnya.</h2></div><p>Aktifkan akses modul dengan token dari dosen. Pilih latihan sesuai kemampuan yang ingin kamu tingkatkan.</p></div>
            <div className="learning-modules">{MODULES.map(({ number, title, label, description, Icon }) => <article className="learning-module" key={number}><div className="module-top"><span>{number}</span><Icon size={25} aria-hidden="true" /></div><p className="module-label">{label}</p><h3>{title}</h3><p>{description}</p></article>)}</div>
          </div>
        </section>

        <section id="demo-section" className="landing-section">
          <div className="landing-container demo-layout">
            <div className="section-copy"><p className="landing-eyebrow">03 / LIHAT CARA KERJANYA</p><h2>Bukan hanya koreksi.<br />Pahami alasannya.</h2><p>Umpan balik yang berguna menjelaskan apa yang perlu diperbaiki dan mengapa. Jelajahi contoh koreksi writing dengan penjelasan dalam Bahasa Indonesia.</p><div className="demo-note"><PenLine size={20} aria-hidden="true" /><p>Demo memakai contoh yang telah disiapkan. Penilaian tulisanmu sendiri tersedia di modul Writing setelah akses diaktifkan.</p></div></div>
            <InteractiveDemo />
          </div>
        </section>

        <section id="faq" className="landing-section faq-section"><div className="landing-container faq-layout"><div className="section-copy"><p className="landing-eyebrow">SEBELUM MULAI</p><h2>Ada yang ingin<br />kamu ketahui?</h2><p>Informasi tentang tes, hasil penilaian, dan akses modul belajar PRISM.</p></div><FaqAccordion /></div></section>

        <section className="landing-final"><div className="landing-container final-layout"><div><p className="landing-eyebrow">LANGKAH KECIL, ARAH YANG JELAS</p><h2>Mulai dari kemampuanmu hari ini.</h2><p>Kenali titik awalmu, lalu bangun kebiasaan belajar yang lebih terarah.</p></div><Link href={destination} className="landing-button light">{user ? "Buka Dashboard" : "Mulai Tes"}<ArrowUpRight size={19} aria-hidden="true" /></Link></div></section>
      </main>
      <footer className="landing-footer"><div className="landing-container"><div className="footer-top"><div><Link href="#top" aria-label="PRISM, kembali ke atas"><Logo className="h-11 w-36" /></Link><p>Tes penempatan dan latihan bahasa Inggris<br />untuk mendukung perjalanan akademikmu.</p></div><nav aria-label="Navigasi footer"><a href="#placement-test">Tes Penempatan</a><a href="#ai-learning">Modul Belajar</a><a href="#faq">FAQ</a><Link href={user ? destination : "/login"}>{user ? "Dashboard" : "Masuk"}</Link></nav></div><div className="footer-bottom"><p>© {new Date().getFullYear()} PRISM. All rights reserved.</p><p>President University Pekanbaru · Riau, Indonesia</p></div></div></footer>
    </div>
  );
}
