<script setup lang="ts">
import type { FinancialProjectRow } from '../../types/financialReport'
defineProps<{ rows: FinancialProjectRow[]; loading: boolean }>()
const money = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 2 })
</script>

<template>
  <div class="report-list">
    <div v-if="loading && !rows.length" class="list-state">Memuat laporan...</div>
    <div v-else-if="!rows.length" class="list-state">Tidak ada project untuk ditampilkan.</div>
    <template v-else>
      <div class="table-wrap"><table><thead><tr><th>Project</th><th>Invoice terbit</th><th>Penerimaan</th><th>Pengeluaran project</th><th>Arus kas bersih</th><th>Sisa tagihan saat ini</th></tr></thead><tbody>
        <tr v-for="row in rows" :key="row.id"><td><span class="project"><strong>{{ row.name }}</strong><small>{{ row.code }}</small></span></td><td>{{ money.format(Number(row.invoice_issued)) }}</td><td>{{ money.format(Number(row.received)) }}</td><td>{{ money.format(Number(row.expenses)) }}</td><td class="flow" :class="{ negative: Number(row.cash_flow) < 0 }">{{ money.format(Number(row.cash_flow)) }}</td><td class="outstanding">{{ money.format(Number(row.outstanding)) }}</td></tr>
      </tbody></table></div>
      <div class="project-cards"><article v-for="row in rows" :key="row.id" class="project-card"><div class="card-heading"><strong>{{ row.name }}</strong><small>{{ row.code }}</small></div><div class="card-metrics"><span><small>Invoice terbit</small><strong>{{ money.format(Number(row.invoice_issued)) }}</strong></span><span><small>Penerimaan</small><strong>{{ money.format(Number(row.received)) }}</strong></span><span><small>Pengeluaran project</small><strong>{{ money.format(Number(row.expenses)) }}</strong></span><span><small>Arus kas bersih</small><strong :class="{ negative: Number(row.cash_flow) < 0 }">{{ money.format(Number(row.cash_flow)) }}</strong></span></div><div class="card-outstanding"><span>Sisa tagihan saat ini</span><strong>{{ money.format(Number(row.outstanding)) }}</strong></div></article></div>
    </template>
    <div v-if="loading && rows.length" class="loading-more">Memuat project berikutnya...</div>
  </div>
</template>

<style scoped>
.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;text-align:left}th{padding:12px 13px;border-bottom:1px solid #ffffff12;color:#858c80;font-size:9px;font-weight:700;letter-spacing:.35px;text-transform:uppercase;white-space:nowrap}td{padding:13px;border-bottom:1px solid #ffffff0c;color:#cbd0c6;font-size:10px;white-space:nowrap}tbody tr:last-child td{border-bottom:0}.project{display:grid;gap:4px}.project strong{color:#ecefe9;font-size:10px;font-weight:600}.project small{color:#92988e;font-size:9px}.flow{color:#c4e69a;font-weight:700}.flow.negative,.card-metrics .negative{color:#ffb4a8}.outstanding{color:#f0d56a;font-weight:700}.list-state,.loading-more{min-height:150px;display:grid;place-content:center;text-align:center;color:#92988e;font-size:10px}.loading-more{min-height:42px}.project-cards{display:none}@media(max-width:760px){.table-wrap{display:none}.project-cards{display:grid;gap:10px;padding:11px}.project-card{min-width:0;padding:13px;border:1px solid #ffffff12;border-radius:10px;background:#ffffff03}.card-heading{display:grid;gap:4px}.card-heading strong{overflow-wrap:anywhere;color:#d7efa9;font-size:12px}.card-heading small{color:#858c82;font-size:9px}.card-metrics{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin:13px 0;padding:12px 0;border-block:1px solid #ffffff0d}.card-metrics span{min-width:0;display:grid;gap:5px}.card-metrics small{color:#858c82;font-size:9px}.card-metrics strong{overflow-wrap:anywhere;color:#cbd0c6;font-size:10px}.card-outstanding{display:flex;justify-content:space-between;gap:8px;color:#b6bcb2;font-size:10px}.card-outstanding strong{color:#f0d56a}} 
</style>
