<script setup lang="ts">
import { ref, watch } from 'vue'
import FormField from '../../../../../shared/components/form/FormField.vue'
import FormInput from '../../../../../shared/components/form/FormInput.vue'
import FormTextarea from '../../../../../shared/components/form/FormTextarea.vue'
import type { Customer, CustomerPayload } from '../../types/customer'

const props = defineProps<{
  customer: Customer | null
  submitting: boolean
  error: string
}>()
const emit = defineEmits<{ submit: [payload: CustomerPayload] }>()

function emptyForm(): CustomerPayload {
  return { name: '', contact_name: null, email: null, phone: null, address: null, is_active: true }
}

const form = ref<CustomerPayload>(emptyForm())

watch(() => props.customer, (customer) => {
  form.value = customer ? {
    name: customer.name,
    contact_name: customer.contact_name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    is_active: customer.is_active,
  } : emptyForm()
}, { immediate: true })

function submit() {
  emit('submit', {
    name: form.value.name.trim(),
    contact_name: form.value.contact_name?.trim() || null,
    email: form.value.email?.trim() || null,
    phone: form.value.phone?.trim() || null,
    address: form.value.address?.trim() || null,
    is_active: form.value.is_active,
  })
}
</script>

<template>
  <form class="customer-form" @submit.prevent="submit">
    <div v-if="props.error" class="form-server-error" role="alert">{{ props.error }}</div>
    <div class="customer-form-grid">
      <FormField id="customer-name" label="Nama pelanggan" required full><FormInput id="customer-name" v-model="form.name" maxlength="255" autocomplete="organization" placeholder="Contoh: PT Udumbara" required autofocus /></FormField>
      <FormField id="customer-contact" label="Nama kontak"><FormInput id="customer-contact" v-model="form.contact_name" maxlength="255" autocomplete="name" placeholder="Nama PIC" /></FormField>
      <FormField id="customer-phone" label="Nomor telepon"><FormInput id="customer-phone" v-model="form.phone" type="tel" maxlength="30" autocomplete="tel" placeholder="08xx xxxx xxxx" /></FormField>
      <FormField id="customer-email" label="Email" full><FormInput id="customer-email" v-model="form.email" type="email" maxlength="255" autocomplete="email" placeholder="nama@perusahaan.co.id" /></FormField>
      <FormField id="customer-address" label="Alamat" full><FormTextarea id="customer-address" v-model="form.address" rows="3" maxlength="2000" autocomplete="street-address" placeholder="Alamat pelanggan" /></FormField>
    </div>
    <label class="customer-status-toggle">
      <input v-model="form.is_active" type="checkbox" />
      <span class="toggle-track"><span></span></span>
      <span class="toggle-copy"><strong>Pelanggan aktif</strong><small>Pelanggan aktif dapat dipilih saat membuat proyek.</small></span>
    </label>
    <div class="customer-form-actions">
      <button class="customer-save" type="submit" :disabled="props.submitting"><span>{{ props.submitting ? 'Menyimpan...' : 'Simpan pelanggan' }}</span></button>
    </div>
  </form>
</template>

<style scoped>
.customer-form{padding:21px 24px 22px}.form-server-error{margin-bottom:16px;padding:11px 13px;border:1px solid #a7463c55;border-radius:9px;background:#a7463c18;color:#ffb4a8;font-size:12px;line-height:1.5}.customer-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px}.customer-status-toggle{display:flex;align-items:center;gap:11px;margin-top:18px;cursor:pointer}.customer-status-toggle>input{position:absolute;width:1px;height:1px;opacity:0}.toggle-track{width:34px;height:20px;display:flex;align-items:center;padding:3px;border-radius:12px;background:#454a43;transition:background .16s}.toggle-track span{width:14px;height:14px;border-radius:50%;background:#e2e5df;transition:transform .16s}.customer-status-toggle>input:checked+.toggle-track{background:#638d37}.customer-status-toggle>input:checked+.toggle-track span{transform:translateX(14px)}.customer-status-toggle>input:focus-visible+.toggle-track{outline:2px solid #ffd64c;outline-offset:2px}.toggle-copy{display:grid;gap:3px}.toggle-copy strong{color:#e4e7e1;font-size:11px}.toggle-copy small{color:#939a90;font-size:9px}.customer-form-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:22px;padding-top:16px;border-top:1px solid #ffffff12}.customer-save{height:38px;padding:0 15px;border:1px solid transparent;border-radius:8px;background:#ffd64c;color:#263215;font-size:11px;font-weight:700;cursor:pointer}.customer-save:hover:not(:disabled){background:#ffe173}.customer-save:disabled{opacity:.55;cursor:wait}
@media(max-width:520px){.customer-form{padding:17px 17px 20px}.customer-form-grid{grid-template-columns:1fr;gap:13px}.customer-form-actions{position:sticky;bottom:0;background:#20221f}}
</style>
