import { apiRequest } from '../../../../shared/api/client'

export interface NewUserPayload {
  name: string
  username: string
  email: string
  password: string
  password_confirmation: string
}

export interface CreatedUser {
  id: number
  name: string
  username: string
  email: string
  role: string
}

export interface WorkspaceUser extends CreatedUser {
  role: 'admin' | 'member'
  is_owner: boolean
  is_current: boolean
}

export interface PaginatedUsers {
  data: WorkspaceUser[]
  current_page: number
  last_page: number
  total: number
}

export async function getUsers(options: { search: string; page: number; perPage: number }): Promise<PaginatedUsers> {
  const params = new URLSearchParams({ page: String(options.page), per_page: String(options.perPage) })
  if (options.search.trim()) params.set('search', options.search.trim())
  return apiRequest<PaginatedUsers>(`/api/v1/access-control/users?${params.toString()}`)
}

export async function updateUserRole(id: number, role: 'admin' | 'member'): Promise<WorkspaceUser> {
  const result = await apiRequest<{ user: WorkspaceUser }>(`/api/v1/access-control/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
  return result.user
}

export async function createUser(payload: NewUserPayload): Promise<CreatedUser> {
  const result = await apiRequest<{ user: CreatedUser }>('/api/v1/access-control/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return result.user
}
