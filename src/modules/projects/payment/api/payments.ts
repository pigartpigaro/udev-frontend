import { apiRequest } from '../../../../shared/api/client'
import type { EligibleInvoice, Paginated, PaymentPayload, ProjectPayment } from '../types/payment'

export function getPayments(params: { search: string; page: number; perPage: number }): Promise<Paginated<ProjectPayment>> {
  return apiRequest(`/api/v1/payments?search=${encodeURIComponent(params.search)}&page=${params.page}&per_page=${params.perPage}`)
}

export async function getPayment(id: number): Promise<ProjectPayment> {
  const result = await apiRequest<{ payment: ProjectPayment }>(`/api/v1/payments/${id}`)
  return result.payment
}

export function getEligibleInvoices(search: string): Promise<Paginated<EligibleInvoice>> {
  return apiRequest(`/api/v1/payments/eligible-invoices?search=${encodeURIComponent(search)}&per_page=20`)
}

export async function createPayment(payload: PaymentPayload): Promise<ProjectPayment> {
  const result = await apiRequest<{ payment: ProjectPayment }>('/api/v1/payments', { method: 'POST', body: JSON.stringify(payload) })
  return result.payment
}

export async function voidPayment(id: number, reason: string): Promise<ProjectPayment> {
  const result = await apiRequest<{ payment: ProjectPayment }>(`/api/v1/payments/${id}/void`, { method: 'POST', body: JSON.stringify({ reason }) })
  return result.payment
}
