<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '../../../../shared/components/layout/AppIcon.vue'
import { useGlobalSearch } from '../../../../shared/composables/useGlobalSearch'
import { useToast } from '../../../../shared/composables/useToast'
import { getProjects } from '../../project/api/projects'
import type { Project } from '../../project/types/project'
import { cancelInvoice, createInvoice, getInvoices, issueInvoice, updateInvoice } from '../api/invoices'
import InvoiceFormModal from '../components/modal/InvoiceFormModal.vue'
import InvoiceActionModal from '../components/modal/InvoiceActionModal.vue'
import InvoiceDocument from '../components/document/InvoiceDocument.vue'
import InvoiceList from '../components/list-data/InvoiceList.vue'
import type { InvoicePayload, ProjectInvoice } from '../types/invoice'
import { downloadInvoicePdf } from '../utils/downloadInvoicePdf'

const router = useRouter()
const { searchQuery } = useGlobalSearch()
const { showToast } = useToast()
const invoices = ref<ProjectInvoice[]>([])
const projects = ref<Project[]>([])
const loading = ref(true)
const loadingProjects = ref(true)
const page = ref(1)
const lastPage = ref(1)
const total = ref(0)
const modalOpen = ref(false)
const current = ref<ProjectInvoice | null>(null)
const replacementSource = ref<ProjectInvoice | null>(null)
const actionInvoice = ref<ProjectInvoice | null>(null)
const actionType = ref<'issue' | 'cancel' | null>(null)
const actionSubmitting = ref(false)
const actionError = ref('')
const submitting = ref(false)
const formError = ref('')
const loadError = ref('')
const downloadError = ref('')
const notice = ref('')
const sentinel = ref<HTMLElement | null>(null)
const downloadTarget = ref<ProjectInvoice | null>(null)
const downloadDocument = ref<InstanceType<typeof InvoiceDocument> | null>(null)
const hasMore = computed(() => page.value < lastPage.value)
const availableProjects = computed(() => projects.value.filter((project) => project.status !== 'cancelled'))
let timer: ReturnType<typeof setTimeout> | undefined
let observer: IntersectionObserver | undefined
let sequence = 0

async function load(requestedPage = 1, append = false) {
  if (append && loading.value) return
  const request = ++sequence
  loading.value = true
  loadError.value = ''
  try {
    const result = await getInvoices({ search: searchQuery.value, page: requestedPage, perPage: 20 })
    if (request !== sequence) return
    invoices.value = append ? [...invoices.value, ...result.data] : result.data
    page.value = result.current_page
    lastPage.value = result.last_page
    total.value = result.total
  } catch (error) {
    if (request === sequence) loadError.value = error instanceof Error ? error.message : 'Invoice gagal dimuat.'
  } finally { if (request === sequence) loading.value = false }
}
async function loadProjects() {
  loadingProjects.value = true
  try {
    const first = await getProjects({ search: '', page: 1, perPage: 100 })
    const all = [...first.data]
    for (let next = 2; next <= first.last_page; next += 1) all.push(...(await getProjects({ search: '', page: next, perPage: 100 })).data)
    projects.value = all
  } catch (error) { loadError.value = error instanceof Error ? error.message : 'Pilihan project gagal dimuat.' }
  finally { loadingProjects.value = false }
}
watch(searchQuery, () => { page.value = 1; invoices.value = []; lastPage.value = 1; total.value = 0; clearTimeout(timer); timer = setTimeout(() => void load(), 300) })
watch(sentinel, (element, previous) => { if (previous) observer?.unobserve(previous); if (element) observer?.observe(element) }, { flush: 'post' })
onMounted(() => {
  void load()
  void loadProjects()
  if ('IntersectionObserver' in window) observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting) && hasMore.value && !loading.value) void load(page.value + 1, true) }, { rootMargin: '240px 0px' })
  if (sentinel.value) observer?.observe(sentinel.value)
})
onUnmounted(() => { clearTimeout(timer); observer?.disconnect(); sequence += 1 })
function openCreate() { current.value = null; replacementSource.value = null; formError.value = ''; modalOpen.value = true }
function openEdit(invoice: ProjectInvoice) { current.value = invoice; replacementSource.value = null; formError.value = ''; modalOpen.value = true }
function openReplacement(invoice: ProjectInvoice) { current.value = null; replacementSource.value = invoice; formError.value = ''; modalOpen.value = true }
function openPrint(invoice: ProjectInvoice) { void router.push('/projects/invoices/' + invoice.id + '/print') }
async function downloadInvoice(invoice: ProjectInvoice) {
  if (downloadTarget.value) return
  downloadError.value = ''
  downloadTarget.value = invoice
  try {
    await nextTick()
    const element = downloadDocument.value?.element()
    if (!element) throw new Error('Tampilan invoice belum siap untuk diunduh.')
    await downloadInvoicePdf(invoice, element)
  } catch (error) { downloadError.value = error instanceof Error ? error.message : 'PDF invoice gagal diunduh.' }
  finally { downloadTarget.value = null }
}
async function save(payload: InvoicePayload | import('../types/invoice').InvoiceUpdatePayload) {
  submitting.value = true
  formError.value = ''
  try {
    if (current.value) await updateInvoice(current.value.id, payload as import('../types/invoice').InvoiceUpdatePayload)
    else await createInvoice(payload as InvoicePayload)
    modalOpen.value = false
    showToast(current.value ? 'Draft invoice berhasil diperbarui.' : 'Draft invoice berhasil dibuat.')
    invoices.value = []
    page.value = 1
    await load()
    await loadProjects()
  } catch (error) { formError.value = error instanceof Error ? error.message : 'Invoice gagal disimpan.'; showToast(formError.value, 'error') }
  finally { submitting.value = false }
}
async function changeStatus(invoice: ProjectInvoice, action: 'issue' | 'cancel') {
  actionInvoice.value = invoice
  actionType.value = action
  actionError.value = ''
}
async function confirmAction(reason: string) {
  if (!actionInvoice.value || !actionType.value) return
  const invoice = actionInvoice.value
  const action = actionType.value
  actionSubmitting.value = true
  try {
    if (action === 'issue') await issueInvoice(invoice.id)
    else await cancelInvoice(invoice.id, reason!)
    showToast(action === 'issue' ? invoice.code + ' berhasil diterbitkan.' : invoice.code + ' berhasil dibatalkan.')
    invoices.value = []
    page.value = 1
    await load()
    await loadProjects()
    actionInvoice.value = null
    actionType.value = null
  } catch (error) { actionError.value = error instanceof Error ? error.message : 'Status invoice gagal diperbarui.'; showToast(actionError.value, 'error') }
  finally { actionSubmitting.value = false }
}
</script>

<template>
  <main class="invoices-page">
    <div class="page-content">
      <div class="breadcrumb"><span>Project</span><AppIcon name="chevron-right" :size="13" /><strong>Invoice</strong></div>
      <header class="page-heading"><div><span class="page-overline"><i></i> PROJECT · KEUANGAN</span><h1>Invoice</h1><p>Tagihan dibuat per project dan periode bulanan.</p></div><button class="add-button" type="button" :disabled="loadingProjects || !availableProjects.length" @click="openCreate"><AppIcon name="plus" :size="17" /><span>Buat invoice</span></button></header>
      <div class="list-toolbar"><div class="list-heading"><h2>Daftar invoice</h2><span class="result-count">{{ total }}</span></div><span class="search-hint"><AppIcon name="search" :size="14" /> Gunakan pencarian di bagian atas</span></div>
      <div v-if="notice" class="notice-banner" role="status"><AppIcon name="sparkle" :size="15" />{{ notice }}<button type="button" aria-label="Tutup pemberitahuan" @click="notice = ''"><AppIcon name="x" :size="15" /></button></div>
      <div v-if="loadError" class="error-banner" role="alert">{{ loadError }} <button type="button" @click="load()">Coba lagi</button></div>
      <div v-if="downloadError" class="error-banner" role="alert">{{ downloadError }}</div>
      <section class="list-panel" aria-label="Daftar invoice"><InvoiceList :invoices="invoices" :loading="loading && invoices.length === 0" @edit="openEdit" @issue="changeStatus($event, 'issue')" @cancel="changeStatus($event, 'cancel')" @replace="openReplacement" @print="openPrint" @download="downloadInvoice" /></section>
      <div v-if="invoices.length" ref="sentinel" class="scroll-status" aria-live="polite"><span v-if="loading">Memuat invoice berikutnya...</span><button v-else-if="hasMore" type="button" @click="load(page + 1, true)">Muat invoice berikutnya</button><span v-else>Semua {{ total }} invoice sudah ditampilkan</span></div>
    </div>
    <InvoiceFormModal :open="modalOpen" :invoice="current" :replacement-of="replacementSource" :projects="availableProjects" :submitting="submitting" :error="formError" @close="modalOpen = false" @submit="save" />
    <InvoiceActionModal :open="!!actionInvoice" :invoice="actionInvoice" :action="actionType" :submitting="actionSubmitting" :error="actionError" @close="actionInvoice = null; actionType = null" @confirm="confirmAction" />
    <div class="pdf-renderer" aria-hidden="true"><InvoiceDocument v-if="downloadTarget" ref="downloadDocument" :invoice="downloadTarget" /></div>
  </main>
</template>

<style scoped>
.invoices-page{min-height:calc(100vh - 64px);margin-left:76px;color:#eff1ed}.page-content{width:min(100%,1500px);margin:0 auto;padding:24px clamp(20px,3vw,48px) 45px}.breadcrumb{display:flex;align-items:center;gap:7px;color:#92988e;font-size:10px}.breadcrumb strong{color:#dce0d7;font-weight:600}.breadcrumb svg{color:#696f66}.page-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin:24px 0 27px}.page-overline{display:flex;align-items:center;gap:7px;color:#a1a99a;font-size:9px;font-weight:700;letter-spacing:1.25px}.page-overline i{width:6px;height:6px;border-radius:50%;background:#ffd64c}.page-heading h1{margin:9px 0 5px;font:700 30px Manrope,sans-serif;letter-spacing:-1px}.page-heading p{margin:0;color:#9da398;font-size:11px}.add-button{height:39px;display:flex;align-items:center;gap:8px;padding:0 14px;border:0;border-radius:8px;background:#ffd64c;color:#263215;font-size:11px;font-weight:700;cursor:pointer}.add-button:disabled{opacity:.5;cursor:wait}.list-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.list-heading{display:flex;align-items:center;gap:9px}.list-heading h2{margin:0;font:700 15px Manrope,sans-serif}.result-count{padding:3px 7px;border-radius:12px;background:#ffffff0d;color:#b8c0b0;font-size:9px}.search-hint{display:flex;align-items:center;gap:6px;color:#8f968b;font-size:10px}.list-panel{overflow:hidden;border:1px solid #ffffff12;border-radius:11px;background:#191b19}.scroll-status{min-height:43px;display:flex;align-items:center;justify-content:center;padding:12px;color:#92988e;font-size:10px}.scroll-status button{padding:7px 11px;border:1px solid #ffffff18;border-radius:7px;background:transparent;color:#c7d99f;font-size:10px;cursor:pointer}.notice-banner,.error-banner,.info-banner{display:flex;align-items:center;gap:9px;margin-bottom:12px;padding:10px 12px;border:1px solid #8bd74f25;border-radius:8px;background:#8bd74f0b;color:#c5df9e;font-size:11px}.notice-banner button{margin-left:auto;border:0;background:transparent;color:inherit;cursor:pointer}.error-banner{border-color:#a7463c55;background:#a7463c18;color:#ffb4a8}.error-banner button{margin-left:auto;border:0;background:transparent;color:#ffd64c;text-decoration:underline;cursor:pointer}.info-banner{border-color:#d39c3c55;background:#d39c3c12;color:#f1ca7e}@media(max-width:600px){.invoices-page{min-height:calc(100vh - 58px);margin-left:0}.page-content{padding:18px 12px 32px}.page-heading{align-items:flex-start;margin:20px 0 22px}.page-heading h1{font-size:25px}.page-heading p{max-width:250px;line-height:1.5}.add-button{height:36px;padding:0 10px;font-size:0}.list-toolbar{align-items:flex-start;flex-direction:column}.search-hint{font-size:9px}}
.pdf-renderer{position:fixed;top:0;left:-10000px;width:688px;pointer-events:none;z-index:-1}
@media(max-width:600px){.page-heading p{max-width:220px}}
</style>
