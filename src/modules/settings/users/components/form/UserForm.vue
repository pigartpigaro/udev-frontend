<script setup lang="ts">
import { reactive } from 'vue'
import FormInput from '../../../../../shared/components/form/FormInput.vue'
import type { NewUserPayload } from '../../api/users'

const props = defineProps<{ submitting: boolean; error: string }>()
const emit = defineEmits<{ submit: [payload: NewUserPayload] }>()
const form = reactive<NewUserPayload>({ name: '', username: '', email: '', password: '', password_confirmation: '' })

function submit() {
  emit('submit', { ...form, name: form.name.trim(), username: form.username.trim().toLowerCase(), email: form.email.trim().toLowerCase() })
}

function clearPassword() {
  form.password = ''
  form.password_confirmation = ''
}

defineExpose({ clearPassword })
</script>

<template>
  <form class="user-form" @submit.prevent="submit">
    <div class="form-grid">
      <label class="field"><span>Nama lengkap <i>*</i></span><FormInput v-model="form.name" autocomplete="name" maxlength="255" required placeholder="Nama anggota tim" /></label>
      <label class="field"><span>Username <i>*</i></span><FormInput v-model="form.username" autocomplete="off" autocapitalize="none" spellcheck="false" minlength="3" maxlength="32" pattern="[A-Za-z0-9._-]+" required placeholder="contoh: budi.santoso" /><small>3–32 karakter: huruf, angka, titik, _ atau -.</small></label>
      <label class="field"><span>Email <i>*</i></span><FormInput v-model="form.email" type="email" autocomplete="email" maxlength="255" required placeholder="nama@perusahaan.com" /></label>
      <div class="field-spacer"></div>
      <label class="field"><span>Kata sandi awal <i>*</i></span><FormInput v-model="form.password" type="password" autocomplete="new-password" minlength="6" required placeholder="Minimal 6 karakter" /></label>
      <label class="field"><span>Ulangi kata sandi <i>*</i></span><FormInput v-model="form.password_confirmation" type="password" autocomplete="new-password" minlength="6" required placeholder="Ulangi kata sandi awal" /></label>
    </div>
    <p v-if="props.error" class="form-error" role="alert">{{ props.error }}</p>
    <footer class="form-actions"><span>Akun akan dibuat sebagai <strong>Anggota</strong> di workspace aktif.</span><button type="submit" :disabled="props.submitting"><span>{{ props.submitting ? 'Membuat akun...' : 'Buat akun' }}</span><span aria-hidden="true">→</span></button></footer>
  </form>
</template>

<style scoped>
.user-form{padding:18px}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px 16px}.field{display:flex;min-width:0;flex-direction:column;gap:7px;color:#d5d9d1;font-size:11px;font-weight:600}.field i{color:#ffd64c;font-style:normal}.field small{color:#858c80;font-size:9px;font-weight:400}.form-actions{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-top:22px;padding-top:16px;border-top:1px solid #ffffff12}.form-actions>span{color:#969d91;font-size:10px}.form-actions strong{color:#d4e8b4;font-weight:600}.form-actions button{display:flex;align-items:center;justify-content:space-between;gap:26px;min-height:40px;padding:0 14px;border:1px solid #8bd74f45;border-radius:8px;background:#8bd74f15;color:#ddedcb;font:600 11px 'DM Sans',sans-serif;cursor:pointer}.form-actions button:disabled{opacity:.6;cursor:wait}.form-error{margin:15px 0 0;color:#ffb4a8;font-size:11px}@media(max-width:520px){.user-form{padding:13px}.form-grid{grid-template-columns:minmax(0,1fr);gap:14px}.field-spacer{display:none}.form-actions{align-items:stretch;flex-direction:column}.form-actions button{justify-content:center}}
</style>
