<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import AppIcon from '../../../../shared/components/layout/AppIcon.vue'
import { useGlobalSearch } from '../../../../shared/composables/useGlobalSearch'
import { useToast } from '../../../../shared/composables/useToast'
import { createUser, getUsers, updateUserRole, type CreatedUser, type NewUserPayload, type WorkspaceUser } from '../api/users'
import UserForm from '../components/form/UserForm.vue'
import UsersList from '../components/list-data/UsersList.vue'

const { searchQuery } = useGlobalSearch()
const { showToast } = useToast()
const activeTab = ref<'list' | 'create'>('list')
const users = ref<WorkspaceUser[]>([])
const loading = ref(true)
const page = ref(1)
const lastPage = ref(1)
const total = ref(0)
const submitting = ref(false)
const changingId = ref<number | null>(null)
const error = ref('')
const loadError = ref('')
const notice = ref('')
const created = ref<CreatedUser | null>(null)
const userForm = ref<InstanceType<typeof UserForm> | null>(null)
const scrollSentinel = ref<HTMLElement | null>(null)
const hasMore = computed(() => page.value < lastPage.value)
let debounceTimer: ReturnType<typeof setTimeout> | undefined
let observer: IntersectionObserver | undefined
let requestSequence = 0

async function loadUsers(requestedPage = 1, append = false) {
  if (append && loading.value) return
  const requestId = ++requestSequence
  loading.value = true
  loadError.value = ''
  try {
    const result = await getUsers({ search: searchQuery.value, page: requestedPage, perPage: 20 })
    if (requestId !== requestSequence) return
    users.value = append ? [...users.value, ...result.data] : result.data
    page.value = result.current_page
    lastPage.value = result.last_page
    total.value = result.total
  } catch (cause) {
    if (requestId !== requestSequence) return
    loadError.value = cause instanceof Error ? cause.message : 'Daftar pengguna gagal dimuat.'
  } finally {
    if (requestId === requestSequence) loading.value = false
  }
}

watch(searchQuery, () => {
  page.value = 1
  users.value = []
  lastPage.value = 1
  total.value = 0
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => void loadUsers(1), 300)
})
watch(scrollSentinel, (element, previous) => {
  if (previous) observer?.unobserve(previous)
  if (element) observer?.observe(element)
}, { flush: 'post' })
onMounted(() => {
  void loadUsers(1)
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting) && hasMore.value && !loading.value) void loadUsers(page.value + 1, true)
    }, { rootMargin: '240px 0px' })
    if (scrollSentinel.value) observer.observe(scrollSentinel.value)
  }
})
onUnmounted(() => {
  clearTimeout(debounceTimer)
  observer?.disconnect()
  requestSequence += 1
})

async function submit(payload: NewUserPayload) {
  if (submitting.value) return
  submitting.value = true
  error.value = ''
  notice.value = ''
  created.value = null
  try {
    created.value = await createUser(payload)
    showToast(`Akun ${created.value.username} berhasil dibuat.`)
    userForm.value?.clearPassword()
    activeTab.value = 'list'
    await loadUsers(1)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Akun gagal dibuat. Coba lagi.'
    showToast(error.value, 'error')
  } finally {
    submitting.value = false
  }
}

async function changeRole(user: WorkspaceUser, role: 'admin' | 'member') {
  if (role === user.role || changingId.value !== null) return
  changingId.value = user.id
  notice.value = ''
  loadError.value = ''
  try {
    const updated = await updateUserRole(user.id, role)
    users.value = users.value.map((item) => item.id === user.id ? { ...item, role: updated.role } : item)
    showToast(`Role ${user.name} sekarang ${role === 'admin' ? 'Admin' : 'Anggota'}.`)
  } catch (cause) {
    loadError.value = cause instanceof Error ? cause.message : 'Role pengguna gagal diperbarui.'
    showToast(loadError.value, 'error')
  } finally {
    changingId.value = null
  }
}
</script>

<template>
  <main class="users-page"><div class="page-content">
    <div class="breadcrumb"><span>Pengaturan</span><AppIcon name="chevron-right" :size="13" /><strong>Pengguna</strong></div>
    <header class="page-heading"><div><span class="page-overline"><i></i> AKSES TIM</span><h1>Pengguna</h1><p>Kelola anggota dan role di workspace yang sedang aktif.</p></div><button class="add-user" type="button" @click="activeTab = 'create'"><AppIcon name="plus" :size="16" /> Tambah pengguna</button></header>
    <nav class="tabs" aria-label="Pengguna workspace"><button type="button" :class="{ selected: activeTab === 'list' }" @click="activeTab = 'list'">Daftar pengguna <span>{{ total }}</span></button><button type="button" :class="{ selected: activeTab === 'create' }" @click="activeTab = 'create'">Tambah pengguna</button></nav>
    <div v-if="notice" class="notice-banner" role="status"><AppIcon name="check" :size="15" />{{ notice }}</div>
    <section v-if="activeTab === 'list'" class="list-section">
      <div class="list-toolbar"><div class="list-heading"><h2>Anggota workspace</h2><span class="result-count">{{ total }}</span></div><span class="search-hint"><AppIcon name="search" :size="14" /> Gunakan pencarian di bagian atas</span></div>
      <div v-if="loadError" class="error-banner" role="alert">{{ loadError }} <button type="button" @click="loadUsers(hasMore ? page + 1 : 1, hasMore)">Coba lagi</button></div>
      <section class="list-panel" aria-label="Daftar pengguna workspace"><UsersList :users="users" :loading="loading" :changing-id="changingId" @change-role="changeRole" /></section>
      <div v-if="users.length" ref="scrollSentinel" class="scroll-status" aria-live="polite"><span v-if="loading"><i class="loading-dot"></i> Memuat pengguna berikutnya...</span><button v-else-if="hasMore" type="button" @click="loadUsers(page + 1, true)">Muat pengguna berikutnya</button><span v-else>Semua {{ total }} pengguna sudah ditampilkan</span></div>
    </section>
    <template v-else>
    <section v-if="created" class="account-summary"><AppIcon name="check" :size="18" /><div><strong>{{ created.name }}</strong><span>{{ created.username }} · {{ created.email }}</span></div><span class="member-badge">Anggota</span></section>
    <section class="form-card"><header><div><span class="card-eyebrow">PENGGUNA BARU</span><h2>Informasi akun</h2></div><AppIcon name="users" :size="19" /></header><UserForm ref="userForm" :submitting="submitting" :error="error" @submit="submit" /></section>
    <section class="users-note"><AppIcon name="info" :size="16" /><p>Akun baru mendapat role Anggota dan hanya tergabung di workspace aktif. Bagikan username dan kata sandi awal kepada anggota melalui jalur yang aman. Pendaftaran publik tidak tersedia.</p></section>
    </template>
  </div></main>
</template>

<style scoped>
.users-page{min-height:calc(100vh - 64px);margin-left:76px;color:#eff1ed}.page-content{width:min(100%,1200px);margin:0 auto;padding:24px clamp(20px,3vw,48px) 45px}.breadcrumb{display:flex;align-items:center;gap:7px;color:#92988e;font-size:10px}.breadcrumb strong{color:#dce0d7;font-weight:600}.breadcrumb svg{color:#696f66}.page-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin:24px 0 22px}.page-overline{display:flex;align-items:center;gap:7px;color:#a1a99a;font-size:9px;font-weight:700;letter-spacing:1.25px}.page-overline i{width:6px;height:6px;border-radius:50%;background:#ffd64c}.page-heading h1{margin:9px 0 5px;font:700 30px Manrope,sans-serif;letter-spacing:-1px}.page-heading p{margin:0;color:#9da398;font-size:11px}.notice-banner,.account-summary{display:flex;align-items:center;gap:9px;margin-bottom:14px;padding:11px 13px;border:1px solid #8bd74f25;border-radius:8px;background:#8bd74f0b;color:#c5df9e;font-size:11px}.account-summary>div{display:grid;gap:3px;min-width:0}.account-summary strong{overflow-wrap:anywhere;color:#e5eadf;font-size:11px}.account-summary>div span{overflow-wrap:anywhere;color:#9da398;font-size:10px}.member-badge{margin-left:auto;flex:none;padding:5px 8px;border:1px solid #8bd74f35;border-radius:20px;color:#c5df9e;font-size:9px}.form-card{overflow:hidden;border:1px solid #ffffff14;border-radius:12px;background:#191b19}.form-card>header{display:flex;align-items:center;justify-content:space-between;padding:15px 18px;border-bottom:1px solid #ffffff12}.form-card>header>svg{color:#ffd64c}.card-eyebrow{color:#a0a79b;font-size:9px;font-weight:700;letter-spacing:1.1px}.form-card h2{margin:5px 0 0;font:650 16px Manrope,sans-serif}.users-note{display:flex;align-items:flex-start;gap:10px;margin-top:14px;padding:13px 15px;border:1px solid #ffd64c20;border-radius:9px;background:#ffd64c08;color:#c8bd91}.users-note svg{flex:none;color:#ffd64c}.users-note p{margin:0;font-size:10px;line-height:1.6}@media(max-width:600px){.users-page{min-height:calc(100vh - 58px);margin-left:0}.page-content{padding:18px 12px 32px}.page-heading{margin:20px 0}.page-heading h1{font-size:25px}.form-card>header{padding:13px}}
.add-user{height:39px;display:flex;align-items:center;gap:7px;padding:0 13px;border:0;border-radius:8px;background:#ffd64c;color:#263215;font-size:10px;font-weight:700;cursor:pointer}.tabs{display:flex;gap:5px;margin-bottom:19px;padding:4px;border:1px solid #ffffff12;border-radius:9px;background:#191b19}.tabs button{min-height:34px;display:flex;align-items:center;gap:8px;padding:0 12px;border:1px solid transparent;border-radius:6px;background:transparent;color:#a4aa9f;font:500 10px 'DM Sans',sans-serif;cursor:pointer}.tabs button.selected{border-color:#ffffff12;background:#ffffff0a;color:#e5e9e0}.tabs button span,.result-count{padding:3px 7px;border-radius:12px;background:#ffffff0d;color:#b8c0b0;font-size:9px}.list-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:11px}.list-heading{display:flex;align-items:center;gap:9px}.list-heading h2{margin:0;font:700 15px Manrope,sans-serif}.search-hint{display:flex;align-items:center;gap:6px;color:#8f968b;font-size:10px}.list-panel{overflow:hidden;border:1px solid #ffffff12;border-radius:11px;background:#191b19}.scroll-status{min-height:43px;display:flex;align-items:center;justify-content:center;padding:12px;color:#92988e;font-size:10px}.scroll-status button{padding:7px 11px;border:1px solid #ffffff18;border-radius:7px;background:transparent;color:#c7d99f;font-size:10px;cursor:pointer}.loading-dot{width:7px;height:7px;display:inline-block;margin-right:7px;border-radius:50%;background:#ffd64c;animation:pulse .9s infinite alternate}@keyframes pulse{to{opacity:.35;transform:scale(.7)}}.error-banner{display:flex;align-items:center;gap:9px;margin-bottom:12px;padding:10px 12px;border:1px solid #a7463c55;border-radius:8px;background:#a7463c18;color:#ffb4a8;font-size:11px}.error-banner button{margin-left:auto;border:0;background:transparent;color:#ffd64c;text-decoration:underline;cursor:pointer}
@media(max-width:600px){.add-user{height:36px;padding:0 10px;font-size:0}.add-user :deep(svg){width:17px}.tabs{margin-bottom:15px}.tabs button{flex:1;justify-content:center;padding:0 8px}.list-toolbar{align-items:flex-start;flex-direction:column}.search-hint{font-size:9px}}
</style>
