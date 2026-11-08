import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json' with { type: 'json' }

// Versión visible en la app. Netlify define COMMIT_REF en sus compilaciones.
const build = (process.env.COMMIT_REF ?? 'local').slice(0, 7)

export default defineConfig({
  // Base relativa: la app funciona servida desde cualquier carpeta.
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_BUILD__: JSON.stringify(build),
    __APP_BUILT_AT__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    react(),
    VitePWA({
      // 'prompt': la versión nueva espera a que se pulse "Actualizar".
      registerType: 'prompt',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Fdh App · Fuentelespino de Haro',
        short_name: 'Fdh App',
        description: 'Avisos, agenda, teléfonos y todo sobre Fuentelespino de Haro (Cuenca).',
        lang: 'es',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#faf6ee',
        theme_color: '#8a5a1f',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Avisos y eventos: red primero y, sin conexión, la última copia guardada.
            urlPattern: ({ url }) => url.pathname.endsWith('/api/v1/contenido'),
            handler: 'NetworkFirst',
            options: { cacheName: 'fdh-contenido', networkTimeoutSeconds: 6 },
          },
        ],
      },
    }),
  ],
})
