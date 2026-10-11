<script setup lang="ts">
import AppIcon from '../../../../../shared/components/layout/AppIcon.vue'
import type { PaymentMethod, PaymentType, ProjectPayment } from '../../types/payment'

defineProps<{ payments: ProjectPayment[]; loading: boolean }>()
const emit = defineEmits<{ void: [payment: ProjectPayment]; print: [payment: ProjectPayment]; download: [payment: ProjectPayment] }>()
const money = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const date = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
const typeLabels: Record<PaymentType, string> = { down_payment: 'DP / Uang muka', installment: 'Termin / Cicilan', final: 'Pelunasan' }
const methodLabels: Record<PaymentMethod, string> = { cash: 'Tunai', bank_transfer: 'Transfer bank', other: 'Lainnya' }
</script>

<template>
  <div class="payment-list">
    <div v-if="loading" class="list-state">Memuat pembayaran...</div>
    <div v-else-if="!payments.length" class="list-state empty"><span><AppIcon name="wallet" :size="22" /></span><strong>Belum ada pembayaran</strong><small>Penerimaan DP, termin, dan pelunasan akan tampil di sini.</small></div>
    <template v-else>
      <div class="table-wrap"><table><thead><tr><th>Kode penerimaan</th><th>Invoice / Project</th><th>Jenis</th><th>Nominal</th><th>Tanggal / Metode</th><th>Status</th><th><span class="sr-only">Aksi</span></th></tr></thead><tbody>
        <tr v-for="payment in payments" :key="payment.id">
          <td><span class="payment-code">{{ payment.code }}</span><small v-if="payment.reference" class="subline">Ref. {{ payment.reference }}</small></td>
          <td><span class="project-cell"><strong>{{ payment.invoice.code }} · {{ payment.invoice.project.name }}</strong><small>{{ payment.invoice.project.code }} · {{ payment.invoice.project.customer.name }}</small></span></td>
          <td>{{ typeLabels[payment.payment_type] }}</td><td class="amount">{{ money.format(Number(payment.amount)) }}</td>
          <td><span class="project-cell"><strong>{{ date.format(new Date(`${payment.received_at}T00:00:00`)) }}</strong><small>{{ methodLabels[payment.method] }}</small></span></td>
          <td><span class="status" :class="payment.status"><i></i>{{ payment.status === 'received' ? 'Diterima' : 'Dikoreksi' }}</span></td>
          <td><div class="actions"><button type="button" :aria-label="`Cetak kuitansi ${payment.code}`" title="Cetak kuitansi" @click="emit('print', payment)"><AppIcon name="printer" :size="15" /></button><button type="button" :aria-label="`Download kuitansi ${payment.code}`" title="Download kuitansi PDF" @click="emit('download', payment)"><AppIcon name="download" :size="15" /></button><button v-if="payment.status === 'received'" class="void-button" type="button" :aria-label="`Koreksi ${payment.code}`" title="Koreksi penerimaan" @click="emit('void', payment)"><AppIcon name="rotate-ccw" :size="15" /></button><small v-else class="void-reason">{{ payment.void_reason }}</small></div></td>
        </tr>
      </tbody></table></div>
      <div class="payment-cards"><article v-for="payment in payments" :key="payment.id" class="payment-card">
        <div class="card-top"><div class="identity"><strong>{{ payment.code }}</strong><small>{{ date.format(new Date(`${payment.received_at}T00:00:00`)) }} · {{ methodLabels[payment.method] }}</small></div><span class="status" :class="payment.status"><i></i>{{ payment.status === 'received' ? 'Diterima' : 'Dikoreksi' }}</span></div>
        <div class="card-project"><strong>{{ payment.invoice.code }} · {{ payment.invoice.project.name }}</strong><small>{{ payment.invoice.project.code }} · {{ payment.invoice.project.customer.name }}</small></div>
        <div class="card-detail"><span>{{ typeLabels[payment.payment_type] }}<small v-if="payment.reference">Ref. {{ payment.reference }}</small></span><strong>{{ money.format(Number(payment.amount)) }}</strong></div>
        <div class="card-actions"><button type="button" @click="emit('print', payment)"><AppIcon name="printer" :size="14" /> Cetak kuitansi</button><button type="button" @click="emit('download', payment)"><AppIcon name="download" :size="14" /> PDF</button><button v-if="payment.status === 'received'" type="button" class="void-action" @click="emit('void', payment)"><AppIcon name="rotate-ccw" :size="14" /> Koreksi</button><span v-else class="void-note">Alasan koreksi: {{ payment.void_reason }}</span></div>
      </article></div>
    </template>
  </div>
</template>

<style scoped>
.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;text-align:left}th{padding:12px 14px;border-bottom:1px solid #ffffff12;color:#858c80;font-size:9px;font-weight:700;letter-spacing:.45px;text-transform:uppercase;white-space:nowrap}td{padding:13px 14px;border-bottom:1px solid #ffffff0c;color:#cbd0c6;font-size:10px;white-space:nowrap}tbody tr:last-child td{border-bottom:0}.payment-code{color:#d7efa9;font-weight:700}.subline,.project-cell small{display:block;margin-top:4px;color:#858c82;font-size:9px}.project-cell{display:grid;gap:4px}.project-cell strong{color:#ecefe9;font-size:10px;font-weight:600}.amount{color:#f0d56a;font-weight:700}.status{display:inline-flex;align-items:center;gap:6px;padding:5px 8px;border-radius:12px;background:#8bd74f16;color:#c4e69a;font-size:9px;white-space:nowrap}.status i{width:6px;height:6px;border-radius:50%;background:currentColor}.status.voided{background:#a7463c18;color:#ffb4a8}.actions{display:flex;align-items:center;gap:5px}.actions button{width:28px;height:28px;display:grid;place-items:center;border:1px solid #ffffff17;border-radius:6px;background:transparent;color:#adb4a7;cursor:pointer}.actions button:hover{background:#ffffff0c;color:#fff}.actions .void-button{color:#ffb4a8}.void-reason{display:block;max-width:160px;overflow:hidden;color:#ffb4a8;font-size:9px;text-overflow:ellipsis}.list-state{min-height:220px;display:grid;place-content:center;justify-items:center;gap:9px;color:#969d91;font-size:10px}.list-state.empty strong{color:#e4e8df;font-size:12px}.list-state.empty small{color:#92988e;font-size:10px}.list-state.empty>span{width:42px;height:42px;display:grid;place-items:center;border:1px solid #ffffff12;border-radius:12px;background:#ffffff08;color:#bdcf9b}.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}.payment-cards{display:none}
@media(max-width:760px){.table-wrap{display:none}.payment-cards{display:grid;gap:10px;padding:11px}.payment-card{min-width:0;padding:13px;border:1px solid #ffffff12;border-radius:10px;background:#ffffff03}.card-top{display:flex;align-items:center;gap:9px}.identity{min-width:0;display:grid;gap:4px}.identity strong{overflow:hidden;color:#d7efa9;font-size:11px;text-overflow:ellipsis;white-space:nowrap}.identity small{color:#858c82;font-size:9px}.card-top .status{margin-left:auto}.card-project{display:grid;gap:4px;margin-top:12px}.card-project strong,.card-project small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.card-project strong{color:#ecefe9;font-size:11px}.card-project small{color:#838a7e;font-size:9px}.card-detail{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:12px 0;padding:10px 0;border-top:1px solid #ffffff0d;border-bottom:1px solid #ffffff0d;color:#b6bcb2;font-size:10px}.card-detail span{display:grid;gap:4px}.card-detail small{color:#858c82;font-size:9px}.card-detail strong{color:#f0d56a;font-size:12px}.card-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px}.card-actions button{min-height:32px;display:flex;align-items:center;gap:5px;padding:0 8px;border:1px solid #ffffff17;border-radius:6px;background:transparent;color:#cbd0c6;font-size:9px;white-space:nowrap;cursor:pointer}.card-actions .void-action{color:#ffb4a8}.void-note{color:#ffb4a8;font-size:10px;line-height:1.5}}
</style>
