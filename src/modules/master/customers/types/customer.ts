export interface Customer {
  id: number
  code: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CustomerPayload {
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  is_active: boolean
}

export interface PaginatedCustomers {
  data: Customer[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
