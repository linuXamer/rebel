// Main entry point for Rebel Repair
import { Renderer } from './ui/Renderer'

// Wait for DOM to be ready
console.log('🔄 Waiting for DOM...')

document.addEventListener('DOMContentLoaded', async () => {
  console.log('✅ DOM ready, initializing game...')
  
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
  
  if (!canvas) {
    console.error('❌ Canvas element not found!')
    const errorDiv = document.createElement('div')
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ff4444;
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-family: Arial;
      z-index: 10000;
    `
    errorDiv.textContent = 'Canvas-Element nicht gefunden. Bitte lade die Seite neu.'
    document.body.appendChild(errorDiv)
    return
  }

  console.log('✅ Canvas found, initializing renderer...')

  // Initialize renderer (async!)
  try {
    const renderer = new Renderer(canvas)
    console.log('✅ Renderer initialized successfully')
    console.log('🎮 Game is ready!')

    // Service Worker registration (for PWA)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(() => console.log('✅ ServiceWorker registered'))
          .catch(err => console.warn('⚠️ ServiceWorker registration failed:', err))
      })
    }

    // Offline notification
    window.addEventListener('load', () => {
      if (navigator.onLine) {
        caches.match('/').then(cache => {
          if (cache) {
            const notice = document.createElement('div')
            notice.style.cssText = `
              position: fixed;
              bottom: 20px;
              left: 20px;
              background: #00aaff;
              color: #fff;
              padding: 10px 20px;
              border-radius: 5px;
              z-index: 1000;
              opacity: 0;
              transition: opacity 0.5s;
            `
            notice.textContent = 'App ist offline verfügbar'
            document.body.appendChild(notice)
            setTimeout(() => {
              notice.style.opacity = '1'
              setTimeout(() => notice.style.opacity = '0', 2000)
              setTimeout(() => notice.remove(), 3000)
            }, 100)
          }
        })
      }
    })

    // Touch device detection
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouchDevice) {
      document.body.classList.add('touch-device')
      console.log('📱 Touch device detected')
    }

    // Prevent default touch behavior on canvas
    document.addEventListener('touchmove', (e) => {
      if (e.target === canvas) {
        e.preventDefault()
      }
    }, { passive: false })

  } catch (error) {
    console.error('❌ Initialization error:', error)
    const errorDiv = document.createElement('div')
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ff4444;
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-family: Arial;
      z-index: 10000;
      max-width: 80%;
    `
    errorDiv.textContent = `Initialisierungsfehler: ${error.message}\n\nBitte lade die Seite neu oder versuche einen anderen Browser.`
    document.body.appendChild(errorDiv)
  }
})
