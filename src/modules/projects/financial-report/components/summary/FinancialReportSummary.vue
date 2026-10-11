<script setup lang="ts">
import AppIcon from '../../../../../shared/components/layout/AppIcon.vue'
import type { FinancialReportSummary } from '../../types/financialReport'

defineProps<{ summary: FinancialReportSummary }>()
const money = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 2 })
</script>

<template>
  <section class="summary-grid" aria-label="Ringkasan keuangan">
    <article class="summary-card"><span class="summary-label"><i class="icon invoice"><AppIcon name="invoice" :size="15" /></i>Invoice terbit <small>pada periode</small></span><strong>{{ money.format(Number(summary.invoice_issued)) }}</strong><small class="summary-hint">Invoice berstatus terbit berdasarkan tanggal terbit.</small></article>
    <article class="summary-card"><span class="summary-label"><i class="icon received"><AppIcon name="wallet" :size="15" /></i>Penerimaan <small>pada periode</small></span><strong>{{ money.format(Number(summary.received)) }}</strong><small class="summary-hint">Hanya penerimaan sah yang dihitung.</small></article>
    <article class="summary-card"><span class="summary-label"><i class="icon expense"><AppIcon name="receipt" :size="15" /></i>Pengeluaran <small>pada periode</small></span><strong>{{ money.format(Number(summary.expenses)) }}</strong><small class="summary-hint">Termasuk operasional tim {{ money.format(Number(summary.operational_expenses)) }}.</small></article>
    <article class="summary-card"><span class="summary-label"><i class="icon flow"><AppIcon name="finance" :size="15" /></i>Arus kas bersih <small>pada periode</small></span><strong :class="{ negative: Number(summary.cash_flow) < 0 }">{{ money.format(Number(summary.cash_flow)) }}</strong><small class="summary-hint">Penerimaan dikurangi pengeluaran.</small></article>
    <article class="summary-card outstanding-card"><span class="summary-label"><i class="icon invoice"><AppIcon name="invoice" :size="15" /></i>Sisa tagihan <small>saat ini</small></span><strong>{{ money.format(Number(summary.outstanding)) }}</strong><small class="summary-hint">Saldo invoice terbit; tidak dibatasi periode tanggal.</small></article>
    <article class="summary-card"><span class="summary-label"><i class="icon expense"><AppIcon name="wallet" :size="15" /></i>Kasbon tim <small>pada periode</small></span><strong>{{ money.format(Number(summary.team_loans_issued)) }}</strong><small class="summary-hint">Pencairan kasbon (bukan biaya).</small></article>
    <article class="summary-card"><span class="summary-label"><i class="icon received"><AppIcon name="wallet" :size="15" /></i>Cicilan kasbon <small>pada periode</small></span><strong>{{ money.format(Number(summary.team_loan_repayments)) }}</strong><small class="summary-hint">Pembayaran kembali yang menambah kas.</small></article>
    <article class="summary-card"><span class="summary-label"><i class="icon flow"><AppIcon name="wallet" :size="15" /></i>Sisa kasbon <small>saat ini</small></span><strong>{{ money.format(Number(summary.team_loans_outstanding)) }}</strong><small class="summary-hint">Total piutang kasbon tim belum lunas.</small></article>
    <article class="summary-card"><span class="summary-label"><i class="icon flow"><AppIcon name="finance" :size="15" /></i>Saldo kas <small>akhir periode</small></span><strong :class="{ negative: Number(summary.cash_available) < 0 }">{{ money.format(Number(summary.cash_available)) }}</strong><small class="summary-hint">Arus kas setelah kasbon dicairkan dan dibayar kembali.</small></article>
  </section>
</template>

<style scoped>
.summary-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:22px}.summary-card{min-width:0;display:flex;flex-direction:column;gap:11px;padding:15px;border:1px solid #ffffff12;border-radius:10px;background:#191b19}.summary-label{display:flex;align-items:center;gap:8px;color:#d4d8d0;font-size:10px;font-weight:700}.summary-label small{margin-left:auto;color:#858c80;font-size:9px;font-weight:500}.icon{width:28px;height:28px;display:grid;place-items:center;border-radius:8px;font-style:normal}.icon.invoice{background:#ffffff0c;color:#d2d9c8}.icon.received{background:#8bd74f16;color:#c4e69a}.icon.expense{background:#df460d16;color:#ffb4a8}.icon.flow{background:#ffd64c17;color:#f0d56a}.summary-card>strong{color:#f0f2ed;font:700 clamp(16px,2vw,21px) Manrope,sans-serif;overflow-wrap:anywhere}.summary-card>strong.negative{color:#ffb4a8}.summary-hint{min-height:25px;color:#858c80;font-size:9px;line-height:1.45}@media(max-width:760px){.summary-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.summary-card{gap:9px;padding:12px}.summary-label{flex-wrap:wrap}.summary-label small{margin-left:0}.summary-hint{min-height:0}}@media(max-width:360px){.summary-grid{grid-template-columns:1fr}}
</style>
