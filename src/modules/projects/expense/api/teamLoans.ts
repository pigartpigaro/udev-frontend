import { apiRequest } from '../../../../shared/api/client'
import type { LoanPage, LoanPayload, LoanSummary, RepaymentPayload, TeamLoan, TeamMember } from '../types/teamLoan'
export const getTeamLoans = (search: string, page: number) => apiRequest<LoanPage>(`/api/v1/team-loans?search=${encodeURIComponent(search)}&page=${page}&per_page=20`)
export const getLoanSummary = () => apiRequest<LoanSummary>('/api/v1/team-loans/summary')
export async function getTeamMembers() { const result = await apiRequest<{ data: TeamMember[] }>('/api/v1/team-loans/members'); return { data: result.data.map((member) => ({ ...member, id: String(member.id) })) } }
export async function createTeamLoan(payload: LoanPayload) { return (await apiRequest<{ loan: TeamLoan }>('/api/v1/team-loans', { method: 'POST', body: JSON.stringify(payload) })).loan }
export async function repayTeamLoan(id: number, payload: RepaymentPayload) { return (await apiRequest<{ repayment: NonNullable<TeamLoan['repayments']>[number] }>(`/api/v1/team-loans/${id}/repayments`, { method: 'POST', body: JSON.stringify(payload) })).repayment }
export async function voidTeamLoan(id: number, reason: string) { return (await apiRequest<{ loan: TeamLoan }>(`/api/v1/team-loans/${id}/void`, { method: 'POST', body: JSON.stringify({ reason }) })).loan }
