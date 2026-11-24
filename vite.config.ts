import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxy = {
    '/api': { target: env.API_TARGET || 'http://127.0.0.1:18087', changeOrigin: true, xfwd: true },
    '/s3': {
      target: env.S3_TARGET || 'http://127.0.0.1:9000',
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/s3/, ''),
    },
  }
  const localServer = { host: '127.0.0.1', port: 3009, strictPort: true, proxy }
  return { plugins: [react()], server: localServer, preview: localServer }
})
