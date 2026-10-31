# Pengembangan lokal PRISM

[Kembali ke dokumentasi](../README.md)

## Prasyarat

- Node.js 22+ dan pnpm 11+.
- Database PostgreSQL lokal yang sudah dibuat dan dapat diakses.
- Python untuk AI Engine; Dockerfile layanan menggunakan Python 3.12.
- Kredensial penyedia AI untuk menguji penilaian Writing/Speaking dan pembuatan soal.
- Redis hanya jika memakai antrean penilaian terpisah.

## Aplikasi web

Instal dependensi dari root repository:

```bash
pnpm install
```

Salin template environment dengan PowerShell:

```powershell
Copy-Item .env.example .env
```

Sesuaikan konfigurasi berikut di `.env`:

| Variabel | Penggunaan |
| --- | --- |
| `DATABASE_URL` | Koneksi database PostgreSQL pengembangan. Sesuaikan host, port, nama database, dan akun lokal. |
| `DATABASE_MAX_CONNECTIONS` | Batas koneksi database aplikasi. |
| `JWT_SECRET` | Rahasia acak untuk tanda tangan sesi autentikasi. |
| `GEMINI_API_KEY` | Kredensial Gemini; penilaian audio Speaking memakai jalur Gemini. |
| `GEMINI_WRITING_MODEL`, `GEMINI_SPEAKING_MODEL` | Model sesuai dukungan akun dan endpoint penyedia. |
| `MINIMAX_API_KEY`, `MINIMAX_BASE_URL`, `MINIMAX_MODEL` | Konfigurasi MiniMax untuk jalur penilaian teks. |
| `AI_ENGINE_URL` | Alamat layanan Python, secara lokal `http://127.0.0.1:8000`. |
| `AI_ENGINE_INTERNAL_KEY` | Rahasia komunikasi yang harus sama dengan `INTERNAL_API_KEY` pada AI Engine. |
| `REDIS_URL` | Kosongkan untuk pemrosesan penilaian lokal; isi untuk memakai BullMQ dan worker terpisah. |

`LLM_PROVIDER` juga tersedia dalam template. Pemilihan penyedia pada aplikasi web mengikuti implementasi masing-masing layanan; mengganti variabel ini saja tidak mengganti seluruh jalur penilaian. Untuk menguji penilaian lengkap beserta audio, siapkan Gemini dan periksa perilaku penyedia pada lingkungan yang dipakai.

Siapkan skema dan materi pada **database pengembangan baru**:

```bash
pnpm exec prisma generate
pnpm exec prisma db push
pnpm seed
pnpm seed:phase2
pnpm dev
```

`db push` menyinkronkan skema untuk pengembangan lokal. Kedua seeder menghapus dan mengisi ulang koleksi soal atau materi terkait; jangan jalankan pada database berisi data yang perlu dipertahankan. Seeder tersebut tidak membuat akun admin. Pendaftaran aplikasi digunakan untuk akun mahasiswa; penetapan peran admin perlu dilakukan melalui pengelolaan database yang terkontrol.

Aplikasi tersedia di [localhost:3000](http://localhost:3000).

## AI Engine

Pada terminal terpisah, jalankan dari direktori `ai-engine`:

```powershell
cd ai-engine
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Isi `INTERNAL_API_KEY` dengan nilai yang sama dengan `AI_ENGINE_INTERNAL_KEY` aplikasi web. Konfigurasi penyedia untuk pembuatan soal diatur terpisah di `ai-engine/.env`; variabel yang didukung dapat dilihat pada [`config.py`](../../ai-engine/app/core/config.py).

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Layanan menyediakan audio Piper dan pembuatan soal. Model suara disimpan di `ai-engine/models/piper`; pengunduhan awal memerlukan koneksi internet. Lihat [README AI Engine](../../ai-engine/README.md) untuk aktivasi virtual environment pada platform lain dan endpoint layanan.

## Worker penilaian opsional

Jika `REDIS_URL` diisi, jalankan Redis dan proses worker terpisah dari root repository dengan environment yang sama seperti aplikasi web:

```bash
pnpm exec tsx --env-file=.env workers/ai-evaluation.worker.ts
```

Tanpa `REDIS_URL`, aplikasi menjalankan penilaian di dalam proses aplikasi. Menetapkan URL Redis tidak otomatis menjalankan worker. Detail kegagalan dan retry tersedia di [panduan penilaian](SCORING_RELIABILITY.md).

## Penyimpanan audio

Secara lokal, rekaman disimpan di `public/uploads/audio`. Template root juga menyediakan konfigurasi Cloudflare R2 serta alternatif AWS S3. Untuk penyimpanan cloud, sesuaikan endpoint, bucket, kredensial, dan public URL HTTPS yang dapat dibaca server penilaian.

Pembuatan audio melalui jalur Edge TTS memiliki konfigurasi tersendiri di [`lib/tts.ts`](../../lib/tts.ts): `EDGE_TTS_URL`, `EDGE_TTS_KEY`, dan `EDGE_TTS_MODEL`. Sesuaikan hanya jika memakai jalur tersebut.

## Pemeriksaan

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm build
```

Lanjutkan dengan uji manual pendaftaran/login, enam bagian placement test, hasil, aktivasi modul, Vocabulary, Writing, Speaking, ekspor admin, dan penilaian ulang saat layanan AI gagal. Gunakan akun dan data uji.

## Pemecahan masalah

| Gejala | Pemeriksaan |
| --- | --- |
| Koneksi database gagal | Pastikan PostgreSQL aktif, database tersedia, dan `DATABASE_URL` sesuai. |
| Prisma Client belum tersedia | Jalankan `pnpm exec prisma generate` setelah instalasi atau perubahan skema. |
| AI Engine tidak dapat diakses | Periksa proses Python, `AI_ENGINE_URL`, serta kesamaan kedua rahasia internal. |
| Penilaian tetap menunggu | Jika Redis dikonfigurasi, pastikan worker aktif dan memakai environment yang sama. |
| Penilaian AI gagal | Periksa kredensial, akses model, konektivitas penyedia, dan keterbacaan rekaman; gunakan alur retry admin. |

File `.env`, rekaman runtime, dan model suara bukan bagian dari source yang perlu di-commit.
