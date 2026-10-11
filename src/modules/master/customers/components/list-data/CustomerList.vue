<script setup lang="ts">
import type { Customer } from '../../types/customer'
import AppIcon from '../../../../../shared/components/layout/AppIcon.vue'

defineProps<{ customers: Customer[]; loading: boolean }>()
const emit = defineEmits<{ edit: [customer: Customer]; remove: [customer: Customer] }>()

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}
</script>

<template>
  <div class="customer-list">
    <div v-if="loading" class="list-state">Memuat data pelanggan...</div>
    <div v-else-if="!customers.length" class="list-state"><span class="empty-mark"><AppIcon name="users" :size="22" /></span><strong>Belum ada pelanggan</strong><span>Pelanggan yang ditambahkan akan tampil di sini.</span></div>
    <template v-else>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Kode</th><th>Pelanggan</th><th>Kontak</th><th>Email / Telepon</th><th>Status</th><th><span class="sr-only">Aksi</span></th></tr></thead>
          <tbody>
            <tr v-for="customer in customers" :key="customer.id">
              <td><span class="customer-code">{{ customer.code }}</span></td>
              <td><div class="customer-identity"><span class="customer-avatar">{{ initials(customer.name) }}</span><span class="identity-copy"><strong>{{ customer.name }}</strong><small>{{ customer.address || 'Alamat belum diisi' }}</small></span></div></td>
              <td>{{ customer.contact_name || '—' }}</td>
              <td><span class="contact-details">{{ customer.email || '—' }}<small>{{ customer.phone || 'Telepon belum diisi' }}</small></span></td>
              <td><span class="status-pill" :class="customer.is_active ? 'status-active' : 'status-inactive'"><i></i>{{ customer.is_active ? 'Aktif' : 'Nonaktif' }}</span></td>
              <td><div class="row-actions"><button type="button" aria-label="Edit pelanggan" title="Edit" @click="emit('edit', customer)"><AppIcon name="edit" :size="16" /></button><button type="button" class="delete-action" aria-label="Hapus pelanggan" title="Hapus" @click="emit('remove', customer)"><AppIcon name="trash" :size="16" /></button></div></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="customer-cards">
        <article v-for="customer in customers" :key="customer.id" class="customer-card">
          <div class="customer-card-top"><span class="customer-avatar">{{ initials(customer.name) }}</span><div class="identity-copy"><strong>{{ customer.name }}</strong><small>{{ customer.code }} · {{ customer.contact_name || 'Kontak belum diisi' }}</small></div><span class="status-pill" :class="customer.is_active ? 'status-active' : 'status-inactive'"><i></i>{{ customer.is_active ? 'Aktif' : 'Nonaktif' }}</span></div>
          <div class="customer-card-details"><span>{{ customer.email || 'Email belum diisi' }}</span><span>{{ customer.phone || 'Telepon belum diisi' }}</span></div>
          <div class="customer-card-actions"><button type="button" @click="emit('edit', customer)"><AppIcon name="edit" :size="15" /> Edit</button><button type="button" class="delete-action" @click="emit('remove', customer)"><AppIcon name="trash" :size="15" /> Hapus</button></div>
        </article>
      </div>
    </template>
  </div>
</template>

<style scoped>
.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;text-align:left}th{padding:12px 15px;border-bottom:1px solid #ffffff12;color:#8f968b;font-size:9px;font-weight:700;letter-spacing:.55px;text-transform:uppercase;white-space:nowrap}td{padding:13px 15px;border-bottom:1px solid #ffffff0b;color:#cbd0c8;font-size:11px}tbody tr:last-child td{border-bottom:0}tbody tr:hover{background:#ffffff04}.customer-code{color:#c5d99f;font:600 10px ui-monospace,monospace;white-space:nowrap}.customer-identity,.customer-card-top{display:flex;align-items:center;gap:10px}.customer-avatar{width:34px;height:34px;display:grid;place-items:center;flex:none;border:1px solid #9bc75e35;border-radius:10px;background:#8bd74f12;color:#c7e59a;font-size:10px;font-weight:700}.identity-copy{min-width:0;display:grid;gap:4px}.identity-copy strong{overflow:hidden;color:#eef0eb;font-size:11px;text-overflow:ellipsis;white-space:nowrap}.identity-copy small,.contact-details small{overflow:hidden;color:#858c82;font-size:9px;text-overflow:ellipsis;white-space:nowrap}.contact-details{display:grid;gap:4px}.status-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 8px;border:1px solid transparent;border-radius:20px;font-size:9px;font-weight:700;white-space:nowrap}.status-pill i{width:5px;height:5px;border-radius:50%;background:currentColor}.status-active{border-color:#9bd96e25;background:#8bd74f12;color:#b5df8a}.status-inactive{border-color:#ffffff14;background:#ffffff08;color:#a7aaa2}.row-actions{display:flex;justify-content:flex-end;gap:5px}.row-actions button,.customer-card-actions button{width:30px;height:30px;display:grid;place-items:center;border:1px solid transparent;border-radius:7px;background:transparent;color:#abb1a8;cursor:pointer}.row-actions button:hover,.customer-card-actions button:hover{border-color:#ffffff18;background:#ffffff09;color:#f1f2ef}.row-actions .delete-action:hover,.customer-card-actions .delete-action:hover{color:#ff9a8c}.list-state{min-height:220px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;color:#9da398;font-size:11px}.list-state strong{color:#e4e7e1;font-size:13px}.empty-mark{width:44px;height:44px;display:grid;place-items:center;margin-bottom:4px;border:1px solid #ffffff14;border-radius:13px;color:#c4d89e}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.customer-cards{display:none}
@media(max-width:760px){.table-wrap{display:none}.customer-cards{display:grid;gap:10px;padding:11px}.customer-card{padding:13px;border:1px solid #ffffff12;border-radius:10px;background:#ffffff03}.customer-card-top{gap:9px}.customer-card-top .status-pill{margin-left:auto}.customer-card-details{display:grid;gap:5px;margin:12px 0;padding:10px 0;border-top:1px solid #ffffff0d;border-bottom:1px solid #ffffff0d;color:#b6bcb2;font-size:10px}.customer-card-actions{display:flex;justify-content:flex-end;gap:8px}.customer-card-actions button{width:auto;height:31px;display:flex;gap:6px;padding:0 9px;font-size:10px}}
</style>
