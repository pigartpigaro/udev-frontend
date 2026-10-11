const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const baseUrl = (configuredBaseUrl || (typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:8010`
  : 'http://localhost:8010')).replace(/\/$/, '')
const activeWorkspaceKey = 'udev.active-workspace-id'

export function setActiveWorkspaceId(workspaceId: number | null): void {
  if (typeof window === 'undefined') return
  if (workspaceId === null) window.localStorage.removeItem(activeWorkspaceKey)
  else window.localStorage.setItem(activeWorkspaceKey, String(workspaceId))
}

function cookie(name: string): string | null {
  const item = document.cookie.split('; ').find((part) => part.startsWith(`${name}=`))
  return item ? decodeURIComponent(item.slice(name.length + 1)) : null
}

async function csrfToken(): Promise<string> {
  let token = cookie('XSRF-TOKEN')
  if (!token) {
    const response = await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) throw new Error('Tidak dapat mengambil token keamanan dari server.')
    token = cookie('XSRF-TOKEN')
  }
  if (!token) throw new Error('Token keamanan tidak diterima. Periksa alamat API dan konfigurasi cookie.')
  return token
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method || 'GET').toUpperCase()
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (typeof window !== 'undefined') {
    const workspaceId = window.localStorage.getItem(activeWorkspaceKey)
    if (workspaceId) headers.set('X-Workspace-ID', workspaceId)
  }

  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && !headers.has('X-XSRF-TOKEN')) {
    headers.set('X-XSRF-TOKEN', await csrfToken())
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    method,
    credentials: 'include',
    headers,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string; errors?: Record<string, string[]> }
    const validation = body.errors ? Object.values(body.errors).flat()[0] : undefined
    throw new Error(validation || body.message || `Permintaan gagal (${response.status})`)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
