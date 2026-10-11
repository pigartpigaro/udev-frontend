<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { Capacitor } from '@capacitor/core'
import { ThermalPrinter, type DiscoveredPrinter, type PrinterProfile } from '@delicity/capacitor-thermal-printer'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../../../../shared/components/layout/AppIcon.vue'
import { getPayment } from '../api/payments'
import type { ProjectPayment } from '../types/payment'
import PaymentReceiptDocument from '../components/document/PaymentReceiptDocument.vue'
import ThermalReceiptPreview from '../components/document/ThermalReceiptPreview.vue'
import { buildThermalReceipt } from '../utils/thermalReceipt'

const route = useRoute(); const router = useRouter()
const payment = ref<ProjectPayment | null>(null); const error = ref(''); const loading = ref(true)
const printerMessage = ref(''); const printerBusy = ref(false); const printers = ref<DiscoveredPrinter[]>([])
const defaultPrinter = ref<PrinterProfile | null>(null)
const receiptView = ref<'a4' | 'pos'>('a4')
const isNative = computed(() => Capacitor.isNativePlatform())
async function printSelectedReceipt() {
  if (receiptView.value === 'pos' && isNative.value) {
    if (!defaultPrinter.value) { await findPrinters(); return }
    await printThermalReceipt()
    return
  }
  await nextTick()
  window.print()
}
async function loadDefaultPrinter() {
  if (!isNative.value) return
  try { defaultPrinter.value = (await ThermalPrinter.getDefaultPrinter()).profile }
  catch { defaultPrinter.value = null }
}
async function findPrinters() {
  printerBusy.value = true; printerMessage.value = 'Memindai Bluetooth dan printer yang sudah dipasangkan...'
  try {
    const permissions = await ThermalPrinter.requestPermissions()
    if (permissions.bluetoothConnect === 'denied' || permissions.bluetoothScan === 'denied') {
      printerMessage.value = 'Izin Bluetooth belum diberikan. Aktifkan izin untuk UDev di pengaturan Android.'
      return
    }
    const { enabled } = await ThermalPrinter.isBluetoothEnabled()
    if (!enabled) { printerMessage.value = 'Nyalakan Bluetooth perangkat terlebih dahulu.'; return }
    const result = await ThermalPrinter.discoverPrinters({ sources: ['bluetooth', 'ble'], timeoutMs: 8000, includePaired: true })
    printers.value = result.printers.filter((printer) => printer.transport === 'bluetooth' || printer.transport === 'ble')
    printerMessage.value = printers.value.length ? 'Pilih MP-58C atau printer Bluetooth yang ingin dipakai.' : 'Printer belum ditemukan. Pasangkan MP-58C lewat Pengaturan Bluetooth Android, lalu coba lagi.'
  } catch (caught) { printerMessage.value = caught instanceof Error ? caught.message : 'Pencarian printer gagal.' }
  finally { printerBusy.value = false }
}
async function connectAndTest(printer: DiscoveredPrinter) {
  printerBusy.value = true; printerMessage.value = `Menghubungkan ke ${printer.name}...`
  try {
    const connection = await ThermalPrinter.connectPrinter({ printerId: printer.id, paperWidthMm: 58, preferSdk: false })
    const test = await ThermalPrinter.printText({ printerId: connection.printerId, paperWidthMm: 58, items: [
      { type: 'text', value: 'UDev - TEST PRINTER', style: { align: 'center', bold: true } },
      { type: 'text', value: 'MP-58C / ESC-POS', style: { align: 'center' } },
      { type: 'divider' }, { type: 'feed', lines: 3 },
    ], timeoutMs: 20000 })
    if (!test.success) throw new Error('Printer tidak mengonfirmasi hasil cetak uji.')
    defaultPrinter.value = (await ThermalPrinter.setDefaultPrinter({ printerId: connection.printerId })).profile
    printerMessage.value = `Tes berhasil. ${printer.name} disimpan sebagai printer kuitansi.`
    printers.value = []
  } catch (caught) { printerMessage.value = caught instanceof Error ? caught.message : 'Koneksi atau cetak uji gagal.' }
  finally { printerBusy.value = false }
}
async function printThermalReceipt() {
  if (!payment.value || !defaultPrinter.value) return
  receiptView.value = 'pos'
  printerBusy.value = true; printerMessage.value = 'Mengirim kuitansi ke printer...'
  try {
    const result = await ThermalPrinter.printText({ printerId: defaultPrinter.value.id, paperWidthMm: 58, items: buildThermalReceipt(payment.value), timeoutMs: 30000 })
    if (!result.success) throw new Error('Printer tidak mengonfirmasi hasil cetak.')
    printerMessage.value = 'Kuitansi berhasil dikirim ke printer.'
  } catch (caught) { printerMessage.value = caught instanceof Error ? caught.message : 'Cetak kuitansi gagal.' }
  finally { printerBusy.value = false }
}
onMounted(async () => {
  try {
    const id = Number(route.params.id)
    if (!Number.isInteger(id) || id < 1) throw new Error('Nomor kuitansi tidak valid.')
    payment.value = await getPayment(id)
  } catch (caught) { error.value = caught instanceof Error ? caught.message : 'Kuitansi gagal dimuat.' }
  finally { loading.value = false }
  await loadDefaultPrinter()
})
</script>

<template>
  <main class="receipt-print-page">
    <div class="print-toolbar no-print"><button type="button" @click="router.push('/projects/payments')"><AppIcon name="chevron-left" :size="16" />Kembali ke pembayaran</button><div class="print-actions"><button v-if="isNative" type="button" :disabled="printerBusy" @click="findPrinters"><AppIcon name="bluetooth" :size="16" />{{ printerBusy ? 'Memproses...' : 'Pilih printer' }}</button><button v-if="payment" type="button" class="print-button" :disabled="printerBusy || (receiptView === 'pos' && payment.status === 'voided')" @click="printSelectedReceipt"><AppIcon name="printer" :size="16" />{{ receiptView === 'pos' ? 'Cetak struk POS' : 'Cetak kuitansi A4' }}</button></div></div>
    <nav v-if="payment" class="receipt-view-toggle no-print" aria-label="Pilih tampilan kuitansi"><button type="button" :class="{ active: receiptView === 'a4' }" @click="receiptView = 'a4'">Kuitansi biasa</button><button type="button" :class="{ active: receiptView === 'pos' }" @click="receiptView = 'pos'">Pratinjau struk POS</button></nav>
    <div v-if="isNative && (printerMessage || printers.length)" class="printer-panel no-print"><p v-if="printerMessage" role="status">{{ printerMessage }}</p><button v-for="printer in printers" :key="printer.id" type="button" :disabled="printerBusy" @click="connectAndTest(printer)">{{ printer.name }} <small>{{ printer.transport === 'bluetooth' ? 'Bluetooth Classic / SPP' : 'Bluetooth LE' }} · tekan untuk hubungkan &amp; cetak uji</small></button></div>
    <div v-if="loading" class="page-message">Memuat kuitansi...</div>
    <div v-else-if="error" class="page-message error">{{ error }}</div>
    <PaymentReceiptDocument v-else-if="payment && receiptView === 'a4'" :payment="payment" />
    <ThermalReceiptPreview v-else-if="payment" :payment="payment" />
  </main>
</template>

<style scoped>
.receipt-print-page{min-height:calc(100vh - 64px);margin-left:76px;padding:24px;background:#101210;color:#252922}.print-toolbar{width:min(100%,820px);display:flex;justify-content:space-between;gap:12px;margin:0 auto 12px}.print-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.print-toolbar button,.printer-panel button{min-height:38px;display:flex;align-items:center;gap:7px;padding:8px 13px;border:1px solid #42483d;border-radius:8px;background:#1b1e19;color:#e5ebdc;font-size:12px;cursor:pointer}.print-toolbar button:disabled,.printer-panel button:disabled{opacity:.6;cursor:wait}.print-toolbar .print-button{border-color:#ffd64c;background:#ffd64c;color:#293419;font-weight:700}.receipt-view-toggle{width:min(100%,820px);display:flex;gap:6px;margin:0 auto 18px;padding:4px;border:1px solid #ffffff16;border-radius:9px;background:#171a17}.receipt-view-toggle button{flex:1;min-height:34px;border:0;border-radius:6px;background:transparent;color:#aeb4a8;font-size:11px;cursor:pointer}.receipt-view-toggle button.active{background:#30352d;color:#ffd64c;font-weight:700}.printer-panel{width:min(100%,820px);box-sizing:border-box;display:grid;gap:8px;margin:0 auto 16px;padding:12px;border:1px solid #ffffff19;border-radius:10px;background:#181b17;color:#d8dfd1;font-size:12px}.printer-panel p{margin:0;line-height:1.5}.printer-panel button{justify-content:space-between;text-align:left}.printer-panel small{color:#aab09f;font-size:10px}.page-message{width:min(100%,820px);margin:80px auto;padding:28px;background:#fff;text-align:center}.page-message.error{color:#9b372c}
@media print{@page{size:A4;margin:14mm}@page thermal{size:58mm auto;margin:0}:global(body){background:#fff!important}:global(.udev-workspace.print-layout .app-topbar),:global(.udev-workspace.print-layout .app-sidebar),:global(.udev-workspace.print-layout .mobile-nav-backdrop){display:none!important}:global(.udev-workspace.print-layout){min-height:0!important;background:#fff!important}:global(.udev-workspace.print-layout .receipt-print-page){min-height:0;margin:0;padding:0;background:#fff!important}.no-print{display:none!important}:deep(.receipt-sheet){page:a4;width:100%;min-height:0;margin:0;padding:0;box-shadow:none}:deep(.pos-preview-wrap){width:58mm;margin:0}:deep(.preview-caption){display:none!important}:deep(.pos-paper){page:thermal;width:58mm;max-width:none;min-height:0;margin:0;padding:4mm;box-shadow:none;-webkit-print-color-adjust:exact;print-color-adjust:exact}:deep(.document-header),:deep(.amount-box),:deep(.status),:deep(.void-info){-webkit-print-color-adjust:exact;print-color-adjust:exact}}
@media(max-width:600px){.receipt-print-page{min-height:calc(100vh - 58px);margin-left:0;padding:12px}.print-toolbar{align-items:flex-start}.print-actions{gap:6px}.print-toolbar button{padding:7px 9px;font-size:11px}.receipt-view-toggle{margin-bottom:14px}}
</style>
