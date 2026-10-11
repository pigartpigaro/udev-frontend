<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import type { Customer, CustomerPayload } from '../../types/customer'
import AppIcon from '../../../../../shared/components/layout/AppIcon.vue'
import CustomerForm from '../form/CustomerForm.vue'

const props = defineProps<{
  open: boolean
  customer: Customer | null
  submitting: boolean
  error: string
}>()
const emit = defineEmits<{
  close: []
  submit: [payload: CustomerPayload]
}>()

function onKeydown(event: KeyboardEvent) {
  if (props.open && event.key === 'Escape' && !props.submitting) emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div v-if="props.open" class="customer-modal-backdrop" @click.self="!props.submitting && emit('close')">
      <section class="customer-modal" role="dialog" aria-modal="true" aria-labelledby="customer-modal-title">
        <header class="customer-modal-header">
          <div><span class="modal-eyebrow">MASTER DATA</span><h2 id="customer-modal-title">{{ props.customer ? 'Edit pelanggan' : 'Tambah pelanggan' }}</h2><p>Lengkapi informasi pelanggan di bawah ini.</p></div>
          <button class="modal-close" type="button" aria-label="Tutup form" :disabled="props.submitting" @click="emit('close')"><AppIcon name="x" :size="19" /></button>
        </header>
        <CustomerForm :key="props.customer?.id ?? 'new'" :customer="props.customer" :submitting="props.submitting" :error="props.error" @submit="emit('submit', $event)" />
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.customer-modal-backdrop{position:fixed;z-index:100;inset:0;display:grid;place-items:center;overflow-y:auto;padding:22px;background:#000a;backdrop-filter:blur(5px)}.customer-modal{width:min(100%,570px);max-height:min(92vh,780px);overflow:auto;border:1px solid #3b3e38;border-radius:15px;background:#20221f;color:#f0f2ed;box-shadow:0 24px 80px #0009;animation:modal-in .16s ease-out}.customer-modal-header{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:22px 24px 18px;border-bottom:1px solid #ffffff12}.modal-eyebrow{color:#a3aa98;font-size:9px;font-weight:700;letter-spacing:1.3px}.customer-modal-header h2{margin:7px 0 5px;font:700 20px Manrope,sans-serif;letter-spacing:-.5px}.customer-modal-header p{margin:0;color:#9ea49a;font-size:11px}.modal-close{width:34px;height:34px;display:grid;place-items:center;flex:none;border:1px solid #ffffff16;border-radius:50%;background:transparent;color:#cdd1c9;cursor:pointer}.modal-close:hover{background:#ffffff12}.modal-close:disabled{opacity:.5;cursor:wait}@keyframes modal-in{from{transform:translateY(8px) scale(.99);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
@media(max-width:520px){.customer-modal-backdrop{place-items:stretch;padding:0;background:#181a17}.customer-modal{width:100%;max-height:100dvh;min-height:100dvh;overflow:auto;border:0;border-radius:0;background:#20221f;box-shadow:none}.customer-modal-header{position:sticky;z-index:2;top:0;background:rgba(32,34,31,.94);backdrop-filter:blur(12px);padding:20px 17px 16px}.customer-modal-header h2{font-size:18px}}
@media(max-width:520px){.customer-modal-backdrop{overscroll-behavior:contain}.customer-modal{height:100vh;height:100dvh;max-height:100vh;max-height:100dvh;padding-bottom:env(safe-area-inset-bottom)}}
</style>
