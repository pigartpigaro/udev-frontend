<script setup lang="ts">
import { ref, watch } from 'vue'
import AppIcon from '../../../../../shared/components/layout/AppIcon.vue'
import FormTextarea from '../../../../../shared/components/form/FormTextarea.vue'
import type { ProjectInvoice } from '../../types/invoice'

const props = defineProps<{ open: boolean; invoice: ProjectInvoice | null; action: 'issue' | 'cancel' | null; submitting: boolean; error: string }>()
const emit = defineEmits<{ close: []; confirm: [reason: string] }>()
const reason = ref('')
const validationError = ref('')
watch(() => [props.open, props.invoice?.id, props.action] as const, () => { reason.value = ''; validationError.value = '' })

function confirm() {
  if (props.action === 'cancel' && reason.value.trim().length < 5) {
    validationError.value = 'Alasan pembatalan wajib diisi minimal 5 karakter.'
    return
  }
  emit('confirm', reason.value.trim())
}
</script>

<template>
  <Teleport to="body">
    <div v-if="props.open && props.invoice && props.action" class="action-backdrop" @click.self="!props.submitting && emit('close')">
      <section class="action-card" role="dialog" aria-modal="true" aria-labelledby="invoice-action-title">
        <header><span class="action-icon" :class="props.action"><AppIcon :name="props.action === 'issue' ? 'arrow-up-right' : 'x'" :size="19" /></span><button type="button" aria-label="Tutup" :disabled="props.submitting" @click="emit('close')"><AppIcon name="x" :size="18" /></button></header>
        <h2 id="invoice-action-title">{{ props.action === 'issue' ? 'Terbitkan invoice?' : 'Batalkan invoice?' }}</h2>
        <p v-if="props.action === 'issue'">{{ props.invoice.code }} akan diterbitkan dan detail tagihannya terkunci. Pastikan jumlah dan periode sudah benar.</p>
        <p v-else>{{ props.invoice.code }} tidak akan dihapus. Invoice batal tetap tersimpan dan bisa dibuatkan invoice pengganti dengan jejak koreksi.</p>
        <label v-if="props.action === 'cancel'" class="reason-field" for="cancel-reason">Alasan pembatalan <i>*</i><FormTextarea id="cancel-reason" v-model="reason" rows="3" maxlength="1000" minlength="5" required autofocus placeholder="Contoh: nominal tagihan perlu diperbaiki" /></label>
        <div v-if="validationError" class="validation-error" role="alert">{{ validationError }}</div>
        <div v-if="props.error" class="validation-error" role="alert">{{ props.error }}</div>
        <footer><button type="button" class="secondary" :disabled="props.submitting" @click="emit('close')">Kembali</button><button type="button" class="primary" :class="props.action" :disabled="props.submitting" @click="confirm">{{ props.submitting ? 'Memproses...' : props.action === 'issue' ? 'Terbitkan invoice' : 'Batalkan invoice' }}</button></footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.action-backdrop{position:fixed;z-index:120;inset:0;display:grid;place-items:center;padding:18px;background:#000a;backdrop-filter:blur(4px)}.action-card{width:min(100%,440px);padding:23px;border:1px solid #3b3e38;border-radius:15px;background:#20221f;color:#eff1ed;box-shadow:0 22px 70px #0009}.action-card header{display:flex;align-items:center;justify-content:space-between}.action-icon{width:40px;height:40px;display:grid;place-items:center;border-radius:12px;background:#8bd74f19;color:#bce88b}.action-icon.cancel{background:#a7463c22;color:#ffb4a8}.action-card header button{width:32px;height:32px;display:grid;place-items:center;border:1px solid #ffffff18;border-radius:50%;background:transparent;color:#adb4a7}.action-card h2{margin:18px 0 8px;font:700 19px Manrope,sans-serif}.action-card p{margin:0 0 18px;color:#a8aea2;font-size:12px;line-height:1.6}.reason-field{display:grid;gap:8px;color:#d9ddd4;font-size:11px;font-weight:600}.reason-field i{color:#ffd64c;font-style:normal}.validation-error{margin-top:8px;color:#ffb4a8;font-size:11px}.action-card footer{display:flex;justify-content:flex-end;gap:9px;margin-top:22px}.action-card footer button{min-height:38px;padding:0 13px;border:0;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer}.action-card footer button:disabled{opacity:.5;cursor:wait}.secondary{background:#ffffff0d;color:#d7dcd2}.primary{background:#ffd64c;color:#293419}.primary.cancel{background:#a7463c;color:#fff}.primary.issue{background:#ffd64c;color:#293419}@media(max-width:520px){.action-backdrop{align-items:end;padding:10px}.action-card{padding:20px;border-radius:16px 16px 10px 10px}.action-card footer button{flex:1}}
@media(max-width:520px){.action-backdrop{padding-bottom:calc(10px + env(safe-area-inset-bottom))}.action-card{padding-bottom:calc(20px + env(safe-area-inset-bottom))}}
</style>
