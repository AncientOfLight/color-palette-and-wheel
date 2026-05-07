import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/nombre-de-tu-repositorio/', // <--- Asegúrate de que esto tenga el nombre exacto de tu repo entre barras
})
