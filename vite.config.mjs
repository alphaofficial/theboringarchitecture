import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(({ mode }) => ({
    plugins: [viteReact()],
    publicDir: false,
    build: {
      emptyOutDir: false,
      sourcemap: true,
      outDir: 'public',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        input: resolve(__dirname, 'app/views/main.jsx'),
        output: {
          entryFileNames: 'app.js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
          dir: 'public',
          manualChunks: {
            react: ['react', 'react-dom', '@inertiajs/react'],
          },
        }
      }
    },
    mode,
    resolve: {
      alias: {
        '@': resolve(__dirname, './app')
      }
    },
  }))
