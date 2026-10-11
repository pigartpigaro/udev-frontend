import { apiRequest } from '../../../shared/api/client'

export interface CurrentUser {
  id: number
  name: string
  username: string
  email: string
  role: string
}

export async function login(username: string, password: string): Promise<void> {
  await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const result = await apiRequest<{ user: CurrentUser }>('/api/v1/auth/user')
    return result.user
  } catch {
    return null
  }
}

export async function logout(): Promise<void> {
  await apiRequest('/api/v1/auth/logout', { method: 'POST' })
}
