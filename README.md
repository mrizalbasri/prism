<div align="center">
  <img src="public/logo.webp" alt="PRISM Logo" width="100" />
  <h1>PRISM</h1>
  <p><strong>Enterprise English Placement Test & AI-Powered Adaptive Learning Platform</strong></p>
  <p><em>Solusi asesmen diagnostik kemampuan bahasa Inggris terpadu berbasis CEFR, terintegrasi dengan modul pembelajaran mandiri adaptif bertenaga AI dan panel manajemen institusi.</em></p>

  <p>
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js" alt="Next.js 16" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react" alt="React 19" /></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS 4" /></a>
    <a href="https://www.postgresql.org"><img src="https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
    <a href="https://www.prisma.io"><img src="https://img.shields.io/badge/Prisma-7.10-2D3748?style=flat-square&logo=prisma" alt="Prisma 7" /></a>
    <a href="https://vitest.dev"><img src="https://img.shields.io/badge/Vitest-102%20passed-6E9F18?style=flat-square&logo=vitest&logoColor=white" alt="Vitest Tests" /></a>
    <a href="https://fastapi.tiangolo.com"><img src="https://img.shields.io/badge/FastAPI-AI_Engine-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI AI Engine" /></a>
  </p>

  <p>
    <a href="#-fitur-utama">Fitur Utama</a> •
    <a href="#-arsitektur-sistem">Arsitektur</a> •
    <a href="#-teknologi">Teknologi</a> •
    <a href="#-memulai-pengembangan-lokal">Instalasi Lokal</a> •
    <a href="#-variabel-lingkungan-env">Konfigurasi</a> •
    <a href="#-dokumentasi-lengkap">Dokumentasi</a>
  </p>
</div>

---

## 📌 Ringkasan Eksekutif

**PRISM** dirancang untuk membantu perguruan tinggi dan institusi pendidikan memetakan kemahiran bahasa Inggris mahasiswa secara objektif, efisien, dan berskala besar. Platform ini menggabungkan **6-Skill Diagnostic Placement Test** dengan ekosistem latihan mandiri cerdas berbasis kecerdasan buatan (AI) yang mencakup **Vocabulary**, **Writing**, dan **Speaking**.

Bagi pengelola kampus, PRISM menyediakan dasbor terpusat untuk memantau performa angkatan, mengelola hak akses modul, mengontrol bank soal, serta mengeksekusi penilaian ulang atomik (*atomic retry*) dengan keandalan data tinggi.

> [!NOTE]
> Pemetaan CEFR (Common European Framework of Reference) pada platform ini merupakan estimasi diagnostik internal untuk kebutuhan penempatan level belajar dan kurikulum, bukan sertifikasi bahasa resmi (seperti IELTS/TOEFL).

---

## ✨ Fitur Utama

```
                      ┌─────────────────────────────────────────┐
                      │             PRISM ECOSYSTEM             │
                      └────────────────────┬────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
         ▼                                 ▼                                 ▼
┌──────────────────┐             ┌──────────────────┐             ┌──────────────────┐
│  PLACEMENT TEST  │             │  LEARNING SUITE  │             │   ADMIN SUITE    │
│ 6 Sub-Kemampuan  │             │ 3 Modul Adaptif  │             │ Monitoring & Ops │
└──────────────────┘             └──────────────────┘             └──────────────────┘
```

### 1. 🎯 6-Skill Diagnostic Placement Test
* **Asesmen Objektif & Otomatis**: Meliputi sub-kemampuan *Vocabulary*, *Grammar*, *Listening* (dengan audio terintegrasi), dan *Reading*.
* **Evaluasi Subjektif Berbasis AI**:
  * **Writing**: Penilaian esai komprehensif menggunakan LLM berdasarkan kriteria gramatikal, koherensi, kekayaan kosakata, dan pengembangan argumen.
  * **Speaking**: Rekaman suara langsung via peramban yang dianalisis oleh AI multimodal (Gemini) untuk mengevaluasi kelancaran, akurasi, dan pengucapan (*pronunciation*).
* **Integritas Ujian**: Dilengkapi *anti-cheating violation logger* (mendeteksi perpindahan tab/jendela aktif), batas waktu terisolasi per sesi, dan mekanisme penyimpanan progres otomatis (*auto-save*).

### 2. 📊 Pemetaan Level & Diagnostik Kemampuan
* **Profil CEFR & Skor Terbobot**: Menghasilkan skor 0–100 per sub-kemampuan serta skor agregat berbobot yang dipetakan ke tingkat CEFR (A1 hingga C2) dan predikat *Beginner* hingga *Advanced*.
* **Umpan Balik Kualitatif**: Setiap mahasiswa menerima laporan terperinci mengenai kekuatan mereka serta rekomendasi area spesifik yang perlu ditingkatkan.

### 3. 💡 AI-Powered Adaptive Learning Suite
Mahasiswa yang mendapatkan akses modul dapat melanjutkan pengasahan keterampilan mandiri:
* **Vocabulary Studio**: Pembelajaran kosakata interaktif berbasis kartu memori (*flashcards*), sesi tinjauan terstruktur (*spaced review*), dan pelacakan kosakata yang dikuasai.
* **Writing Lab**: Latihan menulis esai berbasis skenario kontekstual, umpan balik rubrik instan, saran perbaikan kalimat per kalimat, dan riwayat revisi.
* **Speaking Arena**: Latihan percakapan berpanduan skenario profesional/akademik, perekaman audio langsung, dan evaluasi berbicara interaktif.

### 4. 🛡️ Panel Administrasi & Keandalan Penilaian
* **Manajemen Mahasiswa & Modul**: Kelola data angkatan, status akun, aktivasi akses modul belajar (`hasModuleAccess`), dan otorisasi remedial/tes ulang (`allowRetake`).
* **Bank Soal Dinamis**: Pembuatan dan kurasi butir soal placement serta modul latihan secara berkala.
* **Zero-Substitute Policy**: Penilaian AI tidak pernah menggunakan nilai pengganti/asumsi (*dummy score*) jika terjadi kendala jaringan. Jawaban tetap tersimpan aman.
* **Atomic Retry Engine**: Admin dapat memantau proses yang gagal dan menjalankan penilaian ulang secara atomik langsung dari dasbor tanpa menghilangkan riwayat jawaban asli.
* **Ekspor Data Institusi**: Mendukung unduh rekapitulasi nilai dan profil kemampuan mahasiswa ke format CSV untuk analisis akademik lanjutan.

---

## 🏛️ Arsitektur Sistem

PRISM dibangun dengan arsitektur decoupled yang memisahkan aplikasi web Next.js, basis data relasional PostgreSQL, antrean penilaian terdistribusi, dan layanan pendamping Python untuk pemrosesan audio/AI.

```mermaid
flowchart TD
    subgraph Client ["Client Layer"]
        S[Mahasiswa / Student Portal]
        A[Administrator / Admin Dashboard]
    end

    subgraph AppServer ["Next.js 16 App Router (Node.js 22+)"]
        API[Route Handlers & Server Actions]
        Auth[JWT Session & RBAC Guard]
        SP[Scoring Processor & Contract Validator]
        Storage[Storage Manager: Local / S3 / Cloudflare R2]
    end

    subgraph StorageLayer ["Persistence & Cache"]
        DB[(PostgreSQL 15+ via Prisma 7)]
        Redis[(Redis BullMQ Queue - Opsional)]
    end

    subgraph Workers ["Scoring Workers"]
        BW[BullMQ AI Evaluation Worker]
    end

    subgraph AIServices ["AI Services & Sidecar"]
        Gemini[Google Gemini 2.0 Flash - Multimodal Audio & Speaking]
        MiniMax[MiniMax LLM - Text & Writing Evaluation]
        FastAPI[PRISM AI Engine - Python FastAPI & Piper TTS]
    end

    S -->|HTTP / Audio| API
    A -->|HTTP / Management| API
    API --> Auth
    API --> DB
    API --> Storage

    API -.->|Mode Lokal: next after| SP
    API -.->|Mode Antrean| Redis
    Redis --> BW
    BW --> SP

    SP --> Gemini
    SP --> MiniMax
    API <-->|X-Internal-Secret| FastAPI
    SP --> DB
```

---

## 💻 Teknologi

| Komponen / Lapisan | Pilihan Teknologi | Keterangan & Peran |
| :--- | :--- | :--- |
| **Kerangka Utama Web** | [Next.js 16 (App Router)](https://nextjs.org) | Arsitektur modern dengan React 19, Server Components, dan Route Handlers. |
| **Bahasa Pemrograman** | [TypeScript 5](https://www.typescriptlang.org) | *End-to-end type safety* di seluruh API, komponen, dan skema validasi. |
| **Desain & Antarmuka** | [Tailwind CSS v4](https://tailwindcss.com) + [Radix UI](https://www.radix-ui.com) | Desain modular, modern, aksesibel, dan responsif dengan paket ikon [Lucide](https://lucide.dev). |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org) + [Prisma 7](https://www.prisma.io) | Manajemen skema type-safe, driver native `@prisma/adapter-pg`, dan koneksi teroptimasi. |
| **Autentikasi & Keamanan** | JWT (Cookie HTTP-Only) + bcryptjs | Mekanisme autentikasi bebas sesi server dengan kontrol peran `STUDENT` & `ADMIN`. |
| **Layanan AI Utama** | Google Gemini & MiniMax | Gemini Flash untuk audio multimodal/Speaking; MiniMax untuk rubrik Writing. |
| **Layanan Sidecar AI** | [Python 3.12](https://www.python.org) + [FastAPI](https://fastapi.tiangolo.com) | Layanan pendamping audio neural sintetis ([Piper TTS](https://github.com/rhasspy/piper)) dan generator soal. |
| **Antrean Asinkron** | [BullMQ](https://bullmq.io) + [Redis](https://redis.io) | Pengolahan antrean evaluasi AI asinkron saat menghadapi beban asesmen massal. |
| **Penyimpanan Berkas Audio** | Disk Lokal / [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) / AWS S3 | Penyimpanan rekaman audio Speaking dengan verifikasi kepemilikan unggahan. |
| **Pengujian Kualitas** | [Vitest](https://vitest.dev) + [ESLint 9](https://eslint.org) | 100+ automated test suite (kontrak penilaian, audit rekaman, lifecycle worker). |

---

## 📂 Struktur Proyek

```text
prism/
├── app/                  # Routing Next.js App Router
│   ├── (auth)/           # Halaman login, register
│   ├── admin/            # Dasbor administrasi, analitik, dan kontrol penilaian
│   ├── api/              # API endpoints (auth, test, student, admin, upload, dll.)
│   └── student/          # Portal mahasiswa (test, hasil asesmen, vocab, writing, speaking)
├── components/           # Komponen UI modular
│   ├── admin/            # Komponen dasbor admin, modal retry, dan laci detail
│   ├── landing/          # Komponen antarmuka landing page publik
│   ├── student/          # Antarmuka ujian, latihan modul, dan audio recorder
│   └── ui/               # Komponen desain dasar (Button, Card, Badge, Dialog, dll.)
├── lib/                  # Logika inti, helper, dan integrasi backend
│   ├── ai-scoring-processor.ts # Pemrosesan skor AI terpadu
│   ├── auth.ts           # Tokenisasi JWT dan verifikasi hak akses
│   ├── prisma.ts         # Inisialisasi Prisma Client dengan pooling
│   ├── queue.ts          # Integrasi BullMQ & Redis
│   ├── scoring.ts        # Algoritma pembobotan skor dan pemetaan CEFR
│   ├── storage.ts        # Abstraksi penyimpanan (Lokal, R2, S3)
│   └── test-security.ts  # Audit keamanan dan deteksi pelanggaran ujian
├── prisma/               # Konfigurasi database
│   ├── schema.prisma     # Definisi model data relasional
│   ├── seed.ts           # Seeder bank soal placement test
│   └── seed-phase2.ts    # Seeder materi modul latihan mandiri
├── ai-engine/            # Layanan AI Sidecar (Python FastAPI)
│   ├── app/              # Router, konfigurasi model, dan handler Piper TTS
│   └── requirements.txt  # Dependensi Python
├── workers/              # Worker mandiri untuk pemrosesan antrean BullMQ
│   └── ai-evaluation.worker.ts
├── tests/                # Automated test suites (Vitest)
├── docs/                 # Dokumentasi teknis, PRD, dan panduan sistem
└── public/               # Aset statis & direktori unggahan lokal
```

---

## 🚀 Memulai Pengembangan Lokal

### Prasyarat Sistem
* **Node.js**: Versi `22.x` atau lebih baru
* **Package Manager**: `pnpm` versi `11.x` atau lebih baru
* **Database**: PostgreSQL versi `15` atau lebih baru
* **Python**: Versi `3.12+` *(wajib jika menjalankan AI Engine sidecar secara lokal)*
* **Redis**: Opsional *(hanya diperlukan jika mengaktifkan mode antrean BullMQ)*

---

### Langkah 1: Kloning Repositori & Instalasi Dependensi

```bash
git clone https://github.com/mrizalbasri/prism.git
cd prism
pnpm install
```

### Langkah 2: Konfigurasi Environment Variable

Salin berkas sampel `.env.example` menjadi `.env`:

```powershell
# Menggunakan PowerShell (Windows)
Copy-Item .env.example .env

# Atau Bash (Linux/macOS)
cp .env.example .env
```

Buka `.env` dan lengkapi konfigurasi dasar:
* Sesuaikan `DATABASE_URL` dengan kredensial PostgreSQL lokal Anda.
* Masukkan `JWT_SECRET` dengan string acak aman.
* Masukkan `GEMINI_API_KEY` (dan opsi `MINIMAX_API_KEY`) untuk mengaktifkan penilaian AI.

> [!TIP]
> Rincian lengkap seluruh variabel lingkungan tersedia pada bagian [Variabel Lingkungan](#-variabel-lingkungan-env).

### Langkah 3: Inisialisasi Database & Seeding Data Awal

Jalankan sinkronisasi skema Prisma dan muat data bank soal serta materi latihan:

```bash
# Generate client Prisma
pnpm exec prisma generate

# Sinkronkan skema ke database pengembangan
pnpm exec prisma db push

# Muat bank soal asesmen
pnpm seed

# Muat materi modul pembelajaran mandiri
pnpm seed:phase2
```

> [!CAUTION]
> Perintah `pnpm seed` dan `pnpm seed:phase2` menghapus dan mengisi ulang data soal dan modul. Jalankan hanya pada database pengembangan atau pengujian.

### Langkah 4: Jalankan Server Pengembangan

```bash
pnpm dev
```

Buka peramban Anda di **[http://localhost:3000](http://localhost:3000)**.

---

### Langkah 5 (Opsional): Menjalankan AI Engine Sidecar

AI Engine menangani sintesis audio listening (Piper TTS) dan pembuatan butir soal secara otomatis:

```powershell
cd ai-engine

# Siapkan virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1    # Linux/macOS: source .venv/bin/activate

# Instal dependensi Python
pip install -r requirements.txt

# Konfigurasi environment AI Engine
Copy-Item .env.example .env

# Jalankan server FastAPI
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Swagger UI AI Engine dapat diakses di **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**.

---

### Langkah 6 (Opsional): Menjalankan Worker Antrean BullMQ

Jika variabel `REDIS_URL` diisi pada `.env`, evaluasi AI akan dialihkan ke antrean asinkron. Jalankan worker terpisah:

```bash
pnpm exec tsx --env-file=.env workers/ai-evaluation.worker.ts
```

---

## ⚙️ Variabel Lingkungan (.env)

| Kategori | Variabel | Deskripsi | Default / Contoh |
| :--- | :--- | :--- | :--- |
| **Database** | `DATABASE_URL` | String koneksi PostgreSQL target | `postgresql://postgres:postgres@localhost:5432/prism?schema=public` |
| | `DATABASE_MAX_CONNECTIONS` | Batas pool koneksi Prisma | `2` (lokal), `10-20` (produksi) |
| **Keamanan** | `JWT_SECRET` | Kunci enkripsi tanda tangan JWT cookie | String acak rahasia (min. 32 karakter) |
| **AI Providers** | `LLM_PROVIDER` | Penyedia model teks aktif | `gemini` atau `minimax` |
| | `GEMINI_API_KEY` | API Key Google Gemini (wajib untuk audio speaking) | `AIzaSy...` |
| | `GEMINI_WRITING_MODEL` | Model penilaian esai | `gemini-2.0-flash` |
| | `GEMINI_SPEAKING_MODEL` | Model penilaian rekaman audio | `gemini-2.0-flash` |
| | `MINIMAX_API_KEY` | Kunci akses MiniMax via TokenRouter | Kunci API |
| | `MINIMAX_BASE_URL` | Endpoint base API MiniMax | `https://api.tokenrouter.com/v1` |
| | `MINIMAX_MODEL` | Model MiniMax untuk evaluasi teks | `MiniMax-M3` |
| **Sidecar Engine** | `AI_ENGINE_URL` | URL layanan FastAPI AI Engine | `http://127.0.0.1:8000` |
| | `AI_ENGINE_INTERNAL_KEY` | Kunci proteksi internal (*shared secret*) | String rahasia |
| **Antrean** | `REDIS_URL` | URL Redis untuk BullMQ (kosongkan untuk in-process) | `redis://localhost:6379` |
| **Storage Audio** | `R2_PUBLIC_URL` | Public HTTPS base URL Cloudflare R2 | `https://pub-xxx.r2.dev` |
| | `R2_BUCKET_NAME` | Nama bucket Cloudflare R2 | `prism-audio` |
| | `R2_ACCESS_KEY_ID` | Access Key ID Cloudflare R2 | String |
| | `R2_SECRET_ACCESS_KEY`| Secret Access Key Cloudflare R2 | String |

---

## 🛠️ Perintah Pengembangan (Scripts)

| Perintah | Deskripsi |
| :--- | :--- |
| `pnpm dev` | Menjalankan server aplikasi Next.js dalam mode pengembangan. |
| `pnpm build` | Membangun aset produksi (*production build*) Next.js yang teroptimasi. |
| `pnpm start` | Menjalankan server Next.js dari hasil build produksi. |
| `pnpm lint` | Memeriksa kepatuhan gaya kode dan potensi bug dengan ESLint. |
| `pnpm test` | Menjalankan seluruh rangkaian tes otomatis menggunakan Vitest. |
| `pnpm exec tsc --noEmit` | Memeriksa integritas tipe TypeScript di seluruh berkas proyek. |
| `pnpm seed` | Mereset dan mengisi ulang bank soal placement test. |
| `pnpm seed:phase2` | Mereset dan mengisi ulang materi latihan (Vocabulary, Writing, Speaking). |

---

## 🧪 Pengujian & Kualitas Kode

Sistem dilengkapi rangkaian pengujian otomatis yang ketat untuk memastikan keandalan penilaian dan keamanan akses:

```bash
# Menjalankan suite pengujian Vitest
pnpm test

# Menjalankan pemeriksaan tipe TypeScript
pnpm exec tsc --noEmit

# Menjalankan linter
pnpm lint
```

**Cakupan pengujian meliputi:**
* **Kontrak Penilaian AI**: Menjamin nilai selalu numerik (0–100) dan tidak pernah menggunakan angka acak jika terjadi kegagalan.
* **Keamanan Unggahan Rekaman**: Memverifikasi kepemilikan audio (`AUDIO_UPLOADED`) dan memblokir upaya *path traversal* atau URL audio eksternal yang tidak sah.
* **Atomic Retry & Worker Lifecycle**: Memastikan transisi status FAILED ke PROCESSING berjalan atomik tanpa merusak state jawaban yang sudah ada.
* **Role-Based Access Control**: Pengujian proteksi route mahasiswa aktif dan hak akses admin.

---

## 📖 Dokumentasi Lengkap

Dokumentasi arsitektur dan spesifikasi mendalam tersedia pada direktori [`docs/`](docs/README.md):

* 📘 **[Panduan Instalasi & Operasional Detail](docs/guides/SETUP.md)**: Panduan langkah demi langkah lingkungan dev dan opsi worker.
* 🛡️ **[Spesifikasi Keandalan Penilaian & Retry](docs/guides/SCORING_RELIABILITY.md)**: Arsitektur ketahanan penilaian AI, audit audio, dan mekanisme perbaikan kegagalan.
* ⚡ **[Dokumentasi AI Engine (Python)](ai-engine/README.md)**: Pengaturan sidecar FastAPI dan model Piper TTS lokal.
* 📋 **[Product Requirements Document (PRD)](docs/product/PRISM_PRD_v2.md)**: Visi produk, alur pengguna, dan roadmap pengembangan.
* 🏗️ **[Analisis Arsitektur Codebase](docs/architecture/codebase_analysis.md)**: Catatan desain arsitektural dan pemisahan modul.

---

## 🤝 Kontribusi & Standar Pengembangan

Kami menyambut baik perbaikan dan peningkatan fitur melalui Pull Request dengan mengikuti pedoman berikut:

1. **Percabangan (Branching)**: Buat branch fitur dari `main` dengan format penamaan `<tipe>/<deskripsi-singkat>` (contoh: `feat/speaking-wave-visualizer`, `fix/audio-timeout-guard`).
2. **Pesan Commit**: Gunakan format [Conventional Commits](https://www.conventionalcommits.org/):
   * `feat: tambah visualisasi radar CEFR`
   * `fix: tangani timeout koneksi scoring worker`
   * `docs: perbarui panduan variabel lingkungan`
3. **Verifikasi Kualitas**: Pastikan `pnpm lint`, `pnpm exec tsc --noEmit`, dan `pnpm test` berhasil tanpa error sebelum mengajukan perubahan.
4. **Keamanan Data**: Dilarang menyertakan berkas kredensial (`.env`), rahasia API, atau data pribadi ke dalam repositori.

---

<div align="center">
  <p>© 2026 PRISM Platform. Dikembangkan untuk kemajuan ekosistem pendidikan tinggi.</p>
</div>
