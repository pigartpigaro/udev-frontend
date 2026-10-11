export type PaymentType = 'down_payment' | 'installment' | 'final'
export type PaymentMethod = 'cash' | 'bank_transfer' | 'other'
export type PaymentStatus = 'received' | 'voided'

export interface EligibleInvoice {
  id: number
  code: string
  amount: string
  received_total: string
  remaining_amount: string
  project: { id: number; code: string; name: string; customer: { id: number; code: string; name: string } }
}

export interface ProjectPayment {
  id: number
  code: string
  invoice_id: number
  invoice: EligibleInvoice
  payment_type: PaymentType
  amount: string
  received_at: string
  method: PaymentMethod
  reference: string | null
  notes: string | null
  status: PaymentStatus
  receiver?: { id: number; name: string }
  void_reason?: string | null
  voided_at?: string | null
  voider?: { id: number; name: string }
}

export interface PaymentPayload {
  invoice_id: number
  payment_type: PaymentType
  amount: string
  received_at: string
  method: PaymentMethod
  reference: string | null
  notes: string | null
}

export interface Paginated<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
