import { apiRequest } from '../../../../shared/api/client'
import type { ExpensePage, ExpensePayload, ProjectExpense } from '../types/expense'

export function getExpenses(params: { search: string; page: number; perPage: number }): Promise<ExpensePage> {
  return apiRequest(`/api/v1/expenses?search=${encodeURIComponent(params.search)}&page=${params.page}&per_page=${params.perPage}`)
}
export async function createExpense(payload: ExpensePayload): Promise<ProjectExpense> {
  const result = await apiRequest<{ expense: ProjectExpense }>('/api/v1/expenses', { method: 'POST', body: JSON.stringify(payload) })
  return result.expense
}
export async function voidExpense(id: number, reason: string): Promise<ProjectExpense> {
  const result = await apiRequest<{ expense: ProjectExpense }>(`/api/v1/expenses/${id}/void`, { method: 'POST', body: JSON.stringify({ reason }) })
  return result.expense
}
export function getExpenseProjects(search: string) {
  return apiRequest<{ data: Array<{ id: number; code: string; name: string }> }>(`/api/v1/projects?search=${encodeURIComponent(search)}&per_page=20`)
}
