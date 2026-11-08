# Penilaian dan penilaian ulang PRISM

Penilaian baru tidak memakai skor pengganti saat AI gagal. Skor keseluruhan dan komponen yang dikembalikan wajib angka 0–100. Komponen yang tidak tersedia tetap null; pronunciation tidak dinilai dari teks saja.

## Alur kegagalan

Jawaban disimpan sebelum penilaian. Worker dan jalur lokal memakai processor yang sama. BullMQ mencoba maksimal tiga kali dengan backoff yang sudah tersedia; status FAILED ditulis setelah percobaan terakhir. Tanpa Redis, kegagalan proses after() langsung menghasilkan FAILED. Hasil placement tidak diterbitkan sebelum seluruh jawaban yang dikirim berhasil dinilai. Jawaban kosong bernilai nol.

Admin dapat melihat latihan gagal pada panel Analytics, termasuk mahasiswa yang belum mengambil placement test, atau membuka detail mahasiswa pada daftar hasil. Tombol Muat ulang memperbarui daftar setelah penilaian berjalan. Tombol Ulangi penilaian tersedia untuk tes gagal dan daftar latihan writing/speaking gagal mahasiswa tersebut. Retry mengubah FAILED menjadi PROCESSING secara atomik, mencatat audit, dan memakai jawaban yang tersimpan. Bagian tes yang sudah memiliki penilaian tervalidasi tidak dinilai ulang.

POST /api/admin/scoring/retry menerima resourceType (TEST, WRITING, SPEAKING) dan resourceId. Respons: 202 diterima; 409 status tidak dapat diulang; 401 tidak login; 403 bukan admin; 400 input tidak valid. GET /api/admin/scoring/failed menyediakan maksimal 50 latihan gagal terbaru per jenis. Parameter userId opsional membatasi daftar ke mahasiswa tertentu.

Snapshot prompt/rubric latihan baru disimpan dalam scoringContext pada aiFeedbackJson. Untuk data lama tanpa snapshot, retry memakai prompt/scenario yang saat ini berelasi dengan jawaban. Hasil lama tidak dihitung ulang otomatis. scoringValidated pada feedback adalah penanda keberhasilan baru; status COMPLETED lama tetap dipertahankan.

## Audio dan akses

Upload baru mencatat kepemilikan melalui audit AUDIO_UPLOADED. Submit latihan dan penyimpanan jawaban placement menolak URL rekaman yang tidak tercatat milik mahasiswa. Rekaman lama yang sudah tersimpan pada response/session tetap dapat diproses saat retry; tidak dapat dipasang ulang melalui submit baru tanpa catatan upload.

Pembaca audio membatasi file lokal ke public/uploads/audio (termasuk realpath untuk menolak traversal/symlink keluar), dan audio cloud ke path audio/ di bawah R2_PUBLIC_URL atau AWS_S3_PUBLIC_URL HTTPS. URL berparameter, redirect, dan kredensial URL ditolak. Batas 10 MB diterapkan sebelum baca lokal serta saat streaming cloud; timeout cloud 15 detik. Konfigurasi cloud harus menyediakan public URL yang dapat dibaca server. Rekaman yang tidak terbaca menyebabkan gagal, bukan skor pengganti.

Akun nonaktif tidak dapat memakai sesi yang sudah login. Semua endpoint modul mensyaratkan mahasiswa aktif dan hasModuleAccess. Placement test tetap tidak mensyaratkan akses modul.

## Validasi sebelum pilot

Jalankan lint, vitest, TypeScript, dan build. Dengan database uji serta layanan AI: jalankan register/login, placement lengkap enam section, hasil, aktivasi modul, writing, speaking, dan retry admin setelah simulasi kegagalan AI. Cek rekaman cloud serta login mahasiswa yang kemudian suspended. Jangan gunakan data mahasiswa produksi untuk pengujian.

Redis tetap opsional. Jika REDIS_URL diisi, worker harus berjalan sebagai proses terpisah. Penyediaan service produksi, backup, dan deployment berada di tahap berikutnya.

## Hasil pemeriksaan implementasi

- 102 tes lulus (12 file), termasuk kontrak AI, batas audio, lifecycle worker, retry atomik, dan seluruh akses endpoint modul.
- TypeScript lulus. ESLint: 0 error, 7 warning pada kode yang sudah ada.
- Build produksi dengan webpack lulus. Validasi menggunakan dependensi versi yang sama dari checkout utama; build dijalankan dari salinan sementara di drive D karena instalasi di C kehabisan ruang dan junction lintas drive tidak didukung oleh build.
- Alur manual dengan database dan layanan AI nyata belum diverifikasi: worktree tidak memiliki .env.
- Tidak ada commit, push, atau perubahan bobot/ambang level.

## File untuk ditinjau dan di-commit

- `.env.example`
- `app/admin/dashboard/page.tsx`
- `app/api/admin/scoring/failed/route.ts`
- `app/api/admin/scoring/retry/route.ts`
- `app/api/speaking/scenarios/route.ts`
- `app/api/speaking/sessions/route.ts`
- `app/api/speaking/submit/route.ts`
- `app/api/student/result/route.ts`
- `app/api/test/save/route.ts`
- `app/api/test/submit/route.ts`
- `app/api/upload/route.ts`
- `app/api/vocabulary/cards/route.ts`
- `app/api/vocabulary/review/route.ts`
- `app/api/vocabulary/session/route.ts`
- `app/api/writing/prompts/route.ts`
- `app/api/writing/submissions/route.ts`
- `app/api/writing/submit/route.ts`
- `app/student/result/page.tsx`
- `app/student/speaking/page.tsx`
- `app/student/writing/page.tsx`
- `components/admin/FailedPracticeScoring.tsx`
- `components/admin/ResultDetailDrawer.tsx`
- `components/admin/ScoringRetryButton.tsx`
- `components/student/speaking/SpeakingHistory.tsx`
- `components/student/speaking/types.ts`
- `components/student/writing/WritingHistory.tsx`
- `components/student/writing/types.ts`
- `docs/guides/SCORING_RELIABILITY.md`
- `lib/ai-scoring-processor.ts`
- `lib/auth.ts`
- `lib/queue.ts`
- `lib/scoring-audio.ts`
- `lib/scoring.ts`
- `lib/storage.ts`
- `tests/auth-access.test.ts`
- `tests/module-access.test.ts`
- `tests/scoring-audio.test.ts`
- `tests/scoring-contract.test.ts`
- `tests/scoring-finalization.test.ts`
- `tests/scoring-processor.test.ts`
- `tests/scoring-retry.test.ts`
- `tests/scoring-worker.test.ts`
- `workers/ai-evaluation.worker.ts`
