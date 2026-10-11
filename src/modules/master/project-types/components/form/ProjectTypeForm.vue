<script setup lang="ts">
import { ref, watch } from 'vue'
import FormField from '../../../../../shared/components/form/FormField.vue'
import FormInput from '../../../../../shared/components/form/FormInput.vue'
import FormTextarea from '../../../../../shared/components/form/FormTextarea.vue'
import type { ProjectType, ProjectTypePayload } from '../../types/projectType'

const props = defineProps<{ projectType: ProjectType | null; submitting: boolean; error: string }>()
const emit = defineEmits<{ submit: [payload: ProjectTypePayload] }>()
const form = ref<ProjectTypePayload>({ name: '', description: null, is_active: true })

watch(() => props.projectType, (value) => {
  form.value = value
    ? { name: value.name, description: value.description, is_active: value.is_active }
    : { name: '', description: null, is_active: true }
}, { immediate: true })

function submit() {
  emit('submit', {
    name: form.value.name.trim(),
    description: form.value.description?.trim() || null,
    is_active: form.value.is_active,
  })
}
</script>

<template>
  <form class="project-type-form" @submit.prevent="submit">
    <div v-if="props.error" class="form-error" role="alert">{{ props.error }}</div>
    <FormField id="project-type-name" label="Nama tipe proyek" required><FormInput id="project-type-name" v-model="form.name" maxlength="255" required autofocus placeholder="Contoh: Aplikasi Web" /></FormField>
    <FormField id="project-type-description" label="Deskripsi"><FormTextarea id="project-type-description" v-model="form.description" rows="3" maxlength="2000" placeholder="Keterangan singkat tipe proyek" /></FormField>
    <label class="active-toggle"><input v-model="form.is_active" type="checkbox" /><span class="toggle"></span><span><strong>Tipe proyek aktif</strong><small>Tipe aktif dapat dipilih pada proyek baru.</small></span></label>
    <div class="form-actions"><button type="submit" :disabled="props.submitting">{{ props.submitting ? 'Menyimpan...' : 'Simpan tipe proyek' }}</button></div>
  </form>
</template>

<style scoped>
.project-type-form{padding:21px 24px}.form-error{margin-bottom:14px;padding:10px 12px;border:1px solid #a7463c55;border-radius:8px;background:#a7463c18;color:#ffb4a8;font-size:11px}.field{margin-bottom:15px}.active-toggle{display:flex;align-items:center;gap:10px;margin:18px 0;cursor:pointer}.active-toggle input{position:absolute;width:1px;height:1px;opacity:0}.toggle{width:34px;height:20px;padding:3px;border-radius:12px;background:#454a43}.toggle:after{content:'';display:block;width:14px;height:14px;border-radius:50%;background:#e2e5df;transition:transform .16s}.active-toggle input:checked+.toggle{background:#638d37}.active-toggle input:checked+.toggle:after{transform:translateX(14px)}.active-toggle input:focus-visible+.toggle{outline:2px solid #ffd64c;outline-offset:2px}.active-toggle>span:last-child{display:grid;gap:3px}.active-toggle strong{color:#e4e7e1;font-size:11px}.active-toggle small{color:#939a90;font-size:9px}.form-actions{display:flex;justify-content:flex-end;padding-top:15px;border-top:1px solid #ffffff12}.form-actions button{height:38px;padding:0 15px;border:0;border-radius:8px;background:#ffd64c;color:#263215;font-size:11px;font-weight:700;cursor:pointer}.form-actions button:disabled{opacity:.55;cursor:wait}
@media(max-width:520px){.project-type-form{padding:17px}}
@media(max-width:520px){.project-type-form{padding-bottom:calc(20px + env(safe-area-inset-bottom))}.form-actions{position:sticky;bottom:0;z-index:2;margin:0 -17px;padding:12px 17px calc(8px + env(safe-area-inset-bottom));background:#20221f}}
</style>
