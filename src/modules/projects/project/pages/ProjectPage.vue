<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import AppIcon from '../../../../shared/components/layout/AppIcon.vue'
import { useGlobalSearch } from '../../../../shared/composables/useGlobalSearch'
import { useToast } from '../../../../shared/composables/useToast'
import { getCustomers } from '../../../master/customers/api/customers'
import type { Customer } from '../../../master/customers/types/customer'
import { getProjectTypes } from '../../../master/project-types/api/projectTypes'
import type { ProjectType } from '../../../master/project-types/types/projectType'
import { createProject, getProjects, updateProject } from '../api/projects'
import ProjectFormModal from '../components/modal/ProjectFormModal.vue'
import ProjectList from '../components/list-data/ProjectList.vue'
import type { PaginatedProjects, Project, ProjectPayload } from '../types/project'

const { searchQuery } = useGlobalSearch()
const { showToast } = useToast()
const projects = ref<Project[]>([])
const customers = ref<Customer[]>([])
const projectTypes = ref<ProjectType[]>([])
const loading = ref(true)
const loadingChoices = ref(true)
const page = ref(1)
const lastPage = ref(1)
const total = ref(0)
const modalOpen = ref(false)
const currentProject = ref<Project | null>(null)
const submitting = ref(false)
const formError = ref('')
const loadError = ref('')
const optionsError = ref('')
const notice = ref('')
const scrollSentinel = ref<HTMLElement | null>(null)
const hasMore = computed(() => page.value < lastPage.value)
let debounceTimer: ReturnType<typeof setTimeout> | undefined
let observer: IntersectionObserver | undefined
let requestSequence = 0

async function loadProjects(requestedPage = 1, append = false) {
  if (append && loading.value) return
  const requestId = ++requestSequence
  loading.value = true
  loadError.value = ''
  try {
    const result: PaginatedProjects = await getProjects({ search: searchQuery.value, page: requestedPage, perPage: 20 })
    if (requestId !== requestSequence) return
    projects.value = append ? [...projects.value, ...result.data] : result.data
    page.value = result.current_page
    lastPage.value = result.last_page
    total.value = result.total
  } catch (error) {
    if (requestId !== requestSequence) return
    loadError.value = error instanceof Error ? error.message : 'Project gagal dimuat.'
  } finally {
    if (requestId === requestSequence) loading.value = false
  }
}

async function loadAllChoices() {
  loadingChoices.value = true
  optionsError.value = ''
  try {
    const [customerPages, typePages] = await Promise.all([
      getCustomers({ search: '', page: 1, perPage: 100, isActive: true }),
      getProjectTypes({ search: '', page: 1, perPage: 100, isActive: true }),
    ])
    const customerResults = [...customerPages.data]
    const typeResults = [...typePages.data]
    for (let next = 2; next <= customerPages.last_page; next += 1) {
      const result = await getCustomers({ search: '', page: next, perPage: 100, isActive: true })
      customerResults.push(...result.data)
    }
    for (let next = 2; next <= typePages.last_page; next += 1) {
      const result = await getProjectTypes({ search: '', page: next, perPage: 100, isActive: true })
      typeResults.push(...result.data)
    }
    customers.value = customerResults
    projectTypes.value = typeResults
  } catch (error) {
    optionsError.value = error instanceof Error ? error.message : 'Pilihan pelanggan dan jenis project gagal dimuat.'
  } finally {
    loadingChoices.value = false
  }
}

watch(searchQuery, () => {
  page.value = 1
  projects.value = []
  lastPage.value = 1
  total.value = 0
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => void loadProjects(1), 300)
})
watch(scrollSentinel, (element, previous) => {
  if (previous) observer?.unobserve(previous)
  if (element) observer?.observe(element)
}, { flush: 'post' })

onMounted(() => {
  void loadProjects(1)
  void loadAllChoices()
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting) && hasMore.value && !loading.value) {
        void loadProjects(page.value + 1, true)
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
  currentProject.value = null
  formError.value = ''
  modalOpen.value = true
}
function openEdit(project: Project) {
  currentProject.value = project
  formError.value = ''
  modalOpen.value = true
}
async function saveProject(payload: ProjectPayload) {
  submitting.value = true
  formError.value = ''
  try {
    const editing = currentProject.value !== null
    if (currentProject.value) await updateProject(currentProject.value.id, payload)
    else await createProject(payload)
    modalOpen.value = false
    showToast(editing ? 'Project berhasil diperbarui.' : 'Project berhasil ditambahkan.')
    projects.value = []
    page.value = 1
    await loadProjects(1)
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'Project gagal disimpan.'
    showToast(formError.value, 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="projects-page">
    <div class="page-content">
      <div class="breadcrumb"><span>Project</span><AppIcon name="chevron-right" :size="13" /><strong>Daftar Project</strong></div>
      <header class="page-heading"><div><span class="page-overline"><i></i> WORKSPACE PROJECT</span><h1>Daftar Project</h1><p>Kelola project, pelanggan, jenis aplikasi, dan target pengerjaannya.</p></div><button class="add-button" type="button" :disabled="loadingChoices || !customers.length || !projectTypes.length" @click="openCreate"><AppIcon name="plus" :size="17" /><span>Project baru</span></button></header>
      <div class="list-toolbar"><div class="list-heading"><h2>Daftar project</h2><span class="result-count">{{ total }}</span></div><span class="search-hint"><AppIcon name="search" :size="14" /> Gunakan pencarian di bagian atas</span></div>
      <div v-if="optionsError" class="error-banner" role="alert">{{ optionsError }} <button type="button" @click="loadAllChoices">Coba muat pilihan lagi</button></div>
      <div v-if="notice" class="notice-banner" role="status"><AppIcon name="sparkle" :size="15" />{{ notice }}<button type="button" aria-label="Tutup pemberitahuan" @click="notice = ''"><AppIcon name="x" :size="15" /></button></div>
      <div v-if="loadError" class="error-banner" role="alert">{{ loadError }} <button type="button" @click="loadProjects(hasMore ? page + 1 : 1, hasMore)">Coba lagi</button></div>
      <section class="list-panel" aria-label="Daftar project"><ProjectList :projects="projects" :loading="loading && projects.length === 0" @edit="openEdit" /></section>
      <div v-if="projects.length" ref="scrollSentinel" class="scroll-status" aria-live="polite">
        <span v-if="loading"><i class="loading-dot"></i> Memuat project berikutnya...</span>
        <button v-else-if="hasMore" type="button" @click="loadProjects(page + 1, true)">Muat project berikutnya</button>
        <span v-else>Semua {{ total }} project sudah ditampilkan</span>
      </div>
    </div>
    <ProjectFormModal :open="modalOpen" :project="currentProject" :customers="customers" :project-types="projectTypes" :submitting="submitting" :error="formError" @close="modalOpen = false" @submit="saveProject" />
  </main>
</template>

<style scoped>
.projects-page{min-height:calc(100vh - 64px);margin-left:76px;color:#eff1ed}.page-content{width:min(100%,1500px);margin:0 auto;padding:24px clamp(20px,3vw,48px) 45px}.breadcrumb{display:flex;align-items:center;gap:7px;color:#92988e;font-size:10px}.breadcrumb strong{color:#dce0d7;font-weight:600}.breadcrumb svg{color:#696f66}.page-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin:24px 0 27px}.page-overline{display:flex;align-items:center;gap:7px;color:#a1a99a;font-size:9px;font-weight:700;letter-spacing:1.25px}.page-overline i{width:6px;height:6px;border-radius:50%;background:#ffd64c}.page-heading h1{margin:9px 0 5px;font:700 30px Manrope,sans-serif;letter-spacing:-1px}.page-heading p{margin:0;color:#9da398;font-size:11px}.add-button{height:39px;display:flex;align-items:center;gap:8px;padding:0 14px;border:0;border-radius:8px;background:#ffd64c;color:#263215;font-size:11px;font-weight:700;cursor:pointer}.add-button:hover:not(:disabled){background:#ffe173}.add-button:disabled{opacity:.5;cursor:wait}.list-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.list-heading{display:flex;align-items:center;gap:9px}.list-heading h2{margin:0;font:700 15px Manrope,sans-serif}.result-count{padding:3px 7px;border-radius:12px;background:#ffffff0d;color:#b8c0b0;font-size:9px}.search-hint{display:flex;align-items:center;gap:6px;color:#8f968b;font-size:10px}.list-panel{overflow:hidden;border:1px solid #ffffff12;border-radius:11px;background:#191b19}.scroll-status{min-height:43px;display:flex;align-items:center;justify-content:center;padding:12px;color:#92988e;font-size:10px}.scroll-status button{padding:7px 11px;border:1px solid #ffffff18;border-radius:7px;background:transparent;color:#c7d99f;font-size:10px;cursor:pointer}.loading-dot{width:7px;height:7px;display:inline-block;margin-right:7px;border-radius:50%;background:#ffd64c;animation:pulse .9s infinite alternate}@keyframes pulse{to{opacity:.35;transform:scale(.7)}}.notice-banner,.error-banner{display:flex;align-items:center;gap:9px;margin-bottom:12px;padding:10px 12px;border:1px solid #8bd74f25;border-radius:8px;background:#8bd74f0b;color:#c5df9e;font-size:11px}.notice-banner button{width:25px;height:25px;display:grid;place-items:center;margin-left:auto;border:0;background:transparent;color:inherit;cursor:pointer}.error-banner{border-color:#a7463c55;background:#a7463c18;color:#ffb4a8}.error-banner button{margin-left:auto;border:0;background:transparent;color:#ffd64c;text-decoration:underline;cursor:pointer}
@media(max-width:600px){.projects-page{min-height:calc(100vh - 58px);margin-left:0}.page-content{padding:18px 12px 32px}.page-heading{align-items:flex-start;margin:20px 0 22px}.page-heading h1{font-size:25px}.page-heading p{max-width:250px;line-height:1.5}.add-button{height:36px;padding:0 10px;font-size:0}.list-toolbar{align-items:flex-start;flex-direction:column}.search-hint{font-size:9px}}
@media(max-width:600px){.page-heading p{max-width:220px}}
</style>
