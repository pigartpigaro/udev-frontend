export type ExpenseCategory = 'transport' | 'accommodation' | 'meals' | 'equipment' | 'software' | 'communication' | 'other'
export type ExpenseMethod = 'cash' | 'bank_transfer' | 'other'
export type ExpenseStatus = 'paid' | 'voided'

export interface ExpenseProject { id: number; code: string; name: string }
export interface ProjectExpense {
  id: number; code: string; project_id: number | null; project: ExpenseProject | null
  category: ExpenseCategory; paid_to: string; amount: string; spent_at: string
  method: ExpenseMethod; reference: string | null; notes: string | null; status: ExpenseStatus
  recorder?: { id: number; name: string }; void_reason?: string | null
  voided_at?: string | null; voider?: { id: number; name: string }
}
export interface ExpensePayload {
  project_id: number | null; category: ExpenseCategory; paid_to: string; amount: string
  spent_at: string; method: ExpenseMethod; reference: string | null; notes: string | null
}
export interface ExpensePage { data: ProjectExpense[]; current_page: number; last_page: number; total: number }
