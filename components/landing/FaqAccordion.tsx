"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string;
};

const FAQS: FAQItem[] = [
  {
    question: "Apakah Placement Test ini wajib bagi seluruh mahasiswa baru?",
    answer: "Ya, tes penempatan (Placement Test) ini bersifat wajib untuk mengukur tingkat kemampuan bahasa Inggris awal Anda sebagai mahasiswa baru. Data hasil tes ini akan digunakan kampus untuk menentukan kelas remedial atau penyesuaian kurikulum akademik bahasa Inggris.",
  },
  {
    question: "Berapa lama durasi pengerjaan tes dan bagaimana format soalnya?",
    answer: "Tes mencakup enam bagian: Vocabulary, Grammar, Listening, Reading, Writing, dan Speaking. Durasi default seluruh bagian sekitar 55 menit. Jumlah soal dan waktu dapat disesuaikan admin; periksa petunjuk sebelum mulai.",
  },
  {
    question: "Apakah saya bisa menjeda atau mengulang tes di tengah jalan?",
    answer: "Tidak. Tes penempatan memiliki waktu berjalan mundur secara otomatis per sub-seksi. Jika waktu habis, jawaban Anda akan tersimpan otomatis dan sistem langsung berpindah ke sub-seksi berikutnya. Tes tidak dapat diulang setelah dikirim.",
  },
  {
    question: "Bagaimana cara mengakses modul pembelajaran mandiri PRISM?",
    answer: "Setelah tes dikirim, sistem memproses jawaban dan penilaian AI. Level dan laporan performa tersedia setelah proses selesai. Anda dapat mengakses materi belajar (Vocabulary, Writing, Speaking) di Dashboard Siswa dengan memasukkan kode/token akses yang diberikan oleh Dosen kelas Anda.",
  },
  {
    question: "Apakah platform ini gratis untuk digunakan?",
    answer: "Ya, PRISM sepenuhnya gratis untuk digunakan oleh civitas akademika President University Pekanbaru sebagai bagian dari program pilot project pengembangan kompetensi bahasa Inggris.",
  },
];

export default function FaqAccordion() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  return (
    <div className="landing-faq-list">
      {FAQS.map((faq, index) => {
        const open = activeIndex === index;
        return <div className="landing-faq-item" key={faq.question}>
          <h3><button id={"faq-question-" + index} type="button" aria-expanded={open} aria-controls={"faq-answer-" + index} onClick={() => setActiveIndex(open ? null : index)}><span>{faq.question}</span>{open ? <Minus size={20} aria-hidden="true" /> : <Plus size={20} aria-hidden="true" />}</button></h3>
          <div id={"faq-answer-" + index} role="region" aria-labelledby={"faq-question-" + index} hidden={!open}><p>{faq.answer}</p></div>
        </div>;
      })}
    </div>
  );
}
