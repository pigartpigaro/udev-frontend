<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import AppIcon from '../../../../shared/components/layout/AppIcon.vue'
import { getProjects } from '../../project/api/projects'
import { getProjectFinancialReport } from '../api/financialReports'
import FinancialReportFilters from '../components/form/FinancialReportFilters.vue'
import FinancialProjectList from '../components/list-data/FinancialProjectList.vue'
import FinancialReportSummary from '../components/summary/FinancialReportSummary.vue'
import FinancialReportDocument from '../components/document/FinancialReportDocument.vue'
import { downloadFinancialReportExcel, downloadFinancialReportPdf } from '../utils/reportExport'
import type { FinancialProjectRow, FinancialReportFilters as Filters, FinancialReportSummary as Summary } from '../types/financialReport'

const today = new Date()
const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
const filters = ref<Filters>({ dateFrom: localDate(firstDay), dateTo: localDate(today), projectId: '' })
const emptySummary = (): Summary => ({ invoice_issued: '0.00', received: '0.00', project_expenses: '0.00', operational_expenses: '0.00', expenses: '0.00', cash_flow: '0.00', outstanding: '0.00', team_loans_issued: '0.00', team_loan_repayments: '0.00', team_loans_outstanding: '0.00', cash_available: '0.00' })
const summary = ref<Summary>(emptySummary())
const rows = ref<FinancialProjectRow[]>([])
const projectOptions = ref<Array<{ value: string; label: string }>>([{ value: '', label: 'Semua project' }])
const projectLoading = ref(false); const loading = ref(true); const loadingProjects = ref(true)
const page = ref(1); const lastPage = ref(1); const totalProjects = ref(0)
const loadError = ref(''); const projectError = ref(''); const sentinel = ref<HTMLElement | null>(null)
const exportLoading = ref(false); const exportError = ref(''); const pdfDocument = ref<InstanceType<typeof FinancialReportDocument> | null>(null)
const exportRows = ref<FinancialProjectRow[]>([]); const exportSummary = ref<Summary>(emptySummary()); const exportFilters = ref<Filters>({ ...filters.value })
const hasMore = computed(() => page.value < lastPage.value)
let observer: IntersectionObserver | undefined; let timer: ReturnType<typeof setTimeout> | undefined; let sequence = 0

async function loadReport(requestedPage = 1, append = false) {
  if (append && loading.value) return
  const request = ++sequence; loading.value = true; loadError.value = ''
  try {
    const report = await getProjectFinancialReport(filters.value, requestedPage)
    if (request !== sequence) return
    summary.value = report.summary
    rows.value = append ? [...rows.value, ...report.projects.data] : report.projects.data
    page.value = report.projects.current_page; lastPage.value = report.projects.last_page; totalProjects.value = report.projects.total
  } catch (error) { if (request === sequence) loadError.value = error instanceof Error ? error.message : 'Laporan keuangan gagal dimuat.' }
  finally { if (request === sequence) loading.value = false }
}

async function loadProjectOptions() {
  projectLoading.value = true; projectError.value = ''
  try {
    const first = await getProjects({ search: '', page: 1, perPage: 100 })
    const projects = [...first.data]
    for (let next = 2; next <= first.last_page; next += 1) projects.push(...(await getProjects({ search: '', page: next, perPage: 100 })).data)
    projectOptions.value = [{ value: '', label: 'Semua project' }, ...projects.map((project) => ({ value: String(project.id), label: `${project.code} — ${project.name}` }))]
  } catch (error) { projectError.value = error instanceof Error ? error.message : 'Pilihan project gagal dimuat.' }
  finally { projectLoading.value = false }
}

async function getAllReportRows(activeFilters: Filters) {
  const first = await getProjectFinancialReport(activeFilters, 1)
  const allRows = [...first.projects.data]
  for (let next = 2; next <= first.projects.last_page; next += 1) {
    allRows.push(...(await getProjectFinancialReport(activeFilters, next)).projects.data)
  }
  return { rows: allRows, summary: first.summary }
}

async function exportReport(format: 'pdf' | 'excel') {
  if (exportLoading.value) return
  exportLoading.value = true; exportError.value = ''
  try {
    const activeFilters = { ...filters.value }
    const report = await getAllReportRows(activeFilters)
    if (format === 'excel') downloadFinancialReportExcel(report.rows, report.summary, activeFilters)
    else {
      exportRows.value = report.rows; exportSummary.value = report.summary; exportFilters.value = activeFilters
      await nextTick()
      if (!pdfDocument.value) throw new Error('Dokumen PDF laporan belum siap.')
      const element = pdfDocument.value.element()
      if (!element) throw new Error('Elemen laporan PDF belum siap.')
      await downloadFinancialReportPdf(element, activeFilters)
    }
  } catch (error) { exportError.value = error instanceof Error ? error.message : 'Ekspor laporan gagal.' }
  finally { exportLoading.value = false }
}

watch(filters, () => {
  rows.value = []; page.value = 1; lastPage.value = 1; totalProjects.value = 0
  clearTimeout(timer); timer = setTimeout(() => void loadReport(), 300)
}, { deep: true })
watch(sentinel, (element, previous) => { if (previous) observer?.unobserve(previous); if (element) observer?.observe(element) }, { flush: 'post' })
onMounted(() => {
  void loadReport(); void loadProjectOptions()
  if ('IntersectionObserver' in window) observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting) && hasMore.value && !loading.value) void loadReport(page.value + 1, true) }, { rootMargin: '240px 0px' })
  if (sentinel.value) observer?.observe(sentinel.value)
})
onUnmounted(() => { clearTimeout(timer); observer?.disconnect(); sequence += 1 })
</script>

<template>
  <main class="financial-report-page"><div class="page-content">
    <div class="breadcrumb"><span>Project</span><AppIcon name="chevron-right" :size="13" /><strong>Laporan Keuangan</strong></div>
    <header class="page-heading"><div><span class="page-overline"><i></i> LAPORAN · KEUANGAN</span><h1>Laporan Keuangan</h1><p>Ringkasan tagihan, penerimaan, dan pengeluaran project.</p></div><div class="export-actions"><button type="button" :disabled="exportLoading || loading || !totalProjects" @click="exportReport('pdf')"><AppIcon name="download" :size="14" /> PDF</button><button type="button" class="excel-button" :disabled="exportLoading || loading || !totalProjects" @click="exportReport('excel')"><AppIcon name="download" :size="14" /> Excel</button></div></header>
    <div v-if="exportError" class="error-banner" role="alert">{{ exportError }}</div>
    <FinancialReportFilters :filters="filters" :project-options="projectOptions" @update:date-from="filters.dateFrom = $event" @update:date-to="filters.dateTo = $event" @update:project-id="filters.projectId = $event" />
    <div v-if="projectError" class="error-banner" role="alert">{{ projectError }} <button type="button" @click="loadProjectOptions">Coba muat pilihan project lagi</button></div>
    <div class="report-note"><AppIcon name="info" :size="14" /><span>Periode berlaku untuk invoice terbit, penerimaan, dan pengeluaran berdasarkan tanggal transaksinya. Sisa tagihan adalah saldo terkini invoice berstatus terbit dan tidak dibatasi periode.</span></div>
    <div v-if="loadError" class="error-banner" role="alert">{{ loadError }} <button type="button" @click="loadReport()">Coba lagi</button></div>
    <FinancialReportSummary :summary="summary" />
    <section class="report-panel"><div class="list-toolbar"><div class="list-heading"><h2>Rincian per project</h2><span class="result-count">{{ totalProjects }}</span></div><span class="search-hint">{{ projectLoading ? 'Memuat pilihan project...' : 'Sisa tagihan menunjukkan saldo saat ini' }}</span></div><FinancialProjectList :rows="rows" :loading="loading" /></section>
    <div v-if="rows.length" ref="sentinel" class="scroll-status" aria-live="polite"><span v-if="loading">Memuat project berikutnya...</span><button v-else-if="hasMore" type="button" @click="loadReport(page + 1, true)">Muat project berikutnya</button><span v-else>Semua {{ totalProjects }} project sudah ditampilkan</span></div>
  </div></main>
  <div class="pdf-renderer" aria-hidden="true"><FinancialReportDocument ref="pdfDocument" :rows="exportRows" :summary="exportSummary" :filters="exportFilters" /></div>
</template>

<style scoped>
.financial-report-page{min-height:calc(100vh - 64px);margin-left:76px;color:#eff1ed}.page-content{width:min(100%,1500px);margin:0 auto;padding:24px clamp(20px,3vw,48px) 45px}.breadcrumb{display:flex;align-items:center;gap:7px;margin-bottom:22px;color:#92988e;font-size:10px}.breadcrumb strong{color:#dce0d7;font-weight:600}.breadcrumb svg{color:#696f66}.page-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin:0 0 22px}.page-overline{display:flex;align-items:center;gap:7px;color:#a1a99a;font-size:9px;font-weight:700;letter-spacing:1.25px}.page-overline i{width:6px;height:6px;border-radius:50%;background:#ffd64c}.page-heading h1{margin:9px 0 5px;font:700 30px Manrope,sans-serif;letter-spacing:-1px}.page-heading p{margin:0;color:#9da398;font-size:11px}.report-note{display:flex;align-items:flex-start;gap:8px;margin:0 0 15px;padding:10px 12px;border:1px solid #d39c3c35;border-radius:8px;background:#d39c3c0c;color:#d9c18b;font-size:10px;line-height:1.5}.report-note svg{flex:none;margin-top:1px}.report-panel{overflow:hidden;border:1px solid #ffffff12;border-radius:11px;background:#191b19}.list-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 14px;border-bottom:1px solid #ffffff0d}.list-heading{display:flex;align-items:center;gap:9px}.list-heading h2{margin:0;font:700 14px Manrope,sans-serif}.result-count{padding:3px 7px;border-radius:12px;background:#ffffff0d;color:#b8c0b0;font-size:9px}.search-hint{color:#858c80;font-size:9px}.scroll-status{min-height:43px;display:flex;align-items:center;justify-content:center;padding:12px;color:#92988e;font-size:10px}.scroll-status button{padding:7px 11px;border:1px solid #ffffff18;border-radius:7px;background:transparent;color:#c7d99f;font-size:10px;cursor:pointer}.error-banner{display:flex;align-items:center;gap:9px;margin-bottom:12px;padding:10px 12px;border:1px solid #a7463c55;border-radius:8px;background:#a7463c18;color:#ffb4a8;font-size:11px}.error-banner button{margin-left:auto;border:0;background:transparent;color:#ffd64c;text-decoration:underline;cursor:pointer}@media(max-width:600px){.financial-report-page{min-height:calc(100vh - 58px);margin-left:0}.page-content{padding:18px 12px 32px}.page-heading{margin:18px 0}.page-heading h1{font-size:25px}.page-heading p{max-width:250px;line-height:1.5}.list-toolbar{align-items:flex-start;flex-direction:column;gap:6px}.search-hint{font-size:9px}}
.export-actions{display:flex;gap:8px;flex:none}.export-actions button{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:35px;padding:0 12px;border:1px solid #ffffff22;border-radius:7px;background:#ffffff08;color:#e8eddf;font-size:10px;font-weight:700;cursor:pointer}.export-actions button.excel-button{border-color:#8bd74f55;color:#cce9ac}.export-actions button:disabled{opacity:.48;cursor:not-allowed}.pdf-renderer{position:fixed;left:-20000px;top:0;z-index:-1;opacity:0;pointer-events:none}.pdf-renderer :deep(.report-document){width:1100px}@media(max-width:600px){.page-heading{align-items:flex-start;flex-direction:column}.export-actions{width:100%}.export-actions button{flex:1}}
</style>
