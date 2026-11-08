import type { Config } from '@netlify/functions'
import { handle } from '../lib/api'
import { blobsKV } from '../lib/kv'

// Variables de entorno en Netlify:
//   SESSION_SECRET   obligatoria, al menos 32 caracteres aleatorios (firma las sesiones)
//   FDH_SETUP_CODE   solo la primera vez, para crear la cuenta de administrador

export default async (req: Request) =>
  handle(req, blobsKV(), { sessionSecret: process.env.SESSION_SECRET ?? '', setupCode: process.env.FDH_SETUP_CODE })

export const config: Config = { path: '/api/v1/*' }
