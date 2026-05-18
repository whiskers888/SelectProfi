const STORAGE_KEY = 'selectprofi.auth.session'

export interface AuthSession {
    accessToken: string
    refreshToken: string
}

function isAuthSession(value: unknown): value is AuthSession {
    return (
        typeof value === 'object' &&
        value !== null &&
        typeof (value as Record<string, unknown>).accessToken === 'string' &&
        typeof (value as Record<string, unknown>).refreshToken === 'string'
    )
}

export function getAuthSession(): AuthSession | null {
    if (typeof window === 'undefined') return null

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    try {
        const parsed = JSON.parse(raw)
        return isAuthSession(parsed) ? parsed : null
    } catch {
        return null
    }
}

export function setAuthSession(session: AuthSession): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function removeAuthSession(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
}