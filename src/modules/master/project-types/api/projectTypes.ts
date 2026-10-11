import { apiRequest } from '../../../../shared/api/client'
import type { PaginatedProjectTypes, ProjectType, ProjectTypePayload } from '../types/projectType'

export function getProjectTypes(options: { search: string; page: number; perPage: number; isActive?: boolean }): Promise<PaginatedProjectTypes> {
  const params = new URLSearchParams({ page: String(options.page), per_page: String(options.perPage) })
  if (options.search.trim()) params.set('search', options.search.trim())
  if (options.isActive !== undefined) params.set('is_active', options.isActive ? '1' : '0')
  return apiRequest<PaginatedProjectTypes>(`/api/v1/master/project-types?${params.toString()}`)
}

export async function createProjectType(payload: ProjectTypePayload): Promise<ProjectType> {
  const response = await apiRequest<{ project_type: ProjectType }>('/api/v1/master/project-types', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.project_type
}

export async function updateProjectType(id: number, payload: ProjectTypePayload): Promise<ProjectType> {
  const response = await apiRequest<{ project_type: ProjectType }>(`/api/v1/master/project-types/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return response.project_type
}
