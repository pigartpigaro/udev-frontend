import type { Project } from '../../project/types/project'

export type InvoiceStatus = 'draft' | 'issued' | 'cancelled'
export type BillingCycle = 'monthly' | 'one_time'

export interface ProjectInvoice {
  id: number
  code: string
  project_id: number
  project: Project
  billing_cycle: BillingCycle
  billing_period: string | null
  supersedes_invoice_id: number | null
  supersedes?: Pick<ProjectInvoice, 'id' | 'code'> | null
  replacement?: Pick<ProjectInvoice, 'id' | 'code'> | null
  amount: string
  issued_at: string
  due_at: string | null
  status: InvoiceStatus
  notes: string | null
  cancellation_reason?: string | null
  cancelled_at?: string | null
  created_at: string
  updated_at: string
}

export interface InvoicePayload {
  project_id: number
  billing_cycle: BillingCycle
  billing_period: string | null
  supersedes_invoice_id: number | null
  amount: string
  issued_at: string
  due_at: string | null
  notes: string | null
}

export type InvoiceUpdatePayload = Pick<InvoicePayload, 'billing_cycle' | 'billing_period' | 'amount' | 'issued_at' | 'due_at' | 'notes'>

export interface PaginatedInvoices {
  data: ProjectInvoice[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
