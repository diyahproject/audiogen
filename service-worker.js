// Nama cache unik untuk versi aplikasi saat ini.
// Ubah nama ini setiap kali Anda memperbarui file untuk memicu pembaruan cache.
const CACHE_NAME = 'suara-gemini-cache-v1';

// Daftar URL aset inti yang akan di-cache saat instalasi.
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/services/geminiService.ts',
  '/utils/audioUtils.ts',
  '/constants.ts',
  '/promptStyles.ts',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
  'https://unpkg.com/lamejs@1.2.1/lame.min.js'
];

// Event listener untuk 'install': di-trigger saat service worker diinstal.
self.addEventListener('install', (event) => {
  // Menunda event instalasi sampai cache dibuka dan semua aset inti ditambahkan.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache dibuka, menambahkan aset inti...');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch(error => {
        console.error('Gagal melakukan precache aset:', error);
      })
  );
});

// Event listener untuk 'activate': di-trigger saat service worker diaktifkan.
// Berguna untuk membersihkan cache lama.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Menghapus semua cache yang tidak cocok dengan CACHE_NAME saat ini.
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Event listener untuk 'fetch': mencegat semua permintaan jaringan.
self.addEventListener('fetch', (event) => {
  // Menggunakan strategi 'cache-first':
  // 1. Coba cari respons dari cache.
  // 2. Jika tidak ada di cache, lanjutkan ke jaringan.
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Jika respons ditemukan di cache, kembalikan.
        if (response) {
          return response;
        }
        // Jika tidak, lakukan permintaan jaringan.
        return fetch(event.request);
      })
  );
});
