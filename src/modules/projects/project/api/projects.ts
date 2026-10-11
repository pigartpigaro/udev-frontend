import { apiRequest } from '../../../../shared/api/client'
import type { PaginatedProjects, Project, ProjectPayload } from '../types/project'

export function getProjects(options: { search: string; page: number; perPage: number; status?: string }): Promise<PaginatedProjects> {
  const params = new URLSearchParams({ page: String(options.page), per_page: String(options.perPage) })
  if (options.search.trim()) params.set('search', options.search.trim())
  if (options.status) params.set('status', options.status)
  return apiRequest<PaginatedProjects>(`/api/v1/projects?${params.toString()}`)
}

export async function createProject(payload: ProjectPayload): Promise<Project> {
  const response = await apiRequest<{ project: Project }>('/api/v1/projects', {
    method: 'POST', body: JSON.stringify(payload),
  })
  return response.project
}

export async function updateProject(id: number, payload: ProjectPayload): Promise<Project> {
  const response = await apiRequest<{ project: Project }>(`/api/v1/projects/${id}`, {
    method: 'PATCH', body: JSON.stringify(payload),
  })
  return response.project
}
