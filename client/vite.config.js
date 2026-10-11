import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    // During development, forward /api/* to the Express server so the
    // browser thinks everything comes from one origin (no CORS headaches).
    proxy: { '/api': 'http://localhost:3001' },
  },
})
