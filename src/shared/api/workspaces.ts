import { apiRequest } from './client'

export interface WorkspaceOption {
  id: number
  name: string
  slug: string
  role: string
  is_owner: boolean
}

export async function getWorkspaces(): Promise<WorkspaceOption[]> {
  const result = await apiRequest<{ workspaces: WorkspaceOption[] }>('/api/v1/workspaces')
  return result.workspaces
}
