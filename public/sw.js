const CACHE = 'kvl-v2'
const STATIC = ['/', '/about', '/products', '/contact', '/offline']

self.addEventListener('install', e =>
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)))
)

self.addEventListener('activate', e =>
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
)

self.addEventListener('fetch', e => {
  // Only handle GET requests
  if (e.request.method !== 'GET') return

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached
      return fetch(e.request).catch(() => {
        // For navigation requests, fall back to offline page
        if (e.request.mode === 'navigate') {
          return caches.match('/offline')
        }
      })
    })
  )
})
