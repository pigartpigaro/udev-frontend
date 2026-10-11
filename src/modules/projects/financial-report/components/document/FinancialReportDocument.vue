<script setup lang="ts">
import { ref } from 'vue'
import type { FinancialProjectRow, FinancialReportFilters, FinancialReportSummary } from '../../types/financialReport'

defineProps<{ rows: FinancialProjectRow[]; summary: FinancialReportSummary; filters: FinancialReportFilters }>()
const root = ref<HTMLElement | null>(null)
defineExpose({ element: () => root.value })
const money = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 2 })
</script>

<template>
  <article ref="root" class="report-document">
    <header><div><small>UDEV · LAPORAN</small><h1>Laporan Keuangan</h1><p>Periode {{ filters.dateFrom || 'semua tanggal' }} – {{ filters.dateTo || 'semua tanggal' }}</p><p v-if="filters.projectId">Project ID: {{ filters.projectId }}</p></div><strong>UDev</strong></header>
    <section class="totals">
      <div><small>Invoice terbit</small><strong>{{ money.format(Number(summary.invoice_issued)) }}</strong></div>
      <div><small>Penerimaan</small><strong>{{ money.format(Number(summary.received)) }}</strong></div>
      <div><small>Pengeluaran</small><strong>{{ money.format(Number(summary.expenses)) }}</strong></div>
      <div><small>Arus kas bersih</small><strong>{{ money.format(Number(summary.cash_flow)) }}</strong></div>
      <div><small>Sisa tagihan saat ini</small><strong>{{ money.format(Number(summary.outstanding)) }}</strong></div>
      <div><small>Pencairan kasbon tim</small><strong>{{ money.format(Number(summary.team_loans_issued)) }}</strong></div>
      <div><small>Cicilan kasbon tim</small><strong>{{ money.format(Number(summary.team_loan_repayments)) }}</strong></div>
      <div><small>Sisa kasbon saat ini</small><strong>{{ money.format(Number(summary.team_loans_outstanding)) }}</strong></div>
      <div><small>Saldo kas saat ini</small><strong>{{ money.format(Number(summary.cash_available)) }}</strong></div>
    </section>
    <table><thead><tr><th>Project</th><th>Invoice terbit</th><th>Penerimaan</th><th>Pengeluaran</th><th>Arus kas bersih</th><th>Sisa tagihan</th></tr></thead><tbody>
      <tr v-for="row in rows" :key="row.id"><td><b>{{ row.name }}</b><small>{{ row.code }}</small></td><td>{{ money.format(Number(row.invoice_issued)) }}</td><td>{{ money.format(Number(row.received)) }}</td><td>{{ money.format(Number(row.expenses)) }}</td><td>{{ money.format(Number(row.cash_flow)) }}</td><td>{{ money.format(Number(row.outstanding)) }}</td></tr>
    </tbody></table>
    <footer>Dicetak dari UDev · {{ new Date().toLocaleString('id-ID') }}</footer>
  </article>
</template>

<style scoped>
.report-document{box-sizing:border-box;width:1100px;padding:38px;background:#fff;color:#20251e;font:13px Arial,sans-serif}.report-document header{display:flex;justify-content:space-between;border-bottom:2px solid #1e3a07;padding-bottom:20px}.report-document header small{color:#547a32;font-weight:700;letter-spacing:1px}.report-document h1{margin:8px 0;font-size:26px}.report-document p{margin:4px 0;color:#687064}.report-document header>strong{color:#1e3a07;font-size:24px}.totals{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:22px 0}.totals div{padding:12px;border:1px solid #dce4d5;border-radius:7px}.totals small,.totals strong{display:block}.totals small{margin-bottom:8px;color:#687064}.totals strong{font-size:14px}.report-document table{width:100%;border-collapse:collapse}.report-document th{background:#1e3a07;color:white;text-align:left}.report-document th,.report-document td{padding:10px 9px;border:1px solid #dce1d8;text-align:right;white-space:nowrap}.report-document th:first-child,.report-document td:first-child{text-align:left}.report-document td:first-child b,.report-document td:first-child small{display:block}.report-document td:first-child small{margin-top:4px;color:#687064}.report-document footer{margin-top:18px;color:#687064;font-size:10px}
</style>
