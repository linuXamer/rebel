import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    // Ensure the server waits for all files to be ready
    strictPort: true,
    // Enable HMR for development
    hmr: {
      overlay: true,
    },
  },
  // Ensure proper handling of TypeScript and ESM
  esbuild: {
    target: ['es2020'],
    supported: {
      'top-level-await': true,
    },
  },
  // Optimize for production
  optimizeDeps: {
    include: ['pixi.js'],
  },
})
