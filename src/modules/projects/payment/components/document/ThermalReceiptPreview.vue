<script setup lang="ts">
import type { PaymentMethod, PaymentType, ProjectPayment } from '../../types/payment'

defineProps<{ payment: ProjectPayment }>()

const money = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const date = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
const paymentTypes: Record<PaymentType, string> = { down_payment: 'DP / Uang muka', installment: 'Termin / cicilan', final: 'Pelunasan' }
const methods: Record<PaymentMethod, string> = { cash: 'Tunai', bank_transfer: 'Transfer bank', other: 'Lainnya' }
</script>

<template>
  <section class="pos-preview-wrap" aria-label="Pratinjau struk POS 58 milimeter">
    <div class="preview-caption"><span>PRATINJAU POS</span><small>Format struk belanja · kertas 58 mm</small></div>
    <article class="pos-paper">
      <header class="store-header">
        <span class="store-mark">U</span>
        <strong>UDev</strong>
        <small>UDUMBARA DEVELOPMENT</small>
        <span class="receipt-title">STRUK PEMBAYARAN</span>
      </header>

      <div class="dash-rule"></div>
      <div class="meta-line"><span>No. transaksi</span><strong>{{ payment.code }}</strong></div>
      <div class="meta-line"><span>Tanggal</span><strong>{{ date.format(new Date(`${payment.received_at}T00:00:00`)) }}</strong></div>
      <div class="dash-rule"></div>

      <section class="receipt-section">
        <span class="section-label">DITERIMA DARI</span>
        <strong class="customer-name">{{ payment.invoice.project.customer.name }}</strong>
        <small v-if="payment.invoice.project.customer.code">{{ payment.invoice.project.customer.code }}</small>
      </section>

      <div class="dash-rule"></div>
      <section class="receipt-section">
        <span class="section-label">RINCIAN TRANSAKSI</span>
        <div class="item-row"><strong>Pembayaran project</strong><span>1 x</span></div>
        <strong class="project-name">{{ payment.invoice.project.name }}</strong>
        <div class="detail-line"><span>Kode project</span><strong>{{ payment.invoice.project.code }}</strong></div>
        <div class="detail-line"><span>Invoice</span><strong>{{ payment.invoice.code }}</strong></div>
        <div class="detail-line"><span>Jenis</span><strong>{{ paymentTypes[payment.payment_type] }}</strong></div>
        <div class="detail-line"><span>Metode</span><strong>{{ methods[payment.method] }}</strong></div>
        <div v-if="payment.reference" class="detail-line"><span>Referensi</span><strong>{{ payment.reference }}</strong></div>
      </section>

      <div class="solid-rule"></div>
      <section class="total-section">
        <div><span>TOTAL DITERIMA</span><small>{{ payment.status === 'received' ? 'PEMBAYARAN SAH' : 'TIDAK BERLAKU' }}</small></div>
        <strong>{{ money.format(Number(payment.amount)) }}</strong>
      </section>

      <div v-if="payment.notes" class="note"><strong>Catatan:</strong> {{ payment.notes }}</div>
      <div v-if="payment.status === 'voided'" class="void-notice">DIKOREKSI · {{ payment.void_reason || 'Kuitansi tidak berlaku' }}</div>

      <div class="dash-rule"></div>
      <footer>
        <strong>Terima kasih!</strong>
        <span>Struk ini merupakan bukti penerimaan pembayaran.</span>
        <span>Diterima oleh: {{ payment.receiver?.name || 'UDev' }}</span>
        <small>Dicetak melalui UDev</small>
      </footer>
    </article>
  </section>
</template>

<style scoped>
.pos-preview-wrap{width:min(100%,420px);margin:0 auto 24px;color:#e9ecdf}.preview-caption{display:flex;flex-direction:column;gap:4px;margin:0 0 10px 3px}.preview-caption span{color:#ffd64c;font-size:9px;font-weight:800;letter-spacing:1.3px}.preview-caption small{color:#969d8d;font-size:10px}.pos-paper{position:relative;box-sizing:border-box;width:min(100%,360px);margin:0 auto;padding:25px 24px 22px;background:#fff;color:#000;font-family:'Courier New',monospace;font-size:11px;line-height:1.45;box-shadow:0 18px 42px #0005}.store-header{display:flex;align-items:center;flex-direction:column;gap:3px;text-align:center}.store-mark{width:27px;height:27px;display:grid;place-items:center;margin-bottom:2px;border-radius:50%;background:#1e3a07;color:#ffd64c;font-family:Manrope,sans-serif;font-size:17px;font-weight:800}.store-header>strong{font-size:17px;letter-spacing:1.4px}.store-header>small{color:#000;font-size:9px;letter-spacing:.5px}.receipt-title{margin-top:10px;font-size:11px;font-weight:800;letter-spacing:.7px}.dash-rule{height:1px;margin:12px 0;border-top:1px dashed #000}.solid-rule{height:2px;margin:12px 0 9px;background:#000}.meta-line,.detail-line,.item-row{display:flex;justify-content:space-between;gap:12px}.meta-line{margin:3px 0}.meta-line span,.detail-line span{color:#000}.meta-line strong,.detail-line strong{text-align:right;overflow-wrap:anywhere}.receipt-section{display:grid;gap:4px}.section-label{margin-bottom:2px;color:#000;font-size:9px;font-weight:800;letter-spacing:.5px}.customer-name{font-size:13px;overflow-wrap:anywhere}.receipt-section>small{color:#000}.item-row{align-items:flex-start;margin-top:2px}.item-row strong{max-width:78%;font-size:11px}.item-row span{white-space:nowrap}.project-name{font-size:12px;overflow-wrap:anywhere}.detail-line{align-items:flex-start;font-size:10px}.detail-line strong{max-width:65%;font-size:10px}.total-section{display:grid;grid-template-columns:1fr;gap:4px}.total-section>div{display:flex;justify-content:space-between;gap:8px;font-size:10px;font-weight:800;letter-spacing:.4px}.total-section small{font-size:8px}.total-section>strong{font-size:21px;line-height:1.25;overflow-wrap:anywhere}.note,.void-notice{margin-top:10px;padding:8px;border:1px dashed #000;font-size:10px;overflow-wrap:anywhere}.void-notice{border-color:#000;color:#000;font-weight:800}footer{display:grid;gap:5px;text-align:center}footer strong{font-size:13px}footer span{color:#000;font-size:9px}footer small{margin-top:4px;color:#000;font-size:8px;letter-spacing:.4px}@media(max-width:360px){.pos-paper{padding:20px 18px}}
</style>
