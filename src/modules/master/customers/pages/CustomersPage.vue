<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import AppIcon from '../../../../shared/components/layout/AppIcon.vue'
import { useGlobalSearch } from '../../../../shared/composables/useGlobalSearch'
import { useToast } from '../../../../shared/composables/useToast'
import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from '../api/customers'
import CustomerList from '../components/list-data/CustomerList.vue'
import CustomerFormModal from '../components/modal/CustomerFormModal.vue'
import type { Customer, CustomerPayload } from '../types/customer'

const { searchQuery } = useGlobalSearch()
const { showToast } = useToast()
const customers = ref<Customer[]>([])
const loading = ref(true)
const page = ref(1)
const lastPage = ref(1)
const total = ref(0)
const modalOpen = ref(false)
const currentCustomer = ref<Customer | null>(null)
const submitting = ref(false)
const formError = ref('')
const loadError = ref('')
const notice = ref('')
const scrollSentinel = ref<HTMLElement | null>(null)
let debounceTimer: ReturnType<typeof setTimeout> | undefined
let observer: IntersectionObserver | undefined
let requestSequence = 0
const hasMore = computed(() => page.value < lastPage.value)

async function loadCustomers(requestedPage = 1, append = false) {
  if (append && loading.value) return
  const requestId = ++requestSequence
  loading.value = true
  loadError.value = ''
  try {
    const result = await getCustomers({ search: searchQuery.value, page: requestedPage, perPage: 20 })
    if (requestId !== requestSequence) return
    customers.value = append ? [...customers.value, ...result.data] : result.data
    page.value = result.current_page
    lastPage.value = result.last_page
    total.value = result.total
  } catch (error) {
    if (requestId !== requestSequence) return
    loadError.value = error instanceof Error ? error.message : 'Data pelanggan gagal dimuat.'
  } finally {
    if (requestId === requestSequence) loading.value = false
  }
}

watch(searchQuery, () => {
  page.value = 1
  customers.value = []
  lastPage.value = 1
  total.value = 0
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => void loadCustomers(1), 300)
})

watch(scrollSentinel, (element, previous) => {
  if (previous) observer?.unobserve(previous)
  if (element) observer?.observe(element)
}, { flush: 'post' })

onMounted(() => {
  void loadCustomers(1)
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting) && hasMore.value && !loading.value) {
        void loadCustomers(page.value + 1, true)
      }
    }, { rootMargin: '240px 0px' })
  }
  if (scrollSentinel.value) observer?.observe(scrollSentinel.value)
})
onUnmounted(() => {
  clearTimeout(debounceTimer)
  observer?.disconnect()
  requestSequence += 1
})

function openCreate() {
  currentCustomer.value = null
  formError.value = ''
  modalOpen.value = true
}

function openEdit(customer: Customer) {
  currentCustomer.value = customer
  formError.value = ''
  modalOpen.value = true
}

async function saveCustomer(payload: CustomerPayload) {
  submitting.value = true
  formError.value = ''
  try {
    if (currentCustomer.value) await updateCustomer(currentCustomer.value.id, payload)
    else await createCustomer(payload)
    modalOpen.value = false
    showToast(currentCustomer.value ? 'Data pelanggan berhasil diperbarui.' : 'Pelanggan berhasil ditambahkan.')
    customers.value = []
    page.value = 1
    await loadCustomers(1)
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'Pelanggan gagal disimpan.'
    showToast(formError.value, 'error')
  } finally {
    submitting.value = false
  }
}

async function removeCustomer(customer: Customer) {
  if (!window.confirm(`Hapus pelanggan “${customer.name}”?`)) return
  try {
    await deleteCustomer(customer.id)
    showToast('Pelanggan berhasil dihapus.')
    customers.value = []
    page.value = 1
    await loadCustomers(1)
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Pelanggan gagal dihapus.'
    showToast(loadError.value, 'error')
  }
}
</script>

<template>
  <main class="customers-page">
    <div class="page-content">
      <div class="breadcrumb"><span>Master Data</span><AppIcon name="chevron-right" :size="13" /><strong>Pelanggan</strong></div>
      <header class="page-heading"><div><span class="page-overline"><i></i> MASTER DATA</span><h1>Pelanggan</h1><p>Kelola data pelanggan dan informasi kontaknya.</p></div><button class="add-customer" type="button" @click="openCreate"><AppIcon name="plus" :size="17" /><span>Tambah pelanggan</span></button></header>
      <div class="list-toolbar"><div class="list-heading"><h2>Daftar pelanggan</h2><span class="result-count">{{ total }}</span></div><span class="search-hint"><AppIcon name="search" :size="14" /> Gunakan pencarian di bagian atas</span></div>
      <div v-if="notice" class="notice-banner" role="status"><AppIcon name="sparkle" :size="15" />{{ notice }}<button type="button" aria-label="Tutup pemberitahuan" @click="notice = ''"><AppIcon name="x" :size="15" /></button></div>
      <div v-if="loadError" class="error-banner" role="alert">{{ loadError }} <button type="button" @click="loadCustomers(hasMore ? page + 1 : 1, hasMore)">Coba lagi</button></div>
      <section class="list-panel" aria-label="Daftar pelanggan"><CustomerList :customers="customers" :loading="loading && customers.length === 0" @edit="openEdit" @remove="removeCustomer" /></section>
      <div v-if="customers.length" ref="scrollSentinel" class="scroll-status" aria-live="polite">
        <span v-if="loading"><i class="loading-dot"></i> Memuat pelanggan berikutnya...</span>
        <button v-else-if="hasMore" type="button" @click="loadCustomers(page + 1, true)">Muat pelanggan berikutnya</button>
        <span v-else>Semua {{ total }} pelanggan sudah ditampilkan</span>
      </div>
    </div>
    <CustomerFormModal :open="modalOpen" :customer="currentCustomer" :submitting="submitting" :error="formError" @close="modalOpen = false" @submit="saveCustomer" />
  </main>
</template>

<style scoped>
.customers-page{min-height:calc(100vh - 64px);margin-left:76px;color:#eff1ed}.page-content{width:min(100%,1400px);margin:0 auto;padding:24px clamp(20px,3vw,48px) 45px}.breadcrumb{display:flex;align-items:center;gap:7px;color:#92988e;font-size:10px}.breadcrumb svg{color:#696f66}.breadcrumb strong{color:#dce0d7;font-weight:600}.page-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin:24px 0 27px}.page-overline{display:flex;align-items:center;gap:7px;color:#a1a99a;font-size:9px;font-weight:700;letter-spacing:1.25px}.page-overline i{width:6px;height:6px;border-radius:50%;background:#ffd64c}.page-heading h1{margin:9px 0 5px;font:700 30px Manrope,sans-serif;letter-spacing:-1px}.page-heading p{margin:0;color:#9da398;font-size:11px}.add-customer{height:39px;display:flex;align-items:center;gap:8px;padding:0 14px;border:0;border-radius:8px;background:#ffd64c;color:#263215;font-size:11px;font-weight:700;cursor:pointer;transition:background .15s,transform .15s}.add-customer:hover{transform:translateY(-1px);background:#ffe173}.list-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.list-heading{display:flex;align-items:center;gap:9px}.list-heading h2{margin:0;font:700 15px Manrope,sans-serif}.result-count{padding:3px 7px;border-radius:12px;background:#ffffff0d;color:#b8c0b0;font-size:9px}.search-hint{display:flex;align-items:center;gap:6px;color:#8f968b;font-size:10px}.list-panel{overflow:hidden;border:1px solid #ffffff12;border-radius:11px;background:#191b19}.scroll-status{min-height:43px;display:flex;align-items:center;justify-content:center;padding:12px;color:#92988e;font-size:10px}.scroll-status button{padding:7px 11px;border:1px solid #ffffff18;border-radius:7px;background:transparent;color:#c7d99f;font-size:10px;cursor:pointer}.scroll-status button:hover{background:#ffffff0a}.loading-dot{width:7px;height:7px;display:inline-block;margin-right:7px;border-radius:50%;background:#ffd64c;animation:pulse .9s infinite alternate}@keyframes pulse{to{opacity:.35;transform:scale(.7)}}.notice-banner,.error-banner{display:flex;align-items:center;gap:9px;margin-bottom:12px;padding:10px 12px;border:1px solid #8bd74f25;border-radius:8px;background:#8bd74f0b;color:#c5df9e;font-size:11px}.notice-banner button{width:25px;height:25px;display:grid;place-items:center;margin-left:auto;border:0;background:transparent;color:inherit;cursor:pointer}.error-banner{border-color:#a7463c55;background:#a7463c18;color:#ffb4a8}.error-banner button{margin-left:auto;border:0;background:transparent;color:#ffd64c;text-decoration:underline;cursor:pointer}
@media(max-width:600px){.customers-page{min-height:calc(100vh - 58px);margin-left:0}.page-content{padding:18px 12px 32px}.page-heading{align-items:flex-start;margin:20px 0 22px}.page-heading h1{font-size:25px}.page-heading p{max-width:220px;line-height:1.5}.add-customer{height:36px;padding:0 10px;font-size:0}.add-customer :deep(svg){width:17px}.list-toolbar{align-items:flex-start;flex-direction:column}.search-hint{font-size:9px}}
</style>
