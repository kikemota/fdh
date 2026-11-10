// Sustituto local de Netlify: sirve dist/ y la API de datos (en memoria) para probar de punta a punta.
// Uso: npm run build && npm run serve:local  (puerto 8888)
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { handle } from '../lib/api'
import { memoryKV } from '../lib/kv'

const kv = memoryKV()
const env = { sessionSecret: 'local-secret-'.padEnd(40, 'x'), setupCode: 'local-setup' }
const types: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json',
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  if (url.pathname.startsWith('/api/v1/')) {
    const chunks: Buffer[] = []
    for await (const c of req) chunks.push(c as Buffer)
    const r = await handle(
      new Request(url, { method: req.method, headers: req.headers as Record<string, string>, body: chunks.length ? Buffer.concat(chunks) : undefined }),
      kv,
      env,
    )
    res.writeHead(r.status, { 'content-type': 'application/json' })
    res.end(await r.text())
    return
  }
  const file = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1))
  try {
    const data = await readFile(join('dist', file))
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' })
    res.end(data)
  } catch {
    res.writeHead(404)
    res.end()
  }
}).listen(8888, () => console.log('Fdh App en local: http://localhost:8888 (código de configuración: local-setup)'))
