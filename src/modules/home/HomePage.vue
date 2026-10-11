<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '../../shared/components/layout/AppIcon.vue'
import type { MenuItem } from '../../shared/api/navigation'
import { navigationKey } from '../../app/keys'
import { frontendRouteFor } from '../../app/menuRoutes'
import { useGlobalSearch } from '../../shared/composables/useGlobalSearch'
import { getProjectFinancialReport } from '../projects/financial-report/api/financialReports'
import type { FinancialReportSummary } from '../projects/financial-report/types/financialReport'
import FinancialDashboardSummary from './components/summary/FinancialDashboardSummary.vue'
import ProjectDashboardSummary from './components/summary/ProjectDashboardSummary.vue'
import { getProjects } from '../projects/project/api/projects'

const router = useRouter()
const navigation = inject(navigationKey, ref<MenuItem[]>([]))
const { searchQuery: query } = useGlobalSearch()
const currentDate = computed(() => new Intl.DateTimeFormat('id-ID', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
}).format(new Date()))
const today = new Date()
const reportPeriod = computed(() => new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(today))
const dateValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const reportSummary = ref<FinancialReportSummary | null>(null)
const summaryLoading = ref(false)
const summaryError = ref('')
const projectCounts = ref<{ completed: number; inProgress: number } | null>(null)
const projectCountsLoading = ref(false)
const projectCountsError = ref('')

const modules = computed(() => navigation.value.flatMap((parent) => {
  if (parent.route_name === 'dashboard') return []
  const entries = parent.children.length ? parent.children : [parent]
  return entries.map((item) => ({ ...item, group: parent.label }))
}))
const canViewFinancialReport = computed(() => modules.value.some((item) => item.route_name === 'reports.financial.index'))
const canViewProjects = computed(() => modules.value.some((item) => item.route_name === 'projects.index'))
const visibleModules = computed(() => modules.value.filter((item) => {
  const term = query.value.trim().toLocaleLowerCase('id-ID')
  const matchesSearch = !term || `${item.label} ${item.group}`.toLocaleLowerCase('id-ID').includes(term)
  return matchesSearch
}))

function openModule(item: MenuItem) {
  const path = frontendRouteFor(item.route_name)
  if (path) void router.push(path)
}

async function loadFinancialSummary() {
  if (!canViewFinancialReport.value || summaryLoading.value) return
  summaryLoading.value = true; summaryError.value = ''
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  try {
    const report = await getProjectFinancialReport({ dateFrom: dateValue(firstDay), dateTo: dateValue(today), projectId: '' }, 1)
    reportSummary.value = report.summary
  } catch (error) {
    summaryError.value = error instanceof Error ? error.message : 'Ringkasan keuangan gagal dimuat.'
  } finally { summaryLoading.value = false }
}

async function loadProjectCounts() {
  if (!canViewProjects.value || projectCountsLoading.value) return
  projectCountsLoading.value = true; projectCountsError.value = ''
  try {
    const [completed, active, onHold] = await Promise.all([
      getProjects({ search: '', page: 1, perPage: 1, status: 'completed' }),
      getProjects({ search: '', page: 1, perPage: 1, status: 'active' }),
      getProjects({ search: '', page: 1, perPage: 1, status: 'on_hold' }),
    ])
    projectCounts.value = { completed: completed.total, inProgress: active.total + onHold.total }
  } catch (error) {
    projectCountsError.value = error instanceof Error ? error.message : 'Ringkasan project gagal dimuat.'
  } finally { projectCountsLoading.value = false }
}

watch(canViewFinancialReport, (allowed) => { if (allowed) void loadFinancialSummary() }, { immediate: true })
watch(canViewProjects, (allowed) => { if (allowed) void loadProjectCounts() }, { immediate: true })
</script>

<template>
  <main class="dashboard-main">
      <div class="dashboard-content">
        <section class="dashboard-welcome">
          <div class="welcome-copy">
            <span class="welcome-overline"><span></span> DASHBOARD</span>
            <h1>Selamat datang kembali<span class="welcome-spark">✳</span></h1>
            <p>Ruang kerja rapi untuk semua hal yang sedang kamu bangun.</p>
          </div>
          <div class="welcome-date"><AppIcon name="calendar" :size="16" /><span>{{ currentDate }}</span></div>
          <div class="welcome-glow"></div>
          <div class="welcome-orbit welcome-orbit-one"></div>
          <div class="welcome-orbit welcome-orbit-two"></div>
        </section>

        <section v-if="canViewFinancialReport" class="financial-overview" aria-live="polite">
          <FinancialDashboardSummary v-if="reportSummary" :summary="reportSummary" :period-label="`Bulan ${reportPeriod}`" />
          <div v-else-if="summaryLoading" class="dashboard-summary-state"><span class="loading-dot"></span>Memuat ringkasan keuangan bulan {{ reportPeriod }}...</div>
          <div v-else-if="summaryError" class="dashboard-summary-state dashboard-summary-error" role="alert"><span>{{ summaryError }}</span><button type="button" @click="loadFinancialSummary">Coba lagi</button></div>
        </section>
        <section v-else class="finance-access-note"><AppIcon name="info" :size="15" /><span>Ringkasan keuangan hanya tersedia untuk akun dengan akses laporan.</span></section>

        <section v-if="canViewProjects" class="project-overview-section" aria-live="polite">
          <ProjectDashboardSummary v-if="projectCounts" :completed="projectCounts.completed" :in-progress="projectCounts.inProgress" />
          <div v-else-if="projectCountsLoading" class="dashboard-summary-state"><span class="loading-dot"></span>Memuat status project...</div>
          <div v-else-if="projectCountsError" class="dashboard-summary-state dashboard-summary-error" role="alert"><span>{{ projectCountsError }}</span><button type="button" @click="loadProjectCounts">Coba lagi</button></div>
        </section>

        <section class="modules-section">
          <div class="modules-heading">
            <div>
              <span class="section-overline">MENU KERJA</span>
              <h2>Menu utama</h2>
              <p>Pilih menu yang ingin kamu buka.</p>
            </div>
          </div>

          <div v-if="visibleModules.length" class="module-grid">
            <article v-for="(item, index) in visibleModules" :key="item.key" class="module-card" :class="`module-card-tone-${index % 4}`">
              <div class="module-card-art">
                <div class="art-grid"></div>
                <div class="module-card-emblem"><AppIcon :name="item.icon || 'dashboard'" :size="27" :stroke-width="1.55" /></div>
                <span class="module-group-tag">{{ item.group }}</span>
                <span class="module-art-orbit"></span>
              </div>
              <div class="module-card-info">
                <div class="module-card-copy"><span class="module-key">{{ item.key }}</span><h3>{{ item.label }}</h3><p>Kelola dan lihat informasi {{ item.label.toLocaleLowerCase('id-ID') }}.</p></div>
                <button class="module-open" type="button" :disabled="!frontendRouteFor(item.route_name)" :aria-label="`Buka ${item.label}`" @click="openModule(item)"><AppIcon name="arrow-up-right" :size="18" /></button>
              </div>
            </article>
          </div>

          <div v-else class="empty-modules">
            <span class="empty-icon"><AppIcon name="search" :size="22" /></span>
            <strong>{{ navigation.length ? 'Menu tidak ditemukan' : 'Belum ada menu untuk ditampilkan' }}</strong>
            <p>{{ navigation.length ? 'Coba kata pencarian atau filter yang berbeda.' : 'Menu akan muncul di sini setelah diatur oleh administrator.' }}</p>
          </div>
        </section>

        <footer class="dashboard-footer"><span>UDev <i>·</i> Udumbara Informatika</span><span>Kerja cerdas. Tumbuh bersama. <b>✳</b></span></footer>
      </div>
  </main>
</template>

<style scoped>
.udev-workspace{--workspace-bg:#0f100f;--workspace-surface:#191b19;--workspace-line:#ffffff12;min-height:100vh;background:var(--workspace-bg);color:#eff1ed}.dashboard-main{min-height:calc(100vh - 64px);margin-left:76px;transition:margin-left .2s ease}.workspace-filters{position:sticky;z-index:20;top:64px;display:flex;gap:10px;overflow-x:auto;padding:13px clamp(20px,3vw,48px);border-bottom:1px solid #ffffff09;background:rgba(15,16,15,.84);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);scrollbar-width:none}.workspace-filters::-webkit-scrollbar{display:none}.filter-chip{height:34px;flex:none;padding:0 14px;border:0;border-radius:8px;background:#242624;color:#e7e9e5;font-size:12px;font-weight:600;white-space:nowrap;cursor:pointer;transition:background .15s,color .15s}.filter-chip:hover{background:#343734}.filter-chip-active{background:#f1f2ef;color:#171916}.dashboard-content{max-width:1640px;margin:0 auto;padding:25px clamp(20px,3vw,48px) 24px}.dashboard-welcome{position:relative;min-height:174px;display:flex;align-items:center;justify-content:space-between;overflow:hidden;padding:27px 31px;border:1px solid #ffffff0d;border-radius:15px;background:linear-gradient(112deg,#1b2515 0%,#1c2119 51%,#20241e 100%)}.welcome-copy,.welcome-date{position:relative;z-index:2}.welcome-overline,.section-overline{display:flex;align-items:center;gap:8px;color:#a1a99a;font-size:9px;font-weight:700;letter-spacing:1.35px}.welcome-overline>span{width:6px;height:6px;border-radius:50%;background:#ffd64c;box-shadow:0 0 11px #ffd64c86}.welcome-copy h1{margin:13px 0 7px;font:700 clamp(24px,3vw,34px) Manrope,sans-serif;letter-spacing:-1.3px}.welcome-spark{margin-left:9px;color:#ffd64c;font-size:18px;vertical-align:5px}.welcome-copy p{margin:0;color:#aeb4a8;font-size:12px}.welcome-date{display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid #ffffff1a;border-radius:8px;background:#10131069;color:#d8dccf;font-size:10px}.welcome-date svg{color:#c5dd90}.welcome-glow{position:absolute;top:-180px;right:13%;width:360px;height:360px;border-radius:50%;background:#8bd74f0a;filter:blur(20px)}.welcome-orbit{position:absolute;border:1px solid #ffffff0b;border-radius:50%;pointer-events:none}.welcome-orbit-one{width:310px;height:310px;top:-110px;right:17%}.welcome-orbit-two{width:220px;height:220px;top:-64px;right:20%}.modules-section{margin-top:30px}.modules-heading{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:16px}.section-overline{color:#8d9389;font-size:9px}.modules-heading h2{margin:7px 0 4px;font:700 19px Manrope,sans-serif;letter-spacing:-.4px}.modules-heading p{margin:0;color:#969b92;font-size:11px}.filter-button{height:35px;display:flex;align-items:center;gap:8px;padding:0 12px;border:1px solid #ffffff1b;border-radius:8px;background:transparent;color:#c7cbc3;font-size:10px;cursor:pointer}.filter-button:hover{background:#ffffff0b}.module-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.module-card{overflow:hidden;border:1px solid #ffffff10;border-radius:12px;background:#181a18;transition:transform .18s,border-color .18s,background .18s}.module-card:hover{transform:translateY(-3px);border-color:#ffffff26;background:#1c1e1c}.module-card-art{position:relative;height:128px;display:grid;place-items:center;overflow:hidden;background:linear-gradient(135deg,#223018,#172016 70%)}.module-card-tone-1 .module-card-art{background:linear-gradient(135deg,#262712,#1c1b10 70%)}.module-card-tone-2 .module-card-art{background:linear-gradient(135deg,#272018,#1d1915 70%)}.module-card-tone-3 .module-card-art{background:linear-gradient(135deg,#1e2622,#171d19 70%)}.art-grid{position:absolute;inset:0;background-image:linear-gradient(#ffffff08 1px,transparent 1px),linear-gradient(90deg,#ffffff08 1px,transparent 1px);background-size:25px 25px;mask-image:linear-gradient(90deg,transparent,#000 45%,#000)}.module-card-emblem{position:relative;z-index:1;width:54px;height:54px;display:grid;place-items:center;border:1px solid #c5e49d36;border-radius:17px;background:#8bd74f12;color:#c9ec9e;box-shadow:0 0 45px #8bd74f14}.module-card-tone-1 .module-card-emblem{border-color:#ffd64c36;background:#ffd64c10;color:#ffdf75}.module-card-tone-2 .module-card-emblem{border-color:#ef982538;background:#ef982510;color:#f4b66a}.module-card-tone-3 .module-card-emblem{border-color:#9bc9be38;background:#9bc9be10;color:#acd8c9}.module-group-tag{position:absolute;z-index:1;top:12px;left:13px;padding:5px 8px;border:1px solid #ffffff16;border-radius:5px;background:#10121080;color:#c3c9be;font-size:9px}.module-art-orbit{position:absolute;right:-36px;bottom:-95px;width:210px;height:210px;border:1px solid #ffffff10;border-radius:50%}.module-card-info{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 16px 16px}.module-card-copy{min-width:0}.module-key{color:#93998f;font-size:9px;letter-spacing:.5px}.module-card-info h3{margin:5px 0;color:#f0f1ed;font:700 15px Manrope,sans-serif}.module-card-info p{margin:0;color:#9da198;font-size:10px;line-height:1.55}.module-open{width:34px;height:34px;display:grid;place-items:center;flex:none;border:1px solid #ffffff18;border-radius:50%;background:transparent;color:#d5d9d0;cursor:pointer;transition:background .15s,color .15s}.module-open:hover{background:#ffd64c;color:#1a2113}.empty-modules{min-height:230px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px dashed #ffffff1b;border-radius:13px;background:#ffffff03;text-align:center}.empty-icon{width:46px;height:46px;display:grid;place-items:center;margin-bottom:12px;border:1px solid #ffffff14;border-radius:14px;color:#b9c49f}.empty-modules strong{font-size:13px}.empty-modules p{margin:7px 16px 0;color:#9ca197;font-size:11px}.dashboard-footer{display:flex;justify-content:space-between;gap:16px;margin-top:45px;padding:15px 2px;border-top:1px solid #ffffff10;color:#81877e;font-size:9px}.dashboard-footer i{margin:0 5px;color:#d5d9d0;font-style:normal}.dashboard-footer b{margin-left:4px;color:#ffd64c}
@media(max-width:1000px){.module-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.dashboard-content{padding-right:23px;padding-left:23px}.topbar-inner{gap:14px}}
@media(max-width:600px){.dashboard-main{min-height:calc(100vh - 58px);margin-left:0}.mobile-nav-backdrop{position:fixed;z-index:35;inset:58px 0 0;width:100%;border:0;background:rgba(0,0,0,.62);backdrop-filter:blur(2px)}.workspace-filters{top:58px;gap:7px;padding:11px 12px}.filter-chip{height:31px;padding:0 11px;font-size:10px}.dashboard-content{padding:17px 12px 20px}.dashboard-welcome{min-height:145px;align-items:flex-start;justify-content:center;flex-direction:column;gap:12px;padding:19px 16px}.welcome-copy h1{margin-top:10px;font-size:23px}.welcome-copy p{max-width:260px;font-size:10px;line-height:1.6}.welcome-date{padding:7px 9px;font-size:9px}.welcome-orbit-one{right:-100px}.welcome-orbit-two{right:-56px}.modules-section{margin-top:23px}.modules-heading{align-items:center}.modules-heading h2{font-size:16px}.modules-heading p{font-size:9px}.filter-button{width:35px;justify-content:center;padding:0}.filter-button span{display:none}.module-grid{grid-template-columns:1fr;gap:11px}.module-card{display:grid;grid-template-columns:100px minmax(0,1fr);min-height:105px}.module-card-art{height:100%;min-height:105px}.module-card-emblem{width:42px;height:42px;border-radius:14px}.module-card-emblem :deep(svg){width:22px;height:22px}.module-group-tag{top:auto;bottom:7px;left:6px;padding:3px 5px;font-size:7px}.module-card-info{padding:10px 10px 10px 12px}.module-card-info h3{margin:4px 0;font-size:13px}.module-card-info p{font-size:9px}.module-key{font-size:8px}.module-open{width:29px;height:29px}.dashboard-footer{flex-direction:column;gap:7px;margin-top:29px;font-size:8px}}
.dashboard-summary-state,.finance-access-note{min-height:85px;display:flex;align-items:center;justify-content:center;gap:10px;margin:22px 0 28px;padding:18px;border:1px solid #ffffff12;border-radius:10px;background:#191b19;color:#aeb5a9;font-size:11px}.dashboard-summary-error{justify-content:space-between;border-color:#a7463c55;color:#ffb4a8}.dashboard-summary-state button{padding:7px 10px;border:1px solid #ffd64c55;border-radius:7px;background:transparent;color:#ffd64c;font-size:10px;cursor:pointer}.finance-access-note{justify-content:flex-start;min-height:54px;color:#d8c18b;font-size:10px}.finance-access-note :deep(svg){flex:none;color:#ffd64c}.loading-dot{width:8px;height:8px;border-radius:50%;background:#8bd74f;box-shadow:0 0 12px #8bd74f80;animation:pulse .9s infinite alternate}@keyframes pulse{to{opacity:.35;transform:scale(.7)}}
@media(prefers-reduced-motion:reduce){.module-card,.app-sidebar,.dashboard-main{transition:none}}
</style>
