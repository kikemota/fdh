# Fuentelespino de Haro · App del pueblo

App web instalable (PWA) para los vecinos y visitantes de Fuentelespino de Haro (Cuenca).

## Qué incluye este primer prototipo

- **Inicio**: último aviso, el tiempo, próximo evento, accesos rápidos y redes del pueblo.
- **Avisos y bandos**: lista de avisos con formulario de publicación en modo demostración (se guarda solo en el móvil de quien publica).
- **Agenda**: fiestas de San Antonio de Padua y Corpus Christi, Iranzada, Marcha MTB, Legua Castellana y Torneo de Pádel Vida.
- **El pueblo**: historia, datos, personajes, yacimientos, alrededores y mapa.
- **Teléfonos de interés**: con un toque para llamar.
- Funciona sin conexión y se puede instalar en la pantalla de inicio de Android e iPhone.

El contenido inicial procede de [fuentelespinodeharo.net](https://www.fuentelespinodeharo.net/). Los avisos marcados como "Ejemplo" son de demostración.

## Desarrollo

```bash
npm install
npm run dev      # servidor local
npm run build    # genera la versión de producción en dist/
```

Hecho con Vite, React y TypeScript. El tiempo se obtiene de [Open-Meteo](https://open-meteo.com/) con enlace a la predicción de AEMET.

## Publicación

Cada cambio en `main` se publica automáticamente en GitHub Pages mediante `.github/workflows/deploy.yml`. Hay que activarlo una vez en **Settings → Pages → Source: GitHub Actions**.

## Próximos pasos

- Panel de administración real con base de datos (Supabase o Firebase) para publicar avisos y eventos.
- Notificaciones push para avisos urgentes.
- Galería de fotos y fechas concretas de los eventos de 2027.
