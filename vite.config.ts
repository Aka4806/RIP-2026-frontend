import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxy = {
    '/api': { target: env.API_TARGET || 'http://127.0.0.1:18084', changeOrigin: true },
    '/s3': {
      target: env.S3_TARGET || 'http://127.0.0.1:9000',
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/s3/, ''),
    },
  }
  return {
    plugins: [react()],
    server: { host: '127.0.0.1', port: 3006, strictPort: true, proxy },
    preview: { host: '127.0.0.1', port: 3006, strictPort: true, proxy },
  }
})
