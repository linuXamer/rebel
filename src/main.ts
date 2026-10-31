import { Renderer } from './ui/Renderer'


// Warten bis DOM bereit ist
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
  
  if (!canvas) {
    console.error('Canvas element not found')
    return
  }

  // Renderer initialisieren
  new Renderer(canvas)

  // Service Worker registrieren (für PWA)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registration successful')
          
          // Update-Hinweis
          registration.onupdatefound = () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.onstatechange = () => {
                if (newWorker.state === 'installed') {
                  // Neue Version verfügbar
                  console.log('New version available')
                  
                  // Hinweis anzeigen
                  const updateNotice = document.createElement('div')
                  updateNotice.style.position = 'fixed'
                  updateNotice.style.bottom = '20px'
                  updateNotice.style.right = '20px'
                  updateNotice.style.backgroundColor = '#00ff88'
                  updateNotice.style.color = '#000'
                  updateNotice.style.padding = '10px 20px'
                  updateNotice.style.borderRadius = '5px'
                  updateNotice.style.cursor = 'pointer'
                  updateNotice.style.zIndex = '1000'
                  updateNotice.textContent = 'Neue Version verfügbar - Klicken zum Neuladen'
                  updateNotice.onclick = () => {
                    window.location.reload()
                  }
                  document.body.appendChild(updateNotice)
                }
              }
            }
          }
        })
        .catch(err => {
          console.log('ServiceWorker registration failed: ', err)
        })
    })
  }

  // Offline-Hinweis
  window.addEventListener('load', () => {
    if (navigator.onLine) {
      // Prüfen ob die App offline verfügbar ist
      caches.match('/').then(cache => {
        if (cache) {
          const offlineNotice = document.createElement('div')
          offlineNotice.style.position = 'fixed'
          offlineNotice.style.bottom = '20px'
          offlineNotice.style.left = '20px'
          offlineNotice.style.backgroundColor = '#00aaff'
          offlineNotice.style.color = '#fff'
          offlineNotice.style.padding = '10px 20px'
          offlineNotice.style.borderRadius = '5px'
          offlineNotice.style.zIndex = '1000'
          offlineNotice.textContent = 'App ist offline verfügbar'
          document.body.appendChild(offlineNotice)
          
          setTimeout(() => {
            offlineNotice.style.opacity = '0'
            setTimeout(() => offlineNotice.remove(), 1000)
          }, 3000)
        }
      })
    }
  })

  // Touch-Detection für Mobile
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  if (isTouchDevice) {
    document.body.classList.add('touch-device')
  }

  // Verhindere Standard-Touch-Verhalten
  document.addEventListener('touchmove', (e) => {
    if (e.target === canvas) {
      e.preventDefault()
    }
  }, { passive: false })
})
