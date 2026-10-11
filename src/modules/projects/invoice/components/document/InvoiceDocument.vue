<script setup lang="ts">
import { ref } from 'vue'
import UDevLogo from '../../../../../shared/components/UDevLogo.vue'
import type { ProjectInvoice } from '../../types/invoice'

defineProps<{ invoice: ProjectInvoice }>()

const money = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const date = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
const month = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' })
const invoiceSheet = ref<HTMLElement | null>(null)
function billingLabel(invoice: ProjectInvoice) {
  return invoice.billing_cycle === 'monthly' && invoice.billing_period
    ? month.format(new Date(invoice.billing_period + '-01T00:00:00'))
    : 'Tagihan sekali'
}
function element() { return invoiceSheet.value }

defineExpose({ element })
</script>

<template>
  <article ref="invoiceSheet" class="invoice-sheet">
    <div v-if="invoice.status === 'cancelled'" class="cancel-watermark">DIBATALKAN</div>
    <header class="document-header"><div class="brand"><UDevLogo variant="icon" class="document-logo" alt="" /><div><strong>UDev</strong><small>Udumbara Development</small></div></div><div class="document-title"><span>TAGIHAN PROJECT</span><h1>INVOICE</h1><span class="status" :class="invoice.status">{{ invoice.status === 'issued' ? 'DITERBITKAN' : invoice.status === 'cancelled' ? 'DIBATALKAN' : 'DRAFT' }}</span></div></header>
    <div class="rule"></div>
    <section class="meta-grid"><div><span class="label">Nomor invoice</span><strong>{{ invoice.code }}</strong></div><div><span class="label">Jenis / periode tagihan</span><strong>{{ billingLabel(invoice) }}</strong></div><div><span class="label">Tanggal invoice</span><strong>{{ date.format(new Date(invoice.issued_at + 'T00:00:00')) }}</strong></div><div><span class="label">Jatuh tempo</span><strong>{{ invoice.due_at ? date.format(new Date(invoice.due_at + 'T00:00:00')) : '—' }}</strong></div></section>
    <section class="bill-to"><span class="label">DITAGIHKAN KEPADA</span><h2>{{ invoice.project.customer.name }}</h2><p v-if="invoice.project.customer.code">Kode pelanggan: {{ invoice.project.customer.code }}</p><p>Project: <strong>{{ invoice.project.name }}</strong> ({{ invoice.project.code }})</p></section>
    <table class="lines"><thead><tr><th>Deskripsi</th><th>Periode</th><th class="right">Jumlah</th></tr></thead><tbody><tr><td><strong>Tagihan project {{ invoice.project.name }}</strong><small v-if="invoice.notes">{{ invoice.notes }}</small></td><td>{{ billingLabel(invoice) }}</td><td class="right">{{ money.format(Number(invoice.amount)) }}</td></tr></tbody></table>
    <div class="total-row"><span>TOTAL TAGIHAN</span><strong>{{ money.format(Number(invoice.amount)) }}</strong></div>
    <p v-if="invoice.supersedes" class="replacement-info">Invoice ini menggantikan {{ invoice.supersedes.code }} yang telah dibatalkan.</p>
    <section v-if="invoice.status === 'cancelled'" class="cancel-info"><strong>Invoice ini telah dibatalkan.</strong><span>Alasan: {{ invoice.cancellation_reason || '—' }}</span><span v-if="invoice.cancelled_at">Waktu pembatalan: {{ date.format(new Date(invoice.cancelled_at)) }}</span></section>
    <footer><p>Terima kasih atas kepercayaan Anda.</p><small>Dokumen ini dibuat secara elektronik oleh UDev.</small></footer>
  </article>
</template>

<style scoped>
.invoice-sheet{position:relative;box-sizing:border-box;width:min(100%,820px);min-height:900px;margin:0 auto;padding:56px 62px;overflow:hidden;background:#fff;color:#252922;box-shadow:0 18px 60px #0007}.document-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.brand{display:flex;align-items:center;gap:11px}.brand-mark{width:42px;height:42px;display:grid;place-items:center;border-radius:12px;background:#1e3a07;color:#ffd64c;font-size:23px;font-weight:800}.brand div{display:grid;gap:3px}.brand strong{font-size:17px}.brand small{color:#71766e;font-size:10px}.document-title{text-align:right}.document-title>span:first-child{color:#7e847a;font-size:9px;font-weight:700;letter-spacing:1.6px}.document-title h1{margin:5px 0;font-size:30px;letter-spacing:1px}.status{display:inline-block;padding:5px 8px;border:1px solid #5d8d34;border-radius:4px;color:#416d1f;font-size:9px;font-weight:700;letter-spacing:.6px}.status.cancelled{border-color:#b94b3e;color:#b34236}.status.draft{border-color:#a9a99e;color:#666}.rule{height:2px;margin:25px 0;background:#1e3a07}.meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px 25px}.meta-grid>div{display:grid;gap:5px}.label{color:#858a81;font-size:9px;font-weight:700;letter-spacing:.7px;text-transform:uppercase}.meta-grid strong{font-size:12px}.bill-to{margin:34px 0 27px;padding:17px 20px;border-left:3px solid #8bd74f;background:#f5f7f2}.bill-to h2{margin:8px 0;font-size:16px}.bill-to p{margin:5px 0;color:#555b52;font-size:11px}.lines{width:100%;border-collapse:collapse;font-size:11px}.lines th{padding:11px 10px;background:#f1f3ee;color:#70766b;text-align:left;font-size:9px;text-transform:uppercase}.lines td{padding:15px 10px;border-bottom:1px solid #e7e9e4;vertical-align:top}.lines td:first-child{display:grid;gap:6px}.lines td small{color:#73796f;font-size:10px;white-space:pre-line}.right{text-align:right}.total-row{display:flex;align-items:center;justify-content:flex-end;gap:45px;margin-top:20px;padding:16px 10px;border-top:1px solid #cfd3ca;color:#40572e;font-size:12px;font-weight:700}.total-row strong{color:#1e3a07;font-size:19px}.replacement-info,.cancel-info{padding:12px 14px;border:1px solid #d8ddcf;background:#f7f8f5;color:#58604f;font-size:10px}.cancel-info{display:grid;gap:6px;margin-top:18px;border-color:#e2b4ae;background:#fff7f6;color:#85382f}.cancel-info strong{font-size:11px}.invoice-sheet footer{margin-top:70px;padding-top:16px;border-top:1px solid #e5e7e1;text-align:center}.invoice-sheet footer p{margin:0 0 6px;color:#58604f;font-size:11px}.invoice-sheet footer small{color:#969b92;font-size:9px}.cancel-watermark{position:absolute;top:46%;left:18%;transform:rotate(-25deg);color:#b94b3e17;font-size:74px;font-weight:900;letter-spacing:6px;pointer-events:none}
@media(max-width:600px){.invoice-sheet{min-height:0;padding:27px 20px}.document-header{gap:10px}.document-title h1{font-size:24px}.brand-mark{width:34px;height:34px}.meta-grid{gap:14px}.cancel-watermark{font-size:48px}}
</style>
