<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../../../../shared/components/layout/AppIcon.vue'
import { getInvoice } from '../api/invoices'
import type { ProjectInvoice } from '../types/invoice'
import InvoiceDocument from '../components/document/InvoiceDocument.vue'

const route = useRoute()
const router = useRouter()
const invoice = ref<ProjectInvoice | null>(null)
const error = ref('')
const loading = ref(true)
function printInvoice() { window.print() }

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    if (!Number.isInteger(id) || id < 1) throw new Error('Nomor invoice tidak valid.')
    invoice.value = await getInvoice(id)
  } catch (caught) { error.value = caught instanceof Error ? caught.message : 'Invoice gagal dimuat.' }
  finally { loading.value = false }
})
</script>

<template>
  <main class="invoice-print-page">
    <div class="print-toolbar no-print"><button type="button" class="back-button" @click="router.push('/projects/invoices')"><AppIcon name="chevron-left" :size="16" />Kembali ke invoice</button><button v-if="invoice" type="button" class="print-button" @click="printInvoice"><AppIcon name="printer" :size="16" />Cetak</button></div>
    <div v-if="loading" class="page-message">Memuat invoice...</div>
    <div v-else-if="error" class="page-message error">{{ error }}</div>
    <InvoiceDocument v-else-if="invoice" :invoice="invoice" />
  </main>
</template>

<style scoped>
.invoice-print-page{min-height:calc(100vh - 64px);margin-left:76px;padding:24px;background:#101210;color:#252922}.print-toolbar{width:min(100%,820px);display:flex;justify-content:space-between;gap:12px;margin:0 auto 16px}.print-toolbar button{height:38px;display:flex;align-items:center;gap:7px;padding:0 13px;border:1px solid #42483d;border-radius:8px;background:#1b1e19;color:#e5ebdc;font-size:12px;cursor:pointer}.print-toolbar .print-button{border-color:#ffd64c;background:#ffd64c;color:#293419;font-weight:700}.page-message{width:min(100%,820px);margin:80px auto;padding:28px;background:#fff;text-align:center}.page-message.error{color:#9b372c}
@media print{@page{size:A4;margin:14mm}:global(body){background:#fff!important}:global(.udev-workspace.print-layout .app-topbar),:global(.udev-workspace.print-layout .app-sidebar),:global(.udev-workspace.print-layout .mobile-nav-backdrop){display:none!important}:global(.udev-workspace.print-layout){min-height:0!important;background:#fff!important}:global(.udev-workspace.print-layout .invoice-print-page){min-height:0;margin:0;padding:0;background:#fff!important}.no-print{display:none!important}:deep(.invoice-sheet){width:100%;min-height:0;margin:0;padding:0;box-shadow:none}:deep(.cancel-watermark){color:#b94b3e20;-webkit-print-color-adjust:exact;print-color-adjust:exact}:deep(.document-header),:deep(.bill-to),:deep(.lines th),:deep(.total-row),:deep(.status){-webkit-print-color-adjust:exact;print-color-adjust:exact}}
@media(max-width:600px){.invoice-print-page{min-height:calc(100vh - 58px);margin-left:0;padding:12px}}
</style>
