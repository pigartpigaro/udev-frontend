<script setup lang="ts">
import { computed } from 'vue'
import type { PermissionOption } from '../../api/rolePermissions'

const props = defineProps<{ permissions: PermissionOption[]; saving: boolean }>()
const emit = defineEmits<{ save: []; toggle: [id: number] }>()
const groups = computed(() => {
  const labels: Record<string, string> = { navigation: 'Dashboard', master: 'Master Data', projects: 'Project', reports: 'Laporan' }
  const grouped = new Map<string, PermissionOption[]>()
  for (const permission of props.permissions) {
    const key = permission.key.split('.')[0]
    grouped.set(key, [...(grouped.get(key) || []), permission])
  }
  return [...grouped.entries()].map(([key, permissions]) => ({ key, label: labels[key] || key, permissions }))
})
</script>

<template>
  <div class="role-form">
    <div class="role-intro"><div><span class="form-overline">ROLE ANGGOTA</span><h2>Akses role Member</h2><p>Pilih fitur yang boleh digunakan anggota di workspace ini. Perubahan hanya berlaku pada workspace aktif.</p></div><span class="permission-count">{{ permissions.filter((permission) => permission.enabled).length }} aktif</span></div>
    <section v-for="group in groups" :key="group.key" class="permission-group">
      <h3>{{ group.label }}</h3>
      <label v-for="permission in group.permissions" :key="permission.id" class="permission-row">
        <span class="permission-copy"><strong>{{ permission.label }}</strong><small>{{ permission.key }}</small></span>
        <input type="checkbox" :checked="permission.enabled" :aria-label="permission.label" :disabled="saving" @change="emit('toggle', permission.id)" />
      </label>
    </section>
    <div class="form-footer"><p>Hak akses Admin dijaga tetap agar pengelola tidak kehilangan akses pengaturan.</p><button class="save-button" type="button" :disabled="saving" @click="emit('save')">{{ saving ? 'Menyimpan...' : 'Simpan hak akses' }}</button></div>
  </div>
</template>

<style scoped>
.role-form{display:grid;gap:14px}.role-intro{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:19px;border:1px solid #ffffff12;border-radius:12px;background:#191b19}.form-overline{color:#a1a99a;font-size:9px;font-weight:700;letter-spacing:1.2px}.role-intro h2{margin:8px 0 5px;font:700 16px Manrope,sans-serif}.role-intro p{max-width:650px;margin:0;color:#9da398;font-size:11px;line-height:1.6}.permission-count{flex:none;padding:6px 9px;border:1px solid #8bd74f2b;border-radius:20px;background:#8bd74f0c;color:#c5df9e;font-size:9px}.permission-group{overflow:hidden;border:1px solid #ffffff12;border-radius:11px;background:#191b19}.permission-group h3{margin:0;padding:13px 16px;border-bottom:1px solid #ffffff10;color:#dce0d7;font-size:11px}.permission-row{min-height:58px;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:10px 16px;border-bottom:1px solid #ffffff0a;cursor:pointer}.permission-row:last-child{border-bottom:0}.permission-copy{min-width:0;display:grid;gap:4px}.permission-copy strong{color:#e5e8e1;font-size:11px;font-weight:500}.permission-copy small{overflow-wrap:anywhere;color:#858b82;font-size:9px}.permission-row input{width:17px;height:17px;flex:none;accent-color:#8bd74f;cursor:pointer}.form-footer{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:7px 2px}.form-footer p{margin:0;color:#92988e;font-size:10px;line-height:1.5}.save-button{min-height:38px;flex:none;padding:0 14px;border:0;border-radius:8px;background:#ffd64c;color:#263215;font-size:11px;font-weight:700;cursor:pointer}.save-button:disabled{opacity:.5;cursor:not-allowed}@media(max-width:520px){.role-intro{padding:15px}.permission-group h3{padding:12px}.permission-row{padding:10px 12px}.form-footer{align-items:stretch;flex-direction:column}.save-button{width:100%;min-height:42px}}
</style>
