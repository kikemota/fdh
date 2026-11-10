import { getStore, type Store } from '@netlify/blobs'

/** Las operaciones de almacenamiento que usa la API: Netlify Blobs en producción, un Map en las pruebas. */
export interface KV {
  get<T>(key: string): Promise<T | null>
  set(key: string, value: unknown): Promise<void>
  /** Escribe solo si la clave no existe. Devuelve false si ya existía. */
  create(key: string, value: unknown): Promise<boolean>
  delete(key: string): Promise<void>
  list(prefix: string): Promise<string[]>
}

export function blobsKV(store: Store = getStore({ name: 'fdh', consistency: 'strong' })): KV {
  return {
    async get<T>(key: string) {
      return ((await store.get(key, { type: 'json' })) as T | null) ?? null
    },
    async set(key, value) {
      await store.setJSON(key, value)
    },
    async create(key, value) {
      const res = await store.setJSON(key, value, { onlyIfNew: true })
      return res.modified
    },
    async delete(key) {
      await store.delete(key)
    },
    async list(prefix) {
      const { blobs } = await store.list({ prefix })
      return blobs.map((b) => b.key)
    },
  }
}

export function memoryKV(): KV & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return {
    data,
    async get<T>(key: string) {
      const v = data.get(key)
      return v === undefined ? null : (JSON.parse(v) as T)
    },
    async set(key, value) {
      data.set(key, JSON.stringify(value))
    },
    async create(key, value) {
      if (data.has(key)) return false
      data.set(key, JSON.stringify(value))
      return true
    },
    async delete(key) {
      data.delete(key)
    },
    async list(prefix) {
      return [...data.keys()].filter((k) => k.startsWith(prefix)).sort()
    },
  }
}
