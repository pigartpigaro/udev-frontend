import type { Customer } from '../../../master/customers/types/customer'
import type { ProjectType } from '../../../master/project-types/types/projectType'

export const projectStatuses = ['draft', 'active', 'on_hold', 'completed', 'cancelled'] as const
export type ProjectStatus = typeof projectStatuses[number]

export const projectStatusLabels: Record<ProjectStatus, string> = {
  draft: 'Draft',
  active: 'Berjalan',
  on_hold: 'Ditunda',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

export interface Project {
  id: number
  code: string
  name: string
  customer_id: number
  project_type_id: number
  customer: Pick<Customer, 'id' | 'code' | 'name'>
  project_type: Pick<ProjectType, 'id' | 'code' | 'name'>
  start_date: string | null
  target_end_date: string | null
  status: ProjectStatus
  description: string | null
  application_url: string | null
  created_at: string
  updated_at: string
}

export interface ProjectPayload {
  name: string
  customer_id: number
  project_type_id: number
  start_date: string | null
  target_end_date: string | null
  status: ProjectStatus
  description: string | null
  application_url: string | null
}

export interface PaginatedProjects {
  data: Project[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
