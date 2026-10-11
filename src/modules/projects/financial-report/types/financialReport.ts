export interface FinancialReportFilters { dateFrom: string; dateTo: string; projectId: string }

export interface FinancialReportSummary {
  invoice_issued: string
  received: string
  project_expenses: string
  operational_expenses: string
  expenses: string
  cash_flow: string
  outstanding: string
  team_loans_issued: string
  team_loan_repayments: string
  team_loans_outstanding: string
  cash_available: string
}

export interface FinancialProjectRow {
  id: number
  code: string
  name: string
  invoice_issued: string
  received: string
  expenses: string
  cash_flow: string
  outstanding: string
}

export interface FinancialReportResponse {
  summary: FinancialReportSummary
  projects: { data: FinancialProjectRow[]; current_page: number; last_page: number; per_page: number; total: number }
  filters: { date_from: string | null; date_to: string | null; project_id: number | null }
}
