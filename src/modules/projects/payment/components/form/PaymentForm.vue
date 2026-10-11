<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import FormDateInput from '../../../../../shared/components/form/FormDateInput.vue'
import FormField from '../../../../../shared/components/form/FormField.vue'
import FormInput from '../../../../../shared/components/form/FormInput.vue'
import FormSelect from '../../../../../shared/components/form/FormSelect.vue'
import FormTextarea from '../../../../../shared/components/form/FormTextarea.vue'
import AppIcon from '../../../../../shared/components/layout/AppIcon.vue'
import { getEligibleInvoices } from '../../api/payments'
import type { EligibleInvoice, PaymentPayload } from '../../types/payment'

const props = defineProps<{ submitting: boolean; error: string }>()
const emit = defineEmits<{ submit: [payload: PaymentPayload] }>()
const invoiceQuery = ref('')
const invoices = ref<EligibleInvoice[]>([])
const invoiceOpen = ref(false)
const selectedInvoice = ref<EligibleInvoice | null>(null)
const loadingInvoices = ref(false)
const invoiceError = ref('')
let searchTimer: ReturnType<typeof setTimeout> | undefined
const today = new Date()
const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
const form = ref<PaymentPayload>({ invoice_id: 0, payment_type: 'installment', amount: '', received_at: localDate, method: 'bank_transfer', reference: null, notes: null })
const paymentTypeOptions = [{ value: 'down_payment', label: 'DP / uang muka' }, { value: 'installment', label: 'Termin / cicilan' }, { value: 'final', label: 'Pelunasan' }]
const methodOptions = [{ value: 'bank_transfer', label: 'Transfer bank' }, { value: 'cash', label: 'Tunai' }, { value: 'other', label: 'Lainnya' }]
const remaining = computed(() => Number(selectedInvoice.value?.remaining_amount || 0))

async function searchInvoices() {
  loadingInvoices.value = true
  invoiceError.value = ''
  try { invoices.value = (await getEligibleInvoices(invoiceQuery.value)).data }
  catch (error) { invoiceError.value = error instanceof Error ? error.message : 'Invoice gagal dimuat.' }
  finally { loadingInvoices.value = false }
}
function chooseInvoice(invoice: EligibleInvoice) {
  selectedInvoice.value = invoice
  invoiceQuery.value = `${invoice.code} — ${invoice.project.name}`
  form.value.invoice_id = invoice.id
  invoiceOpen.value = false
}
watch(invoiceQuery, () => {
  if (selectedInvoice.value && invoiceQuery.value === `${selectedInvoice.value.code} — ${selectedInvoice.value.project.name}`) return
  selectedInvoice.value = null
  form.value.invoice_id = 0
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { invoiceOpen.value = true; void searchInvoices() }, 250)
})
function submit() {
  if (!form.value.invoice_id) { invoiceError.value = 'Pilih invoice yang akan menerima pembayaran.'; return }
  if (Number(form.value.amount) > remaining.value) { invoiceError.value = 'Nominal melebihi sisa tagihan invoice.'; return }
  emit('submit', { ...form.value, reference: form.value.reference?.trim() || null, notes: form.value.notes?.trim() || null })
}
</script>

<template>
  <form class="payment-form" @submit.prevent="submit">
    <div v-if="props.error" class="form-error" role="alert">{{ props.error }}</div>
    <div class="form-grid">
      <FormField id="payment-invoice" label="Invoice" required full><div class="combobox"><FormInput id="payment-invoice" v-model="invoiceQuery" required role="combobox" aria-autocomplete="list" :aria-expanded="invoiceOpen" autocomplete="off" placeholder="Cari kode invoice, project, atau pelanggan" @focus="invoiceOpen = true; void searchInvoices()" @keydown.esc="invoiceOpen = false" /><div v-if="invoiceOpen" class="choice-options" role="listbox"><span v-if="loadingInvoices" class="no-options">Memuat invoice...</span><button v-for="invoice in invoices" :key="invoice.id" type="button" role="option" @mousedown.prevent="chooseInvoice(invoice)"><strong>{{ invoice.code }} — {{ invoice.project.name }}</strong><small>{{ invoice.project.customer.name }} · Sisa {{ Number(invoice.remaining_amount).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) }}</small></button><span v-if="invoiceError" class="no-options">{{ invoiceError }}</span><span v-else-if="!loadingInvoices && !invoices.length" class="no-options">Tidak ada invoice terbit dengan sisa tagihan.</span></div></div></FormField>
      <div v-if="selectedInvoice" class="invoice-summary full"><span>Sisa tagihan saat ini</span><strong>{{ Number(selectedInvoice.remaining_amount).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) }}</strong><small>{{ selectedInvoice.project.code }} · {{ selectedInvoice.project.customer.name }}</small></div>
      <FormField id="payment-type" label="Jenis pembayaran" required><FormSelect id="payment-type" :model-value="form.payment_type" :options="paymentTypeOptions" @update:model-value="form.payment_type = $event as PaymentPayload['payment_type']" /></FormField>
      <FormField id="payment-amount" label="Nominal diterima (Rp)" required><FormInput id="payment-amount" v-model="form.amount" type="number" min="0.01" :max="remaining || undefined" step="0.01" inputmode="decimal" required placeholder="Contoh: 5000000" /></FormField>
      <FormField id="payment-date" label="Tanggal diterima" required><FormDateInput id="payment-date" v-model="form.received_at" type="date" required /></FormField>
      <FormField id="payment-method" label="Metode" required><FormSelect id="payment-method" :model-value="form.method" :options="methodOptions" @update:model-value="form.method = $event as PaymentPayload['method']" /></FormField>
      <FormField id="payment-reference" label="Referensi transaksi" full><FormInput id="payment-reference" v-model="form.reference" maxlength="100" placeholder="Nomor bukti transfer atau kuitansi" /></FormField>
      <FormField id="payment-notes" label="Catatan" full><FormTextarea id="payment-notes" v-model="form.notes" maxlength="2000" rows="3" placeholder="Catatan penerimaan pembayaran" /></FormField>
    </div>
    <p class="form-hint"><AppIcon name="info" :size="14" /> Penerimaan langsung sah setelah disimpan. Koreksi hanya dapat dilakukan dengan alasan dan tercatat di riwayat.</p>
    <div class="form-actions"><button type="submit" :disabled="props.submitting || !selectedInvoice"><AppIcon name="check" :size="15" /> {{ props.submitting ? 'Menyimpan...' : 'Simpan penerimaan' }}</button></div>
  </form>
</template>

<style scoped>
.payment-form{padding:21px 24px}.form-error{margin-bottom:14px;padding:10px 12px;border:1px solid #a7463c55;border-radius:8px;background:#a7463c18;color:#ffb4a8;font-size:11px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.combobox{position:relative;min-width:0}.choice-options{position:absolute;z-index:8;top:calc(100% + 5px);left:0;right:0;width:100%;max-width:calc(100vw - 32px);max-height:min(210px,32dvh);box-sizing:border-box;overflow:auto;overscroll-behavior:contain;padding:4px;border:1px solid #393d38;border-radius:8px;background:#1c1f1c;box-shadow:0 10px 25px #0008}.choice-options button{width:100%;display:grid;gap:4px;padding:9px 10px;border:0;border-radius:5px;background:transparent;color:#e5e9e0;text-align:left;font:400 11px 'DM Sans',sans-serif;cursor:pointer;overflow-wrap:anywhere}.choice-options button:hover{background:#8bd74f1a}.choice-options small,.no-options{color:#989f94;font-size:10px}.no-options{display:block;padding:9px 10px}.invoice-summary{display:grid;gap:5px;padding:12px;border:1px solid #8bd74f25;border-radius:8px;background:#8bd74f0b}.invoice-summary span,.invoice-summary small,.form-hint{color:#969d91;font-size:10px}.invoice-summary strong{color:#f0d56a;font-size:15px}.form-hint{display:flex;gap:7px;align-items:flex-start;margin:15px 0;line-height:1.5}.form-actions{display:flex;justify-content:flex-end;margin-top:18px;padding-top:15px;border-top:1px solid #ffffff12}.form-actions button{height:38px;display:flex;align-items:center;gap:7px;padding:0 15px;border:0;border-radius:8px;background:#ffd64c;color:#263215;font-size:11px;font-weight:700;cursor:pointer}.form-actions button:disabled{opacity:.55;cursor:wait}@media(max-width:520px){.payment-form{padding:17px}.form-grid{grid-template-columns:1fr}.invoice-summary.full{grid-column:auto}.payment-form{padding-bottom:calc(20px + env(safe-area-inset-bottom))}.form-actions{position:sticky;bottom:0;z-index:2;margin:0 -17px;padding:12px 17px calc(8px + env(safe-area-inset-bottom));background:#20221f}}
</style>
