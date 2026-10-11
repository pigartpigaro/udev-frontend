import { apiRequest } from './client'

export interface MenuItem {
  key: string
  label: string
  route_name: string | null
  icon: string | null
  children: MenuItem[]
}

export async function getNavigation(): Promise<MenuItem[]> {
  const result = await apiRequest<{ menus?: MenuItem[] }>('/api/v1/navigation')
  return result.menus || []
}
