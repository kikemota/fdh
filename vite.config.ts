import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base relativa: la app funciona servida desde cualquier carpeta
export default defineConfig({
  base: './',
  plugins: [react()],
})
