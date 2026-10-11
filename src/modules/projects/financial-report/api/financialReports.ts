import { apiRequest } from '../../../../shared/api/client'
import type { FinancialReportFilters, FinancialReportResponse } from '../types/financialReport'

export function getProjectFinancialReport(filters: FinancialReportFilters, page: number): Promise<FinancialReportResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: '50' })
  if (filters.dateFrom) params.set('date_from', filters.dateFrom)
  if (filters.dateTo) params.set('date_to', filters.dateTo)
  if (filters.projectId) params.set('project_id', filters.projectId)
  return apiRequest(`/api/v1/projects/reports/financial?${params.toString()}`)
}
