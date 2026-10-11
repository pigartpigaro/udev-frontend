import { apiRequest } from '../../../../shared/api/client'
import type { InvoicePayload, InvoiceUpdatePayload, PaginatedInvoices, ProjectInvoice } from '../types/invoice'

export function getInvoices(params: { search: string; page: number; perPage: number }): Promise<PaginatedInvoices> {
  return apiRequest(`/api/v1/invoices?search=${encodeURIComponent(params.search)}&page=${params.page}&per_page=${params.perPage}`)
}
export async function getInvoice(id: number): Promise<ProjectInvoice> {
  const result = await apiRequest<{ invoice: ProjectInvoice }>(`/api/v1/invoices/${id}`)
  return result.invoice
}
export async function createInvoice(payload: InvoicePayload): Promise<ProjectInvoice> {
  const result = await apiRequest<{ invoice: ProjectInvoice }>('/api/v1/invoices', { method: 'POST', body: JSON.stringify(payload) })
  return result.invoice
}
export async function updateInvoice(id: number, payload: InvoiceUpdatePayload): Promise<ProjectInvoice> {
  const result = await apiRequest<{ invoice: ProjectInvoice }>(`/api/v1/invoices/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
  return result.invoice
}
export async function issueInvoice(id: number): Promise<ProjectInvoice> {
  const result = await apiRequest<{ invoice: ProjectInvoice }>(`/api/v1/invoices/${id}/issue`, { method: 'POST' })
  return result.invoice
}
export async function cancelInvoice(id: number, reason: string): Promise<ProjectInvoice> {
  const result = await apiRequest<{ invoice: ProjectInvoice }>(`/api/v1/invoices/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) })
  return result.invoice
}
