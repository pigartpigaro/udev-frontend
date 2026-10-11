<script setup lang="ts">
import { ref, watch } from 'vue'
import FormField from '../../../../../shared/components/form/FormField.vue'
import FormInput from '../../../../../shared/components/form/FormInput.vue'
import type { WorkspaceSettings } from '../../api/workspaceSettings'

const props = defineProps<{ workspace: WorkspaceSettings; saving: boolean }>()
const emit = defineEmits<{ save: [name: string] }>()
const name = ref(props.workspace.name)
watch(() => props.workspace.name, (value) => { name.value = value })
</script>

<template>
  <form class="workspace-form" @submit.prevent="emit('save', name.trim())">
    <div class="form-copy"><span class="form-overline">IDENTITAS WORKSPACE</span><h2>Nama perusahaan</h2><p>Nama ini ditampilkan di pemilih workspace dan menjadi identitas ruang kerja.</p></div>
    <FormField id="workspace-name" label="Nama workspace" required full><FormInput id="workspace-name" v-model="name" maxlength="255" autocomplete="organization" required placeholder="Contoh: Udumbara Informatika" /></FormField>
    <div class="workspace-readonly"><span>Slug workspace</span><code>{{ workspace.slug }}</code><small>Slug digunakan sebagai identitas tetap dan tidak dapat diubah.</small></div>
    <button class="save-button" type="submit" :disabled="saving || !name.trim() || name.trim() === workspace.name">{{ saving ? 'Menyimpan...' : 'Simpan perubahan' }}</button>
  </form>
</template>

<style scoped>
.workspace-form{display:grid;gap:18px;padding:20px;border:1px solid #ffffff12;border-radius:12px;background:#191b19}.form-copy{margin-bottom:2px}.form-overline{color:#a1a99a;font-size:9px;font-weight:700;letter-spacing:1.2px}.form-copy h2{margin:8px 0 5px;font:700 16px Manrope,sans-serif}.form-copy p{margin:0;color:#9da398;font-size:11px;line-height:1.6}.workspace-readonly{display:grid;gap:6px}.workspace-readonly>span{color:#ccd0ca;font-size:11px;font-weight:600}.workspace-readonly code{width:max-content;max-width:100%;padding:8px 10px;border:1px solid #ffffff12;border-radius:7px;background:#ffffff06;color:#d5dbcf;font-size:11px;overflow-wrap:anywhere}.workspace-readonly small{color:#858b82;font-size:10px}.save-button{width:max-content;min-height:38px;padding:0 14px;border:0;border-radius:8px;background:#ffd64c;color:#263215;font-size:11px;font-weight:700;cursor:pointer}.save-button:disabled{opacity:.5;cursor:not-allowed}@media(max-width:520px){.workspace-form{padding:15px}.save-button{width:100%;min-height:42px}}
</style>
