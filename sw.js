// Service worker: caches the app shell and CDN libraries so the app opens offline.
// To ship an update, change VERSION. Installed copies fetch the new files and reload once.
const VERSION = 'bt-v4';
const SHELL = ['./', 'index.html', 'css/styles.css', 'js/app.js', 'js/firebase.js', 'firebase-config.js', 'manifest.json',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png'];
const CDN = [
  'https://cdn.tailwindcss.com/3.4.17',
  'https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js',
  'https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js',
  'https://cdn.jsdelivr.net/npm/framer-motion@10.18.0/dist/framer-motion.js',
  'https://cdn.jsdelivr.net/npm/htm@3.1.1/dist/htm.umd.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'
];
const CACHEABLE_HOSTS = ['cdn.tailwindcss.com', 'cdn.jsdelivr.net', 'www.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(SHELL);
    await Promise.all(CDN.map(u => fetch(u, { mode: u.includes('gstatic') ? 'cors' : 'no-cors' }).then(r => c.put(u, r)).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  // Never cache live Firebase traffic (auth + Firestore); the SDK handles its own offline queue.
  if (/googleapis\.com$|firebaseio\.com$|firebaseapp\.com$/.test(u.hostname)) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put('index.html', copy)); return res; })
      .catch(() => caches.match('index.html')));
    return;
  }
  if (u.origin === location.origin || CACHEABLE_HOSTS.includes(u.hostname)) {
    e.respondWith(caches.match(r).then(hit => {
      const net = fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(r, copy)); } return res; }).catch(() => hit);
      return hit || net; // serve instantly from cache, refresh in the background
    }));
  }
});
