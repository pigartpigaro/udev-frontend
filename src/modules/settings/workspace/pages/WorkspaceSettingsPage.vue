<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppIcon from '../../../../shared/components/layout/AppIcon.vue'
import { useToast } from '../../../../shared/composables/useToast'
import { getWorkspaceSettings, updateWorkspaceSettings, type WorkspaceSettings } from '../api/workspaceSettings'
import WorkspaceForm from '../components/form/WorkspaceForm.vue'

const workspace = ref<WorkspaceSettings | null>(null)
const { showToast } = useToast()
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const notice = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try { workspace.value = await getWorkspaceSettings() }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Pengaturan workspace gagal dimuat.' }
  finally { loading.value = false }
}

async function save(name: string) {
  saving.value = true
  error.value = ''
  notice.value = ''
  try {
    const updated = await updateWorkspaceSettings(name)
    workspace.value = updated
    window.dispatchEvent(new CustomEvent('udev:workspace-updated', { detail: updated }))
    showToast('Nama workspace berhasil diperbarui.')
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Pengaturan workspace gagal disimpan.'; showToast(error.value, 'error') }
  finally { saving.value = false }
}

onMounted(() => { void load() })
</script>

<template>
  <main class="workspace-settings-page"><div class="page-content">
    <div class="breadcrumb"><span>Pengaturan</span><AppIcon name="chevron-right" :size="13" /><strong>Workspace</strong></div>
    <header class="page-heading"><div><span class="page-overline"><i></i> PENGATURAN WORKSPACE</span><h1>Workspace</h1><p>Atur identitas workspace yang sedang aktif.</p></div></header>
    <div v-if="notice" class="notice-banner" role="status"><AppIcon name="check" :size="15" />{{ notice }}</div>
    <div v-if="error" class="error-banner" role="alert">{{ error }} <button type="button" @click="load">Coba lagi</button></div>
    <div v-if="loading" class="loading-state" role="status"><span class="loading-dot"></span> Memuat pengaturan workspace...</div>
    <WorkspaceForm v-else-if="workspace" :workspace="workspace" :saving="saving" @save="save" />
    <section class="workspace-note"><AppIcon name="info" :size="16" /><p>Perubahan di sini hanya memengaruhi identitas workspace aktif. Data dan hak akses setiap workspace tetap terpisah.</p></section>
  </div></main>
</template>

<style scoped>
.workspace-settings-page{min-height:calc(100vh - 64px);margin-left:76px;color:#eff1ed}.page-content{width:min(100%,1400px);margin:0 auto;padding:24px clamp(20px,3vw,48px) 45px}.breadcrumb{display:flex;align-items:center;gap:7px;color:#92988e;font-size:10px}.breadcrumb strong{color:#dce0d7;font-weight:600}.breadcrumb svg{color:#696f66}.page-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin:24px 0 22px}.page-overline{display:flex;align-items:center;gap:7px;color:#a1a99a;font-size:9px;font-weight:700;letter-spacing:1.25px}.page-overline i{width:6px;height:6px;border-radius:50%;background:#ffd64c}.page-heading h1{margin:9px 0 5px;font:700 30px Manrope,sans-serif;letter-spacing:-1px}.page-heading p{margin:0;color:#9da398;font-size:11px}.notice-banner,.error-banner{display:flex;align-items:center;gap:9px;margin-bottom:14px;padding:10px 12px;border:1px solid #8bd74f25;border-radius:8px;background:#8bd74f0b;color:#c5df9e;font-size:11px}.error-banner{border-color:#a7463c55;background:#a7463c18;color:#ffb4a8}.error-banner button{margin-left:auto;border:0;background:transparent;color:#ffd64c;text-decoration:underline;cursor:pointer}.loading-state{display:flex;align-items:center;padding:20px;border:1px solid #ffffff12;border-radius:12px;background:#191b19;color:#aeb4a8;font-size:11px}.loading-dot{width:7px;height:7px;display:inline-block;margin-right:8px;border-radius:50%;background:#ffd64c;animation:pulse .9s infinite alternate}.workspace-note{display:flex;align-items:flex-start;gap:10px;margin-top:14px;padding:13px 15px;border:1px solid #ffd64c20;border-radius:9px;background:#ffd64c08;color:#c8bd91}.workspace-note svg{flex:none;color:#ffd64c}.workspace-note p{margin:0;font-size:10px;line-height:1.6}@keyframes pulse{to{opacity:.35;transform:scale(.7)}}@media(max-width:600px){.workspace-settings-page{min-height:calc(100vh - 58px);margin-left:0}.page-content{padding:18px 12px 32px}.page-heading{margin:20px 0}.page-heading h1{font-size:25px}}
</style>
