export interface ProjectType {
  id: number
  code: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProjectTypePayload {
  name: string
  description: string | null
  is_active: boolean
}

export interface PaginatedProjectTypes {
  data: ProjectType[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
