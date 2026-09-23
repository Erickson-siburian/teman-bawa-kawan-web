\# Teman Bawa Kawan (TBK) — Platform Komunitas Pegiat Media Sosial



Wadah kolaboratif dan gotong royong bagi para konten kreator serta pegiat media sosial di Indonesia untuk saling mendukung perkembangan akun/channel di 11 platform utama.



\---



\## 🚀 Panduan Deploy ke Vercel (vercel.app)



Proyek ini telah dikonfigurasi secara optimal dengan `vercel.json` dan Vite build yang siap dideploy langsung ke \*\*Vercel\*\* hanya dalam beberapa menit.



\### Metode 1: Melalui GitHub (Paling Direkomendasikan \& Otomatis)



1\. \*\*Ekspor Proyek ke GitHub\*\*:

&#x20;  - Di Google AI Studio, klik menu \*\*Settings\*\* / \*\*Export\*\* di pojok kanan atas.

&#x20;  - Pilih \*\*Export to GitHub\*\* (atau Download ZIP lalu push ke repository GitHub baru).

2\. \*\*Buka Vercel\*\*:

&#x20;  - Masuk ke dashboard \[vercel.com](https://vercel.com) (login dengan akun GitHub).

&#x20;  - Klik tombol \*\*"Add New..."\*\* lalu pilih \*\*"Project"\*\*.

3\. \*\*Import Repository\*\*:

&#x20;  - Pilih repository GitHub proyek Teman Bawa Kawan yang baru saja Anda buat.

4\. \*\*Konfigurasi Project di Vercel\*\*:

&#x20;  - \*\*Framework Preset\*\*: Pilih \*\*Vite\*\* (biasanya terdeteksi otomatis).

&#x20;  - \*\*Root Directory\*\*: `./` (biarkan default).

&#x20;  - \*\*Build Command\*\*: `vite build` (sudah diatur otomatis oleh `vercel.json`).

&#x20;  - \*\*Output Directory\*\*: `dist` (sudah diatur otomatis oleh `vercel.json`).

5\. \*\*Klik "Deploy"\*\*:

&#x20;  - Vercel akan memproses build dalam waktu \~30 detik.

&#x20;  - Selesai! Website Anda akan aktif dengan domain publik gratis seperti `nama-proyek.vercel.app`.



\---



\### Metode 2: Menggunakan Vercel CLI (Lewat Terminal/Command Prompt)



Jika Anda mendownload file proyek sebagai file ZIP di komputer:



1\. Ekstrak file ZIP dan buka folder proyek melalui Terminal / Command Prompt:

&#x20;  ```bash

&#x20;  cd folder-proyek-tbk

&#x20;  ```

2\. Pasang Vercel CLI secara global (jika belum ada):

&#x20;  ```bash

&#x20;  npm install -g vercel

&#x20;  ```

3\. Login ke akun Vercel Anda:

&#x20;  ```bash

&#x20;  vercel login

&#x20;  ```

4\. Jalankan perintah deploy:

&#x20;  ```bash

&#x20;  vercel

&#x20;  ```

&#x20;  Ikuti petunjuk di terminal (tekan Enter untuk opsi default).

5\. Untuk deploy ke production (domain utama):

&#x20;  ```bash

&#x20;  vercel --prod

&#x20;  ```



\---



\## 💻 Menjalankan di Komputer Lokal



```bash

\# Pasang dependencies

npm install



\# Jalankan dev server lokal

npm run dev



\# Jalankan build production lokal

npm run build

```



