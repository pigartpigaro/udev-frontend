<script setup lang="ts">
import AppIcon from '../../../../../shared/components/layout/AppIcon.vue'
import FormSelect from '../../../../../shared/components/form/FormSelect.vue'
import type { WorkspaceUser } from '../../api/users'

defineProps<{ users: WorkspaceUser[]; loading: boolean; changingId: number | null }>()
const emit = defineEmits<{ changeRole: [user: WorkspaceUser, role: 'admin' | 'member'] }>()
const roleOptions = [
  { value: 'member', label: 'Anggota' },
  { value: 'admin', label: 'Admin' },
]

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}
</script>

<template>
  <div class="users-list">
    <div v-if="loading && !users.length" class="list-state">Memuat pengguna...</div>
    <div v-else-if="!users.length" class="list-state"><span class="empty-mark"><AppIcon name="users" :size="22" /></span><strong>Belum ada pengguna</strong><span>Tambahkan anggota workspace untuk mulai berkolaborasi.</span></div>
    <template v-else>
      <div class="table-wrap"><table>
        <thead><tr><th>Pengguna</th><th>Email</th><th>Role workspace</th></tr></thead>
        <tbody><tr v-for="user in users" :key="user.id">
          <td><div class="user-identity"><span class="avatar">{{ initials(user.name) }}</span><span class="identity-copy"><strong>{{ user.name }}<i v-if="user.is_current">Anda</i><i v-else-if="user.is_owner">Pemilik</i></strong><small>@{{ user.username }}</small></span></div></td>
          <td class="email-cell">{{ user.email }}</td>
          <td><div class="role-cell"><span v-if="user.is_owner" class="owner-label"><AppIcon name="shield" :size="14" /> Pemilik</span><FormSelect v-else :id="`user-role-${user.id}`" :model-value="user.role" :options="roleOptions" :disabled="user.is_current || changingId === user.id" @update:model-value="emit('changeRole', user, $event as 'admin' | 'member')" /></div></td>
        </tr></tbody>
      </table></div>
      <div class="user-cards"><article v-for="user in users" :key="user.id" class="user-card">
        <div class="user-identity"><span class="avatar">{{ initials(user.name) }}</span><span class="identity-copy"><strong>{{ user.name }}<i v-if="user.is_current">Anda</i><i v-else-if="user.is_owner">Pemilik</i></strong><small>@{{ user.username }}</small></span></div>
        <p class="card-email">{{ user.email }}</p>
        <div class="card-role"><span>Role workspace</span><span v-if="user.is_owner" class="owner-label"><AppIcon name="shield" :size="14" /> Pemilik</span><FormSelect v-else :id="`user-role-mobile-${user.id}`" :model-value="user.role" :options="roleOptions" :disabled="user.is_current || changingId === user.id" @update:model-value="emit('changeRole', user, $event as 'admin' | 'member')" /></div>
      </article></div>
    </template>
  </div>
</template>

<style scoped>
.table-wrap{overflow-x:auto}table{width:100%;border-collapse:collapse;text-align:left}th{padding:12px 15px;border-bottom:1px solid #ffffff12;color:#8f968b;font-size:9px;font-weight:700;letter-spacing:.55px;text-transform:uppercase;white-space:nowrap}td{padding:12px 15px;border-bottom:1px solid #ffffff0b;color:#cbd0c8;font-size:11px}tbody tr:last-child td{border-bottom:0}.user-identity{display:flex;align-items:center;gap:10px;min-width:0}.avatar{width:35px;height:35px;display:grid;place-items:center;flex:none;border:1px solid #9bc75e35;border-radius:10px;background:#8bd74f12;color:#c7e59a;font-size:10px;font-weight:700}.identity-copy{min-width:0;display:grid;gap:4px}.identity-copy strong{display:flex;align-items:center;gap:7px;overflow-wrap:anywhere;color:#eef0eb;font-size:11px}.identity-copy strong i{flex:none;padding:3px 6px;border:1px solid #ffd64c28;border-radius:10px;color:#ddcb78;font-size:8px;font-style:normal;font-weight:600}.identity-copy small{overflow-wrap:anywhere;color:#858c82;font-size:9px}.email-cell{overflow-wrap:anywhere}.role-cell{width:155px}.role-cell :deep(.form-select),.card-role :deep(.form-select){min-height:36px;padding:7px 9px;font-size:10px}.owner-label{display:inline-flex;align-items:center;gap:6px;color:#e3cd7d;font-size:10px}.list-state{min-height:210px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;color:#9da398;font-size:11px}.list-state strong{color:#e4e7e1;font-size:13px}.empty-mark{width:44px;height:44px;display:grid;place-items:center;margin-bottom:4px;border:1px solid #ffffff14;border-radius:13px;color:#c4d89e}.user-cards{display:none}
@media(max-width:760px){.table-wrap{display:none}.user-cards{display:grid;gap:10px;padding:11px}.user-card{min-width:0;padding:13px;border:1px solid #ffffff12;border-radius:10px;background:#ffffff03}.card-email{margin:11px 0;padding:10px 0;border-top:1px solid #ffffff0d;border-bottom:1px solid #ffffff0d;overflow-wrap:anywhere;color:#b6bcb2;font-size:10px}.card-role{display:grid;grid-template-columns:minmax(0,1fr) minmax(125px,45%);align-items:center;gap:10px;color:#92988e;font-size:10px}}
</style>
