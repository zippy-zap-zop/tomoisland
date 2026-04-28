import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VITE_APP_URL': JSON.stringify('http://localhost:5173'),
    'import.meta.env.VITE_APP_URL': JSON.stringify('http://localhost:5173')
  }
})