// Main entry point for Rebel Repair
// Wait for DOM to be fully ready before initializing

document.addEventListener('DOMContentLoaded', () => {
  console.log('🌐 DOM fully loaded and parsed')
  
  // Get canvas element
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
  
  if (!canvas) {
    console.error('❌ Canvas element not found!')
    showCriticalError('Canvas-Element nicht gefunden. Bitte lade die Seite neu.')
    return
  }

  console.log('✅ Canvas element found')

  // Initialize the game via dynamic import (ensures DOM is ready)
  import('./ui/Renderer.js')
    .then(({ Renderer }) => {
      console.log('✅ Renderer module loaded')
      new Renderer(canvas)
      console.log('✅ Game initialized successfully')
      console.log('🎮 Rebel Repair ist bereit!')

      // Set up Service Worker for PWA
      setupServiceWorker()

      // Set up offline notification
      setupOfflineNotification()

      // Detect touch devices
      detectTouchDevice()
    })
    .catch((error: unknown) => {
      console.error('❌ Failed to load Renderer module:', error)
      showCriticalError(`Modul-Ladefehler: ${error instanceof Error ? error.message : String(error)}`)
    })
})

function showCriticalError(message: string): void {
  const errorDiv = document.createElement('div')
  errorDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #ff4444;
    color: white;
    padding: 30px;
    border-radius: 15px;
    font-family: Arial, sans-serif;
    font-size: 18px;
    text-align: center;
    max-width: 80%;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
    z-index: 10000;
  `
  errorDiv.textContent = message
  
  const reloadBtn = document.createElement('button')
  reloadBtn.textContent = 'Seite neu laden'
  reloadBtn.style.cssText = `
    margin-top: 20px;
    padding: 10px 20px;
    background: #00FF88;
    color: black;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
  `
  reloadBtn.onclick = () => window.location.reload()
  
  errorDiv.appendChild(reloadBtn)
  document.body.appendChild(errorDiv)
}

function setupServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('✅ ServiceWorker registered'))
        .catch(err => console.warn('⚠️ ServiceWorker registration failed:', err))
    })
  }
}

function setupOfflineNotification(): void {
  window.addEventListener('load', () => {
    if (navigator.onLine && 'caches' in window) {
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
            font-family: Arial, sans-serif;
          `
          notice.textContent = '📱 App ist offline verfügbar'
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
}

function detectTouchDevice(): void {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  if (isTouchDevice) {
    document.body.classList.add('touch-device')
    console.log('📱 Touch device detected')
  }
  
  // Prevent default touch behavior on canvas
  document.addEventListener('touchmove', (e) => {
    const canvas = document.getElementById('game-canvas')
    if (canvas && e.target === canvas) {
      e.preventDefault()
    }
  }, { passive: false })
}
