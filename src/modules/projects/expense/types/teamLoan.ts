export type PaymentMethod = 'cash' | 'bank_transfer' | 'other'
export interface TeamMember { id: string; name: string; username: string | null }
export interface LoanRepayment { id: number; code: string; amount: string; repaid_at: string; method: PaymentMethod; status: 'received' | 'voided'; notes: string | null }
export interface TeamLoan { id: number; code: string; borrower_id: number; borrower: TeamMember; amount: string; issued_at: string; due_at: string | null; purpose: string; method: PaymentMethod; reference: string | null; notes: string | null; status: 'open' | 'settled' | 'voided'; repaid_total: string | null; remaining_amount: string; repayments?: LoanRepayment[]; void_reason?: string | null }
export interface LoanPayload { borrower_id: string; amount: string; issued_at: string; due_at: string | null; purpose: string; method: PaymentMethod; reference: string | null; notes: string | null }
export interface RepaymentPayload { amount: string; repaid_at: string; method: PaymentMethod; reference: string | null; notes: string | null }
export interface LoanPage { data: TeamLoan[]; current_page: number; last_page: number; total: number }
export interface LoanSummary { cash_available: string; loans_disbursed: string; repayments_received: string; outstanding: string; borrower_balances: Array<{ id: number; name: string; username: string | null; outstanding: string }> }
