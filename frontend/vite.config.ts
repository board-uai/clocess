import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
 export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    return {
      plugins: [react(), tailwindcss()],
      /* must match "paths" in tsconfig.app.json */
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
      },
      server: {
        host: true,
        proxy: {
          // xfwd passes the client ip on, the backend rate limits by it
          '/api': { target: env.VITE_BACKEND_URL, changeOrigin: true, xfwd: true },
        },
      },
    }
  })
