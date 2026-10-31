// Service Worker für Rebel Repair PWA
const CACHE_NAME = 'rebel-repair-v1'
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.ts',
  '/src/style.css',
  '/src/types/index.ts',
  '/src/data/ships.ts',
  '/src/data/faults.ts',
  '/src/data/parts.ts',
  '/src/data/missions.ts',
  '/src/game/GameStateManager.ts',
  '/src/game/TestFlight.ts',
  '/src/ui/Renderer.ts',
  '/src/utils/storage.ts',
  '/public/manifest.json',
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-128.png',
  '/icons/icon-144.png',
  '/icons/icon-152.png',
  '/icons/icon-192.png',
  '/icons/icon-384.png',
  '/icons/icon-512.png',
  '/icons/icon-192.svg',
]

// Install: Cache alle Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching assets')
        return cache.addAll(ASSETS_TO_CACHE)
      })
      .then(() => {
        console.log('Assets cached successfully')
        // Skip waiting to activate the new service worker immediately
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Failed to cache assets:', error)
      })
  )
})

// Activate: Lösche alte Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`Deleting old cache: ${cacheName}`)
            return caches.delete(cacheName)
          }
        })
      )
    })
    .then(() => {
      console.log('Service worker activated')
      // Claim clients to take control immediately
      return self.clients.claim()
    })
  )
})

// Fetch: Lade aus Cache oder Netzwerk
self.addEventListener('fetch', (event) => {
  // Ignoriere POST-Anfragen
  if (event.request.method !== 'GET') {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Wenn im Cache, zurückgeben
        if (cachedResponse) {
          return cachedResponse
        }

        // Sonst aus Netzwerk laden und cachen
        return fetch(event.request)
          .then((response) => {
            // Klone die Response für den Cache
            const responseClone = response.clone()
            
            // Cache nur erfolgreiche Responses
            if (response.status === 200) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone)
                })
            }
            
            return response
          })
          .catch(() => {
            // Falls Netzwerk fehlschlägt, versuche mit Fallback
            return caches.match('/index.html')
          })
      })
  )
})

// Message: Für Update-Hinweise
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Background Sync (falls verfügbar)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Hier könnte man Daten synchronisieren
      Promise.resolve()
    )
  }
})

// Push Notifications (für zukünftige Erweiterungen)
self.addEventListener('push', (event) => {
  const data = event.data?.json()
  
  if (data) {
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icons/icon-192.png',
        data: data.url ? { url: data.url } : {},
      })
    )
  }
})

// Notification Click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.notification.data?.url) {
    event.waitUntil(
      self.clients.openWindow(event.notification.data.url)
    )
  }
})
