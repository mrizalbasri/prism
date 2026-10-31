import { BookOpen, ChartNoAxesCombined, ChevronRight, LayoutDashboard, MessageCircle, PanelLeft, PenLine, Settings } from "lucide-react";
import Logo from "@/components/ui/Logo";

const SKILLS = [
  { name: "Vocabulary", score: 80 }, { name: "Grammar", score: 70 },
  { name: "Listening", score: 75 }, { name: "Reading", score: 80 },
  { name: "Writing", score: 65 }, { name: "Speaking", score: 60 },
];
const MODULES = [
  { name: "Vocabulary", detail: "Perluas kosakata akademikmu", Icon: BookOpen },
  { name: "Writing", detail: "Kembangkan ide lewat tulisan", Icon: PenLine },
  { name: "Speaking", detail: "Bangun kepercayaan dirimu", Icon: MessageCircle },
];

export default function HeroAppPreview() {
  return (
    <figure className="hero-app-frame" aria-labelledby="hero-preview-caption">
      <div className="hero-app-window">
        <aside className="hero-app-sidebar" aria-label="Ilustrasi menu aplikasi">
          <div className="hero-app-brand"><Logo className="h-9 w-28" /></div>
          <div className="hero-app-menu">
            <span className="is-current"><LayoutDashboard size={16} aria-hidden="true" />Dashboard</span>
            <span><ChartNoAxesCombined size={16} aria-hidden="true" />Hasil Tes</span>
            <p>MODUL BELAJAR</p>
            {MODULES.map(({ name, Icon }) => <span key={name}><Icon size={16} aria-hidden="true" />{name}</span>)}
          </div>
          <div className="hero-app-account"><span><Settings size={16} aria-hidden="true" />Pengaturan</span><div><b>A</b><span>Mahasiswa<small>Akun pembelajaran</small></span></div></div>
        </aside>
        <div className="hero-app-main">
          <div className="hero-app-toolbar"><PanelLeft size={16} aria-hidden="true" /><span>Dashboard</span><span className="hero-preview-badge">Contoh tampilan</span></div>
          <div className="hero-app-content">
            <p className="hero-app-overline">PERJALANAN BELAJARMU</p>
            <h2>Langkah berikutnya dimulai di sini.</h2>
            <p className="hero-app-intro">Kenali progresmu, lalu lanjutkan latihan hari ini.</p>
            <section className="hero-app-report" aria-label="Contoh hasil tes penempatan">
              <div className="hero-app-report-title"><span>Hasil tes penempatan</span><span>Estimasi CEFR B2</span></div>
              <div className="hero-app-summary"><div><small>Level kemampuan</small><h3>Intermediate</h3></div><div><strong>72</strong><span> / 100</span></div></div>
              <div className="hero-app-skills">{SKILLS.map((skill) => <div key={skill.name}><div><span>{skill.name}</span><b>{skill.score}</b></div><div className="hero-app-track"><span style={{ width: `${skill.score}%` }} /></div></div>)}</div>
            </section>
            <div className="hero-app-modules-title"><h3>Lanjutkan belajarmu</h3><span>Latihan mandiri</span></div>
            <div className="hero-app-modules">{MODULES.map(({ name, detail, Icon }) => <div key={name}><Icon size={21} aria-hidden="true" /><h3>{name}</h3><p>{detail}</p><span>Jelajahi modul<ChevronRight size={13} aria-hidden="true" /></span></div>)}</div>
            <figcaption id="hero-preview-caption">Ilustrasi dashboard PRISM. Hasil mengikuti jawaban tesmu.</figcaption>
          </div>
        </div>
      </div>
    </figure>
  );
}
