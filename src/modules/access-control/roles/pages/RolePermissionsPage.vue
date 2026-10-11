<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppIcon from '../../../../shared/components/layout/AppIcon.vue'
import { useToast } from '../../../../shared/composables/useToast'
import { getMemberPermissionOptions, saveMemberPermissions, type PermissionOption } from '../api/rolePermissions'
import RolePermissionsForm from '../components/form/RolePermissionsForm.vue'

const permissions = ref<PermissionOption[]>([])
const { showToast } = useToast()
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const notice = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try { permissions.value = await getMemberPermissionOptions() }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Hak akses gagal dimuat.' }
  finally { loading.value = false }
}

function togglePermission(id: number) {
  const permission = permissions.value.find((item) => item.id === id)
  if (permission) permission.enabled = !permission.enabled
  notice.value = ''
}

async function save() {
  saving.value = true
  error.value = ''
  notice.value = ''
  try {
    await saveMemberPermissions(permissions.value.filter((permission) => permission.enabled).map((permission) => permission.id))
    showToast('Hak akses Member berhasil diperbarui.')
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Hak akses gagal disimpan.'; showToast(error.value, 'error') }
  finally { saving.value = false }
}

onMounted(() => { void load() })
</script>

<template>
  <main class="role-permissions-page"><div class="page-content">
    <div class="breadcrumb"><span>Pengaturan</span><AppIcon name="chevron-right" :size="13" /><strong>Role dan Izin</strong></div>
    <header class="page-heading"><div><span class="page-overline"><i></i> HAK AKSES WORKSPACE</span><h1>Role dan Izin</h1><p>Atur fitur yang tersedia untuk anggota pada workspace aktif.</p></div></header>
    <div v-if="notice" class="notice-banner" role="status"><AppIcon name="check" :size="15" />{{ notice }}</div>
    <div v-if="error" class="error-banner" role="alert">{{ error }} <button type="button" @click="load">Coba lagi</button></div>
    <div v-if="loading" class="loading-state" role="status"><span class="loading-dot"></span> Memuat daftar hak akses...</div>
    <RolePermissionsForm v-else :permissions="permissions" :saving="saving" @toggle="togglePermission" @save="save" />
    <section class="role-note"><AppIcon name="info" :size="16" /><p>Role Admin tetap memiliki akses pengelolaan workspace dan hak akses. Izin di atas hanya mengatur role Member di workspace aktif.</p></section>
  </div></main>
</template>

<style scoped>
.role-permissions-page{min-height:calc(100vh - 64px);margin-left:76px;color:#eff1ed}.page-content{width:min(100%,1400px);margin:0 auto;padding:24px clamp(20px,3vw,48px) 45px}.breadcrumb{display:flex;align-items:center;gap:7px;color:#92988e;font-size:10px}.breadcrumb strong{color:#dce0d7;font-weight:600}.breadcrumb svg{color:#696f66}.page-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin:24px 0 22px}.page-overline{display:flex;align-items:center;gap:7px;color:#a1a99a;font-size:9px;font-weight:700;letter-spacing:1.25px}.page-overline i{width:6px;height:6px;border-radius:50%;background:#ffd64c}.page-heading h1{margin:9px 0 5px;font:700 30px Manrope,sans-serif;letter-spacing:-1px}.page-heading p{margin:0;color:#9da398;font-size:11px}.notice-banner,.error-banner{display:flex;align-items:center;gap:9px;margin-bottom:14px;padding:10px 12px;border:1px solid #8bd74f25;border-radius:8px;background:#8bd74f0b;color:#c5df9e;font-size:11px}.error-banner{border-color:#a7463c55;background:#a7463c18;color:#ffb4a8}.error-banner button{margin-left:auto;border:0;background:transparent;color:#ffd64c;text-decoration:underline;cursor:pointer}.loading-state{display:flex;align-items:center;padding:20px;border:1px solid #ffffff12;border-radius:12px;background:#191b19;color:#aeb4a8;font-size:11px}.loading-dot{width:7px;height:7px;display:inline-block;margin-right:8px;border-radius:50%;background:#ffd64c;animation:pulse .9s infinite alternate}.role-note{display:flex;align-items:flex-start;gap:10px;margin-top:14px;padding:13px 15px;border:1px solid #ffd64c20;border-radius:9px;background:#ffd64c08;color:#c8bd91}.role-note svg{flex:none;color:#ffd64c}.role-note p{margin:0;font-size:10px;line-height:1.6}@keyframes pulse{to{opacity:.35;transform:scale(.7)}}@media(max-width:600px){.role-permissions-page{min-height:calc(100vh - 58px);margin-left:0}.page-content{padding:18px 12px 32px}.page-heading{margin:20px 0}.page-heading h1{font-size:25px}}
</style>
