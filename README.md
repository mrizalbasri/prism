<div align="center">
  <img src="public/logo.webp" alt="Logo PRISM" width="88" />
  <h1>PRISM</h1>
  <p><strong>English Placement & Learning Platform</strong></p>
  <p>Asesmen bahasa Inggris yang terstruktur, dilanjutkan dengan pembelajaran mandiri berbantuan AI.</p>
  <p><a href="#fitur-utama">Fitur</a> · <a href="#menjalankan-secara-lokal">Mulai pengembangan</a> · <a href="docs/README.md">Dokumentasi</a></p>
</div>

---

PRISM membantu perguruan tinggi memetakan kemampuan bahasa Inggris mahasiswa dan menyediakan ruang latihan setelah asesmen. Mahasiswa mengikuti placement test, melihat hasil per keterampilan, lalu melanjutkan latihan Vocabulary, Writing, dan Speaking melalui akses modul yang dikelola kampus.

Bagi administrator, PRISM menyediakan pengelolaan mahasiswa, bank soal, materi latihan, dan hasil asesmen dalam satu aplikasi. Antarmuka menggunakan Bahasa Indonesia dengan materi pembelajaran bahasa Inggris.

## Fitur utama

| Area | Kemampuan |
| --- | --- |
| Placement test | Enam bagian: Vocabulary, Grammar, Listening, Reading, Writing, dan Speaking; timer per bagian dan penyimpanan jawaban. |
| Hasil asesmen | Skor per keterampilan, skor keseluruhan berbobot, klasifikasi Beginner–Advanced, dan pemetaan level CEFR berdasarkan ambang aplikasi. |
| Vocabulary | Flashcard, sesi belajar, dan review kosakata. |
| Writing | Latihan berdasarkan prompt, riwayat pengumpulan, serta penilaian dan umpan balik AI. |
| Speaking | Latihan berbasis skenario, rekaman audio, riwayat sesi, serta umpan balik AI. |
| Administrasi | Pengelolaan mahasiswa, akses modul, bank soal, materi latihan, pengaturan tes, dan ekspor hasil CSV. |
| Penilaian asinkron | Pemrosesan lokal atau antrean BullMQ dengan Redis; pemantauan kegagalan dan penilaian ulang melalui admin. |

Pemetaan CEFR merupakan interpretasi skor di dalam aplikasi, bukan sertifikasi kemampuan bahasa resmi.

## Alur penggunaan

1. Mahasiswa mendaftar dan masuk ke dashboard.
2. Mahasiswa mengikuti enam bagian placement test.
3. Sistem menilai jawaban objektif dan memproses Writing serta Speaking dengan AI.
4. Mahasiswa melihat hasil setelah penilaian selesai.
5. Mahasiswa dengan akses modul aktif melanjutkan latihan mandiri.
6. Administrator meninjau hasil, mengelola materi, dan menindaklanjuti penilaian yang gagal.

## Teknologi

| Lapisan | Teknologi |
| --- | --- |
| Aplikasi web & API | Next.js 16 App Router, React 19, TypeScript |
| Antarmuka | Tailwind CSS 4, Radix UI, Lucide |
| Data | PostgreSQL, Prisma 7 |
| Autentikasi | JWT dalam cookie HTTP-only, bcryptjs, peran Student dan Admin |
| Integrasi AI | Google Gemini dan MiniMax melalui endpoint yang dapat dikonfigurasi |
| Layanan pendamping | Python, FastAPI, Piper untuk layanan audio dan pembuatan soal |
| Antrean opsional | BullMQ, Redis |
| Penyimpanan audio | Disk lokal atau penyimpanan kompatibel S3, termasuk Cloudflare R2 |
| Pengujian | Vitest, ESLint, TypeScript |

Versi dependensi lengkap tersedia di [`package.json`](package.json) dan [`ai-engine/requirements.txt`](ai-engine/requirements.txt).

## Menjalankan secara lokal

Siapkan Node.js 22+, pnpm 11+, dan database PostgreSQL lokal. Python diperlukan jika menjalankan AI Engine.

### 1. Instal dependensi

```bash
git clone git@github.com:mrizalbasri/prism.git
cd prism
pnpm install
```

### 2. Konfigurasikan environment

Salin [`.env.example`](.env.example) menjadi `.env`. Untuk PowerShell:

```powershell
Copy-Item .env.example .env
```

Atur `DATABASE_URL` ke database pengembangan yang sudah dibuat, isi `JWT_SECRET` dengan nilai acak, dan konfigurasikan kredensial penyedia AI sesuai kebutuhan. Penilaian berbasis AI memerlukan layanan yang dapat diakses; konfigurasi lengkap dijelaskan dalam [panduan pengembangan lokal](docs/guides/SETUP.md).

### 3. Siapkan database dan materi awal

Jalankan pada **database pengembangan baru**. Seeder menghapus dan mengisi ulang koleksi soal atau materi terkait.

```bash
pnpm exec prisma generate
pnpm exec prisma db push
pnpm seed
pnpm seed:phase2
```

### 4. Jalankan aplikasi

```bash
pnpm dev
```

Buka [localhost:3000](http://localhost:3000). Untuk audio dan pembuatan soal melalui layanan Python, jalankan [AI Engine](ai-engine/README.md) secara terpisah. Jika `REDIS_URL` diisi, jalankan juga worker sesuai [panduan setup](docs/guides/SETUP.md#worker-penilaian-opsional).

## Perintah pengembangan

| Perintah | Fungsi |
| --- | --- |
| `pnpm dev` | Menjalankan server pengembangan |
| `pnpm build` | Membuat build produksi |
| `pnpm start` | Menjalankan hasil build |
| `pnpm lint` | Memeriksa kode dengan ESLint |
| `pnpm test` | Menjalankan pengujian Vitest |
| `pnpm exec tsc --noEmit` | Memeriksa tipe TypeScript |
| `pnpm seed` | Mengisi ulang soal placement test |
| `pnpm seed:phase2` | Mengisi ulang materi modul belajar |

## Struktur proyek

```text
app/          Halaman App Router dan API mahasiswa/admin
components/   Komponen antarmuka berdasarkan area produk
lib/          Autentikasi, penilaian, data, audio, dan integrasi layanan
prisma/       Skema database dan seeder
ai-engine/    Layanan pendamping Python/FastAPI
workers/      Worker antrean penilaian AI
tests/        Pengujian aplikasi
public/       Aset statis
docs/         Panduan, kebutuhan produk, dan catatan arsitektur
```

## Dokumentasi

- [Indeks dokumentasi](docs/README.md)
- [Pengembangan lokal dan konfigurasi layanan](docs/guides/SETUP.md)
- [Penilaian, kegagalan, dan penilaian ulang](docs/guides/SCORING_RELIABILITY.md)
- [AI Engine](ai-engine/README.md)
- [Product Requirements Document](docs/product/PRISM_PRD_v2.md)

## Status pengembangan

PRISM masih dalam pengembangan. Alur asesmen, latihan, dan administrasi tersedia dalam kode; kesiapan penggunaan kampus tetap memerlukan verifikasi alur lengkap dengan database, penyedia AI, dan penyimpanan audio pada lingkungan tujuan. Dokumen perencanaan dapat mencakup fitur yang belum diimplementasikan.

Untuk mengusulkan perubahan, gunakan [GitHub Issues](https://github.com/mrizalbasri/prism/issues) dengan konteks, langkah reproduksi, dan perilaku yang diharapkan. Sebelum mengajukan perubahan kode, jalankan lint, pemeriksaan tipe, dan tes yang relevan. Jangan sertakan kredensial atau data pribadi mahasiswa.
