import { apiRequest } from '../../../../shared/api/client'

export interface PermissionOption {
  id: number
  key: string
  label: string
  enabled: boolean
}

export async function getMemberPermissionOptions(): Promise<PermissionOption[]> {
  const result = await apiRequest<{ permissions: PermissionOption[] }>('/api/v1/access-control/roles/member/permission-options')
  return result.permissions
}

export async function saveMemberPermissions(permissionIds: number[]): Promise<void> {
  await apiRequest('/api/v1/access-control/roles/member/permissions', {
    method: 'PUT',
    body: JSON.stringify({ permission_ids: permissionIds }),
  })
}
