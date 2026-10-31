# Dokumentasi PRISM

Panduan untuk menjalankan aplikasi, memahami alur produk, dan menelusuri implementasi.

## Pengembangan dan operasional

| Dokumen | Isi |
| --- | --- |
| [Pengembangan lokal](guides/SETUP.md) | Instalasi, database, environment, AI Engine, worker, dan pemecahan masalah. |
| [Penilaian dan penilaian ulang](guides/SCORING_RELIABILITY.md) | Kontrak penilaian, kegagalan AI, retry admin, dan akses audio. |
| [AI Engine](../ai-engine/README.md) | Menjalankan layanan pendamping Python/FastAPI. |

## Produk dan arsitektur

| Dokumen | Isi |
| --- | --- |
| [Product Requirements Document](product/PRISM_PRD_v2.md) | Tujuan produk, kebutuhan pengguna, dan ruang lingkup yang direncanakan. |
| [Analisis codebase](architecture/codebase_analysis.md) | Catatan struktur dan arsitektur aplikasi. |
| [Progress dan perbandingan retake](architecture/progress_tracking_and_retake_comparison.md) | Rancangan pelacakan hasil antarpercobaan. |
| [Spesifikasi prototipe](prototypes/prototype_design_specification.md) | Referensi desain prototipe. |

Dokumen produk, prototipe, dan rancangan mencatat kebutuhan atau keputusan pada saat penulisan. Gunakan source terkini untuk memastikan perilaku yang sudah tersedia. Riwayat spesifikasi teknis tersimpan di `superpowers/specs/`.

[Kembali ke README utama](../README.md)
