export type ApiMode = 'mock' | 'server'

const rawApiMode = (import.meta.env.VITE_API_MODE ?? 'server').toLowerCase()

export const apiMode: ApiMode = rawApiMode === 'mock' ? 'mock' : 'server'
export const isMockApiMode = apiMode === 'mock'
