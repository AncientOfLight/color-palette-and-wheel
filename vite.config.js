import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/color-palette-and-wheel/', // <--- AGREGA ESTO EXACTAMENTE
})
