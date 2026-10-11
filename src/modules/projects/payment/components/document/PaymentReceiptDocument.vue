<script setup lang="ts">
import { ref } from 'vue'
import UDevLogo from '../../../../../shared/components/UDevLogo.vue'
import type { PaymentMethod, PaymentType, ProjectPayment } from '../../types/payment'

defineProps<{ payment: ProjectPayment }>()
const money = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 2 })
const date = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
const receiptSheet = ref<HTMLElement | null>(null)
const typeLabels: Record<PaymentType, string> = { down_payment: 'DP / Uang muka', installment: 'Termin / Cicilan', final: 'Pelunasan' }
const methodLabels: Record<PaymentMethod, string> = { cash: 'Tunai', bank_transfer: 'Transfer bank', other: 'Lainnya' }
const numberWords = (value: number): string => {
  const small = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas']
  if (value < 12) return small[value]
  if (value < 20) return `${numberWords(value - 10)} belas`
  if (value < 100) return `${numberWords(Math.floor(value / 10))} puluh${value % 10 ? ` ${numberWords(value % 10)}` : ''}`
  if (value < 200) return `seratus${value > 100 ? ` ${numberWords(value - 100)}` : ''}`
  if (value < 1000) return `${numberWords(Math.floor(value / 100))} ratus${value % 100 ? ` ${numberWords(value % 100)}` : ''}`
  if (value < 2000) return `seribu${value > 1000 ? ` ${numberWords(value - 1000)}` : ''}`
  for (const [base, unit] of [[1_000_000_000_000, 'triliun'], [1_000_000_000, 'miliar'], [1_000_000, 'juta'], [1000, 'ribu']] as const) {
    if (value >= base) return `${numberWords(Math.floor(value / base))} ${unit}${value % base ? ` ${numberWords(value % base)}` : ''}`
  }
  return ''
}
function inWords(amount: string) {
  const [wholePart, decimalPart = ''] = amount.split('.')
  const whole = Number.parseInt(wholePart, 10) || 0
  const cents = Number.parseInt(decimalPart.padEnd(2, '0').slice(0, 2), 10) || 0
  return `${numberWords(whole)} rupiah${cents ? ` dan ${numberWords(cents)} sen` : ''}`
}
function element() { return receiptSheet.value }
defineExpose({ element })
</script>

<template>
  <article ref="receiptSheet" class="receipt-sheet">
    <div v-if="payment.status === 'voided'" class="void-watermark">DIKOREKSI</div>
    <header class="document-header"><div class="brand"><UDevLogo variant="icon" class="document-logo" alt="" /><div><strong>UDev</strong><small>Udumbara Development</small></div></div><div class="document-title"><span>BUKTI PENERIMAAN</span><h1>KUITANSI</h1><span class="status" :class="payment.status">{{ payment.status === 'received' ? 'SAH' : 'DIKOREKSI / TIDAK SAH' }}</span></div></header>
    <div class="rule"></div>
    <section class="meta-grid"><div><span class="label">Nomor kuitansi</span><strong>{{ payment.code }}</strong></div><div><span class="label">Tanggal diterima</span><strong>{{ date.format(new Date(`${payment.received_at}T00:00:00`)) }}</strong></div><div><span class="label">Metode pembayaran</span><strong>{{ methodLabels[payment.method] }}</strong></div><div v-if="payment.reference"><span class="label">Referensi transaksi</span><strong>{{ payment.reference }}</strong></div></section>
    <section class="receipt-body"><div class="field"><span class="label">TELAH DITERIMA DARI</span><h2>{{ payment.invoice.project.customer.name }}</h2><p v-if="payment.invoice.project.customer.code">Kode pelanggan: {{ payment.invoice.project.customer.code }}</p></div><div class="amount-box"><span class="label">JUMLAH DITERIMA</span><strong>{{ money.format(Number(payment.amount)) }}</strong><p>Terbilang: <em>{{ inWords(payment.amount) }}</em></p></div><div class="field purpose"><span class="label">UNTUK PEMBAYARAN</span><p>{{ typeLabels[payment.payment_type] }} atas invoice <strong>{{ payment.invoice.code }}</strong></p><p>Project: <strong>{{ payment.invoice.project.name }}</strong> ({{ payment.invoice.project.code }})</p><p v-if="payment.notes">Catatan: {{ payment.notes }}</p></div></section>
    <section v-if="payment.status === 'voided'" class="void-info"><strong>Kuitansi ini telah dikoreksi dan tidak berlaku sebagai bukti penerimaan.</strong><span>Alasan: {{ payment.void_reason || '—' }}</span><span v-if="payment.voided_at">Tanggal koreksi: {{ date.format(new Date(payment.voided_at)) }}<template v-if="payment.voider"> · {{ payment.voider.name }}</template></span></section>
    <section class="signatures"><div><span>Diserahkan oleh</span><strong>{{ payment.invoice.project.customer.name }}</strong></div><div><span>Diterima oleh</span><strong>{{ payment.receiver?.name || 'UDev' }}</strong></div></section>
    <footer><p>Terima kasih atas pembayaran Anda.</p><small>Kuitansi ini dibuat secara elektronik oleh UDev.</small></footer>
  </article>
</template>

<style scoped>
.receipt-sheet{position:relative;box-sizing:border-box;width:min(100%,820px);min-height:790px;margin:0 auto;padding:56px 62px;overflow:hidden;background:#fff;color:#252922;box-shadow:0 18px 60px #0007}.document-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.brand{display:flex;align-items:center;gap:11px}.brand-mark{width:42px;height:42px;display:grid;place-items:center;border-radius:12px;background:#1e3a07;color:#ffd64c;font-size:23px;font-weight:800}.brand div{display:grid;gap:3px}.brand strong{font-size:17px}.brand small{color:#71766e;font-size:10px}.document-title{text-align:right}.document-title>span:first-child{color:#7e847a;font-size:9px;font-weight:700;letter-spacing:1.6px}.document-title h1{margin:5px 0;font-size:28px;letter-spacing:1px}.status{display:inline-block;padding:5px 8px;border:1px solid #5d8d34;border-radius:4px;color:#416d1f;font-size:9px;font-weight:700;letter-spacing:.6px}.status.voided{border-color:#b94b3e;color:#b34236}.rule{height:2px;margin:25px 0;background:#1e3a07}.meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px 25px;padding:0 0 21px;border-bottom:1px solid #e7e9e4}.meta-grid>div,.field{display:grid;gap:5px}.label{color:#858a81;font-size:9px;font-weight:700;letter-spacing:.7px;text-transform:uppercase}.meta-grid strong{font-size:12px}.receipt-body{display:grid;gap:24px;margin-top:27px}.field h2{margin:5px 0;font-size:16px}.field p{margin:4px 0;color:#555b52;font-size:11px;line-height:1.6}.amount-box{padding:18px 20px;border-left:3px solid #8bd74f;background:#f5f7f2}.amount-box>strong{display:block;margin:8px 0;color:#1e3a07;font-size:23px}.amount-box p{margin:0;color:#555b52;font-size:11px}.amount-box em{font-weight:600}.purpose{padding-top:2px}.void-info{display:grid;gap:6px;margin-top:20px;padding:12px 14px;border:1px solid #e2b4ae;background:#fff7f6;color:#85382f;font-size:10px}.void-info strong{font-size:11px}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:50px;margin-top:46px;text-align:center}.signatures div{min-height:82px;display:flex;flex-direction:column;justify-content:space-between;color:#73796f;font-size:10px}.signatures strong{padding-top:36px;border-top:1px solid #aeb4a8;color:#42483e;font-size:11px;font-weight:500}.receipt-sheet footer{margin-top:35px;padding-top:15px;border-top:1px solid #e5e7e1;text-align:center}.receipt-sheet footer p{margin:0 0 6px;color:#58604f;font-size:11px}.receipt-sheet footer small{color:#969b92;font-size:9px}.void-watermark{position:absolute;top:45%;left:15%;transform:rotate(-25deg);color:#b94b3e1c;font-size:72px;font-weight:900;letter-spacing:7px;pointer-events:none}
@media(max-width:600px){.receipt-sheet{min-height:0;padding:27px 20px}.document-header{gap:10px}.document-title h1{font-size:23px}.brand-mark{width:34px;height:34px}.receipt-body{gap:18px}.signatures{gap:24px;margin-top:32px}.void-watermark{font-size:44px}}
</style>
