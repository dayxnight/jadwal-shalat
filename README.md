# Jadwal Shalat 🕌

Aplikasi web untuk menampilkan jadwal shalat pribadi. Aplikasi ini dibangun dengan HTML, CSS, dan JavaScript vanilla, dan dapat bekerja offline dengan Progressive Web App (PWA).

## Deskripsi

**Jadwal Shalat** adalah aplikasi web yang memudahkan Anda untuk melihat jadwal waktu shalat. Aplikasi ini mendukung:

- 📱 **Progressive Web App (PWA)** - Bisa diinstall dan bekerja offline
- 🎨 **Interface yang responsif** - Bekerja di desktop, tablet, dan mobile
- ⚡ **Performa tinggi** - Memuat dengan cepat dan menggunakan resource minimal
- 🔄 **Service Worker** - Caching otomatis untuk pengalaman offline

## Teknologi yang Digunakan

- **HTML5** - Struktur markup
- **CSS3** - Styling dan responsive design
- **JavaScript (Vanilla)** - Fungsionalitas interaktif
- **Service Worker** - PWA capabilities dan offline support
- **Web Manifest** - PWA metadata

## Struktur Proyek

```
jadwal-shalat/
├── index.html          # File HTML utama
├── manifest.json       # PWA manifest
├── sw.js              # Service Worker
├── css/               # Folder untuk stylesheet
├── js/                # Folder untuk JavaScript
├── .github/           # GitHub workflows dan config
└── README.md          # File dokumentasi (ini)
```

## Cara Menggunakan

### Persyaratan

- Browser modern dengan support untuk:
  - ES6+ JavaScript
  - Service Workers
  - Web App Manifest

### Instalasi Lokal

1. Clone repository ini:
```bash
git clone https://github.com/dayxnight/jadwal-shalat.git
cd jadwal-shalat
```

2. Buka file `index.html` di browser Anda, atau gunakan local server:
```bash
# Menggunakan Python 3
python -m http.server 8000

# Atau gunakan Live Server jika menggunakan VS Code
```

3. Akses aplikasi di `http://localhost:8000`

### Menginstall sebagai PWA

1. Buka aplikasi di browser
2. Klik tombol **Install** (atau menu browser **Add to Home Screen**)
3. Aplikasi akan terinstall dan dapat diakses seperti aplikasi native

## Deployment ke GitHub Pages

### Metode 1: Deployment Manual (Recommended)

1. **Pastikan Anda sudah melakukan push ke GitHub**:
```bash
git add .
git commit -m "Prepare deployment"
git push origin main
```

2. **Aktifkan GitHub Pages di repository settings**:
   - Buka https://github.com/dayxnight/jadwal-shalat/settings
   - Scroll ke bagian **"Pages"** (atau **"GitHub Pages"**)
   - Pilih **Source**: `Deploy from a branch`
   - Pilih **Branch**: `main`
   - Pilih **Folder**: `/ (root)`
   - Klik **Save**

3. **GitHub akan otomatis deploy**:
   - Tunggu beberapa detik hingga 1 menit
   - Anda akan melihat URL aplikasi di section Pages: `https://dayxnight.github.io/jadwal-shalat`

### Metode 2: Deployment Otomatis dengan GitHub Actions

Jika ingin deployment otomatis setiap kali push ke main branch:

1. Buat folder `.github/workflows` jika belum ada:
```bash
mkdir -p .github/workflows
```

2. Buat file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

3. Commit dan push:
```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deployment workflow"
git push origin main
```

4. Deployment akan berjalan otomatis!

### Metode 3: Deploy ke Branch gh-pages

Jika ingin menggunakan branch terpisah:

1. Buat branch `gh-pages`:
```bash
git branch gh-pages
git push origin gh-pages
```

2. Di GitHub Settings > Pages:
   - Pilih Branch: `gh-pages`
   - Pilih Folder: `/ (root)`
   - Klik **Save**

## Konfigurasi Custom Domain (Opsional)

Jika Anda memiliki domain custom:

1. Di GitHub Settings > Pages:
   - Masukkan domain di field **Custom domain**
   - Contoh: `jadwal.example.com`

2. Update DNS records di registrar domain Anda:
   - Add `CNAME` record pointing ke: `dayxnight.github.io`
   - Atau gunakan `A` record dengan IP address GitHub

## Troubleshooting

### Pages tidak muncul

- ✅ Pastikan repository adalah **public**
- ✅ Pastikan file `index.html` ada di root directory
- ✅ Check di Settings > Pages apakah sudah benar dikonfigurasi
- ✅ Tunggu 1-5 menit untuk proses deployment

### Service Worker tidak bekerja

- ✅ Pastikan menggunakan HTTPS (GitHub Pages otomatis HTTPS)
- ✅ Check browser console untuk error messages
- ✅ Clear browser cache dan reload

### PWA tidak bisa diinstall

- ✅ Pastikan `manifest.json` sudah benar
- ✅ Pastikan aplikasi diakses via HTTPS
- ✅ Check browser console untuk validation errors

## Fitur Tambahan yang Bisa Dikembangkan

- [ ] API integrasi untuk data jadwal shalat real-time
- [ ] Notifikasi push untuk waktu shalat
- [ ] Support multiple locales/bahasa
- [ ] Dark mode
- [ ] Sinkronisasi dengan kalender
- [ ] Tracking history shalat

## Kontribusi

Kontribusi sangat diterima! Silakan:

1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## Lisensi

Project ini bebas digunakan. Silakan sesuaikan dengan kebutuhan Anda.

## Kontak & Support

- GitHub: [@dayxnight](https://github.com/dayxnight)
- Email: Hubungi melalui GitHub

---

**Live Demo**: https://jadwal-shalat-gold.vercel.app

**Repository**: https://github.com/dayxnight/jadwal-shalat
