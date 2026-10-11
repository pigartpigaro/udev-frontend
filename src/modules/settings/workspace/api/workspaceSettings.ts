import { apiRequest } from '../../../../shared/api/client'

export interface WorkspaceSettings {
  id: number
  name: string
  slug: string
}

export async function getWorkspaceSettings(): Promise<WorkspaceSettings> {
  const result = await apiRequest<{ workspace: WorkspaceSettings }>('/api/v1/workspaces/current')
  return result.workspace
}

export async function updateWorkspaceSettings(name: string): Promise<WorkspaceSettings> {
  const result = await apiRequest<{ workspace: WorkspaceSettings }>('/api/v1/workspaces/current', {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  })
  return result.workspace
}
