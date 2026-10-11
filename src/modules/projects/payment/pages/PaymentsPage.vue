<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '../../../../shared/components/layout/AppIcon.vue'
import { useGlobalSearch } from '../../../../shared/composables/useGlobalSearch'
import { useToast } from '../../../../shared/composables/useToast'
import { createPayment, getPayments, voidPayment } from '../api/payments'
import PaymentFormModal from '../components/modal/PaymentFormModal.vue'
import PaymentVoidModal from '../components/modal/PaymentVoidModal.vue'
import PaymentList from '../components/list-data/PaymentList.vue'
import type { PaymentPayload, ProjectPayment } from '../types/payment'
import PaymentReceiptDocument from '../components/document/PaymentReceiptDocument.vue'
import { downloadPaymentReceiptPdf } from '../utils/downloadPaymentReceiptPdf'

const router = useRouter()
const { searchQuery } = useGlobalSearch()
const { showToast } = useToast()
const payments = ref<ProjectPayment[]>([])
const loading = ref(true)
const page = ref(1)
const lastPage = ref(1)
const total = ref(0)
const modalOpen = ref(false)
const selectedPayment = ref<ProjectPayment | null>(null)
const submitting = ref(false)
const formError = ref('')
const actionError = ref('')
const loadError = ref('')
const notice = ref('')
const sentinel = ref<HTMLElement | null>(null)
const downloadTarget = ref<ProjectPayment | null>(null)
const downloadDocument = ref<InstanceType<typeof PaymentReceiptDocument> | null>(null)
const downloadError = ref('')
const hasMore = computed(() => page.value < lastPage.value)
let timer: ReturnType<typeof setTimeout> | undefined
let observer: IntersectionObserver | undefined
let sequence = 0

async function load(requestedPage = 1, append = false) {
  if (append && loading.value) return
  const request = ++sequence
  loading.value = true
  loadError.value = ''
  try {
    const result = await getPayments({ search: searchQuery.value, page: requestedPage, perPage: 20 })
    if (request !== sequence) return
    payments.value = append ? [...payments.value, ...result.data] : result.data
    page.value = result.current_page
    lastPage.value = result.last_page
    total.value = result.total
  } catch (error) { if (request === sequence) loadError.value = error instanceof Error ? error.message : 'Pembayaran gagal dimuat.' }
  finally { if (request === sequence) loading.value = false }
}

watch(searchQuery, () => { page.value = 1; payments.value = []; lastPage.value = 1; total.value = 0; clearTimeout(timer); timer = setTimeout(() => void load(), 300) })
watch(sentinel, (element, previous) => { if (previous) observer?.unobserve(previous); if (element) observer?.observe(element) }, { flush: 'post' })
onMounted(() => {
  void load()
  if ('IntersectionObserver' in window) observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting) && hasMore.value && !loading.value) void load(page.value + 1, true) }, { rootMargin: '240px 0px' })
  if (sentinel.value) observer?.observe(sentinel.value)
})
onUnmounted(() => { clearTimeout(timer); observer?.disconnect(); sequence += 1 })

async function save(payload: PaymentPayload) {
  submitting.value = true
  formError.value = ''
  try {
    const payment = await createPayment(payload)
    modalOpen.value = false
    showToast(`Penerimaan ${payment.code} berhasil dicatat.`)
    payments.value = []
    page.value = 1
    await load()
  } catch (error) { formError.value = error instanceof Error ? error.message : 'Penerimaan gagal disimpan.'; showToast(formError.value, 'error') }
  finally { submitting.value = false }
}

async function confirmVoid(reason: string) {
  if (!selectedPayment.value) return
  submitting.value = true
  actionError.value = ''
  try {
    const payment = await voidPayment(selectedPayment.value.id, reason)
    showToast(`Penerimaan ${payment.code} dikoreksi dan tetap tersimpan di riwayat.`)
    selectedPayment.value = null
    payments.value = []
    page.value = 1
    await load()
  } catch (error) { actionError.value = error instanceof Error ? error.message : 'Koreksi penerimaan gagal.'; showToast(actionError.value, 'error') }
  finally { submitting.value = false }
}

function openPrint(payment: ProjectPayment) { void router.push(`/projects/payments/${payment.id}/receipt`) }
async function downloadReceipt(payment: ProjectPayment) {
  if (downloadTarget.value) return
  downloadError.value = ''; downloadTarget.value = payment
  try {
    await nextTick()
    const element = downloadDocument.value?.element()
    if (!element) throw new Error('Tampilan kuitansi belum siap untuk diunduh.')
    await downloadPaymentReceiptPdf(payment, element)
  } catch (error) { downloadError.value = error instanceof Error ? error.message : 'PDF kuitansi gagal diunduh.' }
  finally { downloadTarget.value = null }
}
</script>

<template>
  <main class="payments-page"><div class="page-content">
    <div class="breadcrumb"><span>Project</span><AppIcon name="chevron-right" :size="13" /><strong>Pembayaran</strong></div>
    <header class="page-heading"><div><span class="page-overline"><i></i> PROJECT · KEUANGAN</span><h1>Pembayaran</h1><p>Catat DP, pembayaran termin, cicilan, dan pelunasan invoice.</p></div><button class="add-button" type="button" @click="modalOpen = true; formError = ''"><AppIcon name="plus" :size="17" /><span>Catat pembayaran</span></button></header>
    <div class="list-toolbar"><div class="list-heading"><h2>Daftar penerimaan</h2><span class="result-count">{{ total }}</span></div><span class="search-hint"><AppIcon name="search" :size="14" /> Gunakan pencarian di bagian atas</span></div>
    <div v-if="notice" class="notice-banner" role="status"><AppIcon name="sparkle" :size="15" />{{ notice }}<button type="button" aria-label="Tutup pemberitahuan" @click="notice = ''"><AppIcon name="x" :size="15" /></button></div>
    <div v-if="loadError" class="error-banner" role="alert">{{ loadError }} <button type="button" @click="load()">Coba lagi</button></div>
    <div v-if="downloadError" class="error-banner" role="alert">{{ downloadError }}</div>
    <section class="list-panel" aria-label="Daftar pembayaran"><PaymentList :payments="payments" :loading="loading && payments.length === 0" @void="selectedPayment = $event; actionError = ''" @print="openPrint" @download="downloadReceipt" /></section>
    <div v-if="payments.length" ref="sentinel" class="scroll-status" aria-live="polite"><span v-if="loading">Memuat pembayaran berikutnya...</span><button v-else-if="hasMore" type="button" @click="load(page + 1, true)">Muat pembayaran berikutnya</button><span v-else>Semua {{ total }} penerimaan sudah ditampilkan</span></div>
  </div>
  <PaymentFormModal :open="modalOpen" :submitting="submitting" :error="formError" @close="modalOpen = false" @submit="save" />
  <PaymentVoidModal :payment="selectedPayment" :submitting="submitting" :error="actionError" @close="selectedPayment = null" @confirm="confirmVoid" />
  <div class="pdf-renderer" aria-hidden="true"><PaymentReceiptDocument v-if="downloadTarget" ref="downloadDocument" :payment="downloadTarget" /></div>
  </main>
</template>

<style scoped>
.payments-page{min-height:calc(100vh - 64px);margin-left:76px;color:#eff1ed}.page-content{width:min(100%,1400px);margin:0 auto;padding:24px clamp(20px,3vw,48px) 45px}.breadcrumb{display:flex;align-items:center;gap:7px;color:#92988e;font-size:10px}.breadcrumb strong{color:#dce0d7;font-weight:600}.breadcrumb svg{color:#696f66}.page-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin:24px 0 27px}.page-overline{display:flex;align-items:center;gap:7px;color:#a1a99a;font-size:9px;font-weight:700;letter-spacing:1.25px}.page-overline i{width:6px;height:6px;border-radius:50%;background:#ffd64c}.page-heading h1{margin:9px 0 5px;font:700 30px Manrope,sans-serif;letter-spacing:-1px}.page-heading p{margin:0;color:#9da398;font-size:11px}.add-button{height:39px;display:flex;align-items:center;gap:8px;padding:0 14px;border:0;border-radius:8px;background:#ffd64c;color:#263215;font-size:11px;font-weight:700;cursor:pointer}.list-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.list-heading{display:flex;align-items:center;gap:9px}.list-heading h2{margin:0;font:700 15px Manrope,sans-serif}.result-count{padding:3px 7px;border-radius:12px;background:#ffffff0d;color:#b8c0b0;font-size:9px}.search-hint{display:flex;align-items:center;gap:6px;color:#8f968b;font-size:10px}.list-panel{overflow:hidden;border:1px solid #ffffff12;border-radius:11px;background:#191b19}.scroll-status{min-height:43px;display:flex;align-items:center;justify-content:center;padding:12px;color:#92988e;font-size:10px}.scroll-status button{padding:7px 11px;border:1px solid #ffffff18;border-radius:7px;background:transparent;color:#c7d99f;font-size:10px;cursor:pointer}.notice-banner,.error-banner{display:flex;align-items:center;gap:9px;margin-bottom:12px;padding:10px 12px;border:1px solid #8bd74f25;border-radius:8px;background:#8bd74f0b;color:#c5df9e;font-size:11px}.notice-banner button{margin-left:auto;border:0;background:transparent;color:inherit;cursor:pointer}.error-banner{border-color:#a7463c55;background:#a7463c18;color:#ffb4a8}.error-banner button{margin-left:auto;border:0;background:transparent;color:#ffd64c;text-decoration:underline;cursor:pointer}@media(max-width:600px){.payments-page{min-height:calc(100vh - 58px);margin-left:0}.page-content{padding:18px 12px 32px}.page-heading{align-items:flex-start;margin:20px 0 22px}.page-heading h1{font-size:25px}.page-heading p{max-width:220px;line-height:1.5}.add-button{height:36px;padding:0 10px;font-size:0}.list-toolbar{align-items:flex-start;flex-direction:column}.search-hint{font-size:9px}}
.pdf-renderer{position:fixed;top:0;left:-10000px;width:688px;pointer-events:none;z-index:-1}
</style>
