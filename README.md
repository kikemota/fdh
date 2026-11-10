# Fdh App · Fuentelespino de Haro

App web instalable (PWA) para los vecinos y visitantes de Fuentelespino de Haro (Cuenca): avisos y bandos, agenda en calendario, el pueblo, teléfonos de interés y el tiempo.

Para ver la app no hace falta cuenta. Las cuentas son solo para quien publica avisos y eventos.

## Qué incluye

- **Inicio**: último aviso, el tiempo, próximo evento, accesos rápidos y redes del pueblo.
- **Avisos y bandos**: los publican los editores desde **Gestión** y los ve todo el mundo.
- **Agenda**: calendario mensual, detalle por día y botón para añadir cada evento al calendario del móvil.
- **El pueblo**: historia, datos, personajes, yacimientos, alrededores y mapa.
- **Teléfonos de interés**: con un toque para llamar.
- **Gestión** (con sesión): publicar, editar y borrar avisos y eventos; invitar personas y cambiar su rol; cambiar nombre y contraseña; cerrar sesión en todos los dispositivos.

El contenido inicial procede de [fuentelespinodeharo.net](https://www.fuentelespinodeharo.net/). La primera vez que la app lee la base de datos, la llena con ese contenido.

## Cómo funciona

Todo corre en Netlify, igual que MonTalks:

- **La app**: Vite + React + TypeScript, instalable con `vite-plugin-pwa`.
- **El servidor**: una Netlify Function en `/api/v1` (`netlify/functions/api.mts`, lógica en `netlify/lib/`).
- **Los datos**: Netlify Blobs (almacén `fdh`). Avisos, eventos, cuentas e invitaciones.

La app pide avisos y eventos al abrirse, al volver a ella y cada 5 minutos. Sin conexión muestra la última copia guardada en el móvil.

### Cuentas y roles

- **Administrador**: publica y gestiona personas.
- **Editor**: publica y edita avisos y eventos.

No hay servicio de correo: las invitaciones son enlaces que se copian y se envían a mano (WhatsApp, correo). Cada enlace sirve una vez y caduca en 14 días. Las contraseñas se guardan cifradas (scrypt) y la sesión dura 30 días.

### Versiones y actualizaciones

En el pie de Inicio y en **Gestión → Mi cuenta** se ve la versión instalada (`version` de `package.json`) y cuándo se compiló. Cuando Netlify publica una versión nueva, la app la detecta (al abrirse, al volver a primer plano y cada 30 minutos) y muestra el aviso **"Hay una versión nueva · Actualizar"**. Sube `version` en `package.json` con cada cambio que publiques.

## Puesta en marcha en Netlify

1. En Netlify, **Add new site → Import an existing project → GitHub** y elige `kikemota/fdh`. Netlify lee la configuración de `netlify.toml`; no hay que cambiar nada.
2. En **Site configuration → Environment variables**, añade:

   | Variable | Necesaria | Qué es |
   | --- | --- | --- |
   | `SESSION_SECRET` | sí | Al menos 32 caracteres aleatorios. Firma las sesiones; si la cambias, se cierran todas. |
   | `FDH_SETUP_CODE` | una vez | Un código que elijas. Sirve para crear la primera cuenta de administrador. |

3. Vuelve a publicar (**Deploys → Trigger deploy**).
4. Abre la app, toca **Acceso para editores → ¿Primera vez? Configura Fdh App**, escribe el código y crea tu cuenta de administrador.
5. En **Gestión → Personas**, invita a quien vaya a publicar y envíale el enlace.

## Desarrollo

```bash
npm install
npm run dev          # servidor local (sin API: muestra el contenido inicial)
npm run build        # comprueba tipos y genera dist/ con el manifiesto y el service worker
npm run test:api     # pruebas de la API con almacenamiento en memoria
npm run serve:local  # tras build: app + API en http://localhost:8888 (código de configuración: local-setup)
```

## Próximos pasos

- Notificaciones push para avisos urgentes.
- Galería de fotos.
- Fechas de los eventos de 2027.
