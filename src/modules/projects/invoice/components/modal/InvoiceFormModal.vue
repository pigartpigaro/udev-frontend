<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import AppIcon from '../../../../../shared/components/layout/AppIcon.vue'
import type { Project } from '../../../project/types/project'
import type { InvoicePayload, InvoiceUpdatePayload, ProjectInvoice } from '../../types/invoice'
import InvoiceForm from '../form/InvoiceForm.vue'

const props = defineProps<{ open: boolean; invoice: ProjectInvoice | null; replacementOf: ProjectInvoice | null; projects: Project[]; submitting: boolean; error: string }>()
const emit = defineEmits<{ close: []; submit: [payload: InvoicePayload | InvoiceUpdatePayload] }>()
function onKeydown(event: KeyboardEvent) { if (props.open && event.key === 'Escape' && !props.submitting) emit('close') }
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body"><div v-if="props.open" class="modal-backdrop" @click.self="!props.submitting && emit('close')"><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="invoice-modal-title"><header><div><span class="eyebrow">PROJECT · INVOICE</span><h2 id="invoice-modal-title">{{ props.invoice ? 'Edit draft invoice' : props.replacementOf ? 'Buat invoice pengganti' : 'Buat invoice bulanan' }}</h2><p>Kode invoice dibuat otomatis saat draft disimpan.</p></div><button type="button" aria-label="Tutup form" :disabled="props.submitting" @click="emit('close')"><AppIcon name="x" :size="19" /></button></header><InvoiceForm :key="props.invoice?.id ?? props.replacementOf?.id ?? 'new'" :invoice="props.invoice" :replacement-of="props.replacementOf" :projects="props.projects" :submitting="props.submitting" :error="props.error" @submit="emit('submit', $event)" /></section></div></Teleport>
</template>

<style scoped>
.modal-backdrop{position:fixed;z-index:100;inset:0;display:grid;place-items:center;overflow-y:auto;padding:22px;background:#000a;backdrop-filter:blur(5px)}.modal-card{width:min(100%,700px);max-height:min(92vh,850px);overflow:auto;border:1px solid #3b3e38;border-radius:15px;background:#20221f;color:#f0f2ed;box-shadow:0 24px 80px #0009}.modal-card header{display:flex;justify-content:space-between;gap:18px;padding:22px 24px 18px;border-bottom:1px solid #ffffff12}.eyebrow{color:#a3aa98;font-size:9px;font-weight:700;letter-spacing:1.3px}.modal-card h2{margin:7px 0 5px;font:700 20px Manrope,sans-serif}.modal-card p{margin:0;color:#9ea49a;font-size:11px}.modal-card header button{width:34px;height:34px;display:grid;place-items:center;flex:none;border:1px solid #ffffff16;border-radius:50%;background:transparent;color:#cdd1c9;cursor:pointer}.modal-card header button:disabled{opacity:.5;cursor:wait}@media(max-width:520px){.modal-backdrop{place-items:stretch;padding:0;background:#181a17}.modal-card{width:100%;max-height:100dvh;min-height:100dvh;border:0;border-radius:0}.modal-card header{position:sticky;z-index:2;top:0;background:rgba(32,34,31,.94);backdrop-filter:blur(12px);padding:20px 17px 16px}}
@media(max-width:520px){.modal-backdrop{overscroll-behavior:contain}.modal-card{height:100vh;height:100dvh;max-height:100vh;max-height:100dvh;padding-bottom:env(safe-area-inset-bottom)}.modal-card header{z-index:3}}
</style>
