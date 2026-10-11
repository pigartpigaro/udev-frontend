import { apiRequest } from '../../../../shared/api/client'
import type { Customer, CustomerPayload, PaginatedCustomers } from '../types/customer'

export async function getCustomers(options: { search: string; page: number; perPage: number; isActive?: boolean }): Promise<PaginatedCustomers> {
  const params = new URLSearchParams({ page: String(options.page), per_page: String(options.perPage) })
  if (options.search.trim()) params.set('search', options.search.trim())
  if (options.isActive !== undefined) params.set('is_active', options.isActive ? '1' : '0')
  return apiRequest<PaginatedCustomers>(`/api/v1/customers?${params.toString()}`)
}

export async function createCustomer(payload: CustomerPayload): Promise<Customer> {
  const response = await apiRequest<{ customer: Customer }>('/api/v1/customers', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.customer
}

export async function updateCustomer(id: number, payload: CustomerPayload): Promise<Customer> {
  const response = await apiRequest<{ customer: Customer }>(`/api/v1/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return response.customer
}

export async function deleteCustomer(id: number): Promise<void> {
  await apiRequest<void>(`/api/v1/customers/${id}`, { method: 'DELETE' })
}
