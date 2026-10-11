<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { MenuItem } from '../../api/navigation'
import AppIcon from './AppIcon.vue'
import UDevLogo from '../UDevLogo.vue'
import { frontendRouteFor } from '../../../app/menuRoutes'

const props = defineProps<{ menus: MenuItem[]; pinned: boolean; mobileOpen: boolean }>()
const emit = defineEmits<{ 'sign-out': []; navigate: [] }>()
const expanded = ref<string[]>([])
const visibleMenus = computed(() => props.menus.filter((item) => {
  const key = item.key.trim().toLowerCase().replaceAll(/[\s_-]+/g, '')
  const label = item.label.trim().toLowerCase().replaceAll(/[\s_-]+/g, '')
  return key !== 'dashboard' && label !== 'dashboard'
}))

watch(() => props.pinned, (pinned) => {
  if (!pinned) expanded.value = []
})

function closeSubmenusOnLeave() {
  if (!props.pinned && !window.matchMedia('(max-width: 600px)').matches) expanded.value = []
}

function toggleMenu(key: string) {
  expanded.value = expanded.value.includes(key)
    ? expanded.value.filter((item) => item !== key)
    : [...expanded.value, key]
}

function iconFor(item: MenuItem): string {
  if (item.icon) return item.icon
  const key = `${item.key} ${item.label}`.toLowerCase()
  if (key.includes('pelanggan') || key.includes('customer')) return 'customers'
  if (key.includes('proyek') || key.includes('project')) return 'projects'
  if (key.includes('keuangan') || key.includes('finance')) return 'finance'
  if (key.includes('invoice')) return 'invoice'
  if (key.includes('pengaturan') || key.includes('setting')) return 'settings'
  return 'dashboard'
}
</script>

<template>
  <aside class="app-sidebar" :class="{ 'sidebar-pinned': pinned, 'sidebar-mobile-hidden': !mobileOpen }" aria-label="Navigasi utama" @mouseleave="closeSubmenusOnLeave">
    <div class="sidebar-section-title"><span class="section-label">MENU UTAMA</span></div>
    <RouterLink class="sidebar-link sidebar-home" to="/" title="Dashboard" exact-active-class="sidebar-link-active" @click="emit('navigate')">
      <AppIcon name="dashboard" :size="20" /><span class="sidebar-link-label">Dashboard</span>
    </RouterLink>

    <div v-for="item in visibleMenus" :key="item.key" class="sidebar-menu-group">
      <RouterLink v-if="frontendRouteFor(item.route_name)" class="sidebar-link" :to="frontendRouteFor(item.route_name)!" active-class="sidebar-link-active" exact-active-class="sidebar-link-active" :title="item.label" @click="emit('navigate')">
        <AppIcon :name="iconFor(item)" :size="20" /><span class="sidebar-link-label">{{ item.label }}</span>
      </RouterLink>
      <a v-else-if="item.route_name" class="sidebar-link" :href="`#${item.route_name}`" :title="item.label" @click="emit('navigate')">
        <AppIcon :name="iconFor(item)" :size="20" /><span class="sidebar-link-label">{{ item.label }}</span>
      </a>
      <button v-else class="sidebar-link sidebar-menu-toggle" type="button" :title="item.label" :aria-expanded="expanded.includes(item.key)" @click="toggleMenu(item.key)">
        <AppIcon :name="iconFor(item)" :size="20" /><span class="sidebar-link-label">{{ item.label }}</span>
        <AppIcon class="sidebar-chevron" name="chevron-down" :size="15" />
      </button>
      <div v-if="item.children.length && expanded.includes(item.key)" class="sidebar-submenu">
        <template v-for="child in item.children" :key="child.key">
          <RouterLink v-if="frontendRouteFor(child.route_name)" class="sidebar-link sidebar-child-link" :to="frontendRouteFor(child.route_name)!" active-class="sidebar-link-active" exact-active-class="sidebar-link-active" :title="child.label" @click="emit('navigate')">
            <AppIcon :name="iconFor(child)" :size="18" /><span class="sidebar-link-label">{{ child.label }}</span>
          </RouterLink>
          <a v-else class="sidebar-link sidebar-child-link" :href="child.route_name ? `#${child.route_name}` : '#'" :title="child.label" @click="emit('navigate')">
            <AppIcon :name="iconFor(child)" :size="18" /><span class="sidebar-link-label">{{ child.label }}</span>
          </a>
        </template>
      </div>
    </div>

    <div class="sidebar-spacer"></div>
    <a class="sidebar-link support-link" href="mailto:admin@udumbara.com" title="Bantuan">
      <AppIcon name="help" :size="19" /><span class="sidebar-link-label">Bantuan</span>
    </a>
    <button class="sidebar-link sidebar-logout" type="button" title="Keluar akun" @click="emit('sign-out')">
      <AppIcon name="logout" :size="19" /><span class="sidebar-link-label">Keluar akun</span>
    </button>
    <div class="sidebar-brand"><UDevLogo variant="circle" class="sidebar-logo" alt="" /><span class="sidebar-link-label">Udumbara Workspace</span></div>
  </aside>
</template>

<style scoped>
.app-sidebar{position:fixed;z-index:40;top:64px;bottom:0;left:0;width:76px;display:flex;flex-direction:column;overflow-x:hidden;overflow-y:auto;padding:12px 9px 14px;border-right:1px solid #ffffff0c;background:#101110;color:#e6e8e4;transition:width .2s ease,transform .2s ease}.app-sidebar:hover,.app-sidebar:focus-within,.app-sidebar.sidebar-pinned{width:246px;box-shadow:14px 0 32px #0005}.sidebar-section-title{height:30px;display:flex;align-items:center;padding:0 14px;white-space:nowrap}.section-label{overflow:hidden;color:#82877f;font-size:9px;font-weight:700;letter-spacing:1.25px;opacity:0;transition:opacity .12s}.app-sidebar:hover .section-label,.app-sidebar:focus-within .section-label,.app-sidebar.sidebar-pinned .section-label{opacity:1}.menu-section-title{margin-top:17px}.sidebar-link{position:relative;width:56px;min-height:44px;display:flex;align-items:center;gap:15px;margin:2px auto;padding:0 17px;overflow:hidden;border:0;border-radius:9px;background:transparent;color:#c7cbc4;text-decoration:none;white-space:nowrap;cursor:pointer;transition:width .2s,background .15s,color .15s}.sidebar-link:hover{background:#ffffff10;color:#fff}.sidebar-link-active{background:#ffffff17;color:#fff;font-weight:600}.app-sidebar:hover .sidebar-link,.app-sidebar:focus-within .sidebar-link,.app-sidebar.sidebar-pinned .sidebar-link{width:100%;margin-left:0;margin-right:0;padding-left:15px;padding-right:13px}.sidebar-link>svg{width:22px;min-width:22px;color:#b9beb5}.sidebar-link-active>svg{color:#ffd64c}.sidebar-link-label{min-width:0;overflow:hidden;color:inherit;font-size:12px;text-overflow:ellipsis;opacity:0;transition:opacity .12s}.app-sidebar:hover .sidebar-link-label,.app-sidebar:focus-within .sidebar-link-label,.app-sidebar.sidebar-pinned .sidebar-link-label{opacity:1}.sidebar-menu-toggle{text-align:left}.sidebar-chevron{margin-left:auto;opacity:0}.app-sidebar:hover .sidebar-chevron,.app-sidebar:focus-within .sidebar-chevron,.app-sidebar.sidebar-pinned .sidebar-chevron{opacity:1}.sidebar-submenu{display:grid;padding:3px 0 6px 13px}.sidebar-child-link{min-height:39px;font-size:11px}.sidebar-child-link>svg{width:20px;min-width:20px}.sidebar-spacer{flex:1;min-height:18px}.support-link{margin-top:10px}.sidebar-logout{flex:none}.sidebar-brand{height:42px;display:flex;align-items:center;gap:14px;margin:8px 0 0;padding:0 13px;border-top:1px solid #ffffff12;white-space:nowrap}.sidebar-brand-mark{width:25px;height:25px;display:grid;place-items:center;flex:none;border-radius:8px;background:#ffd64c;color:#1e3a07;font-size:14px;font-weight:800}.sidebar-brand .sidebar-link-label{color:#aeb3aa;font-size:10px}
@media(max-width:600px){.app-sidebar{top:58px;width:68px;padding:10px 6px}.app-sidebar:hover,.app-sidebar:focus-within,.app-sidebar.sidebar-pinned{width:68px;box-shadow:none}.app-sidebar.sidebar-mobile-hidden{transform:translateX(-100%)}.sidebar-section-title{padding:0 13px}.section-label,.sidebar-link-label,.sidebar-chevron{display:none!important}.sidebar-link,.app-sidebar:hover .sidebar-link,.app-sidebar:focus-within .sidebar-link,.app-sidebar.sidebar-pinned .sidebar-link{width:52px;min-height:45px;justify-content:center;gap:0;margin:2px auto;padding:0}.sidebar-menu-toggle>svg:last-child{display:none}.sidebar-submenu{padding:3px 0}.sidebar-child-link,.app-sidebar:hover .sidebar-child-link{width:52px;min-height:41px;justify-content:center;padding:0}.sidebar-brand{justify-content:center;height:42px;margin-top:8px;padding:0;border-top:1px solid #ffffff12}.sidebar-brand .sidebar-link-label{display:none!important}}
@media(max-width:600px){.app-sidebar{top:58px;left:0;width:min(78vw,250px);padding:12px 10px;transform:translateX(0);box-shadow:14px 0 35px #0009}.app-sidebar.sidebar-mobile-hidden{transform:translateX(-105%)}.app-sidebar:hover,.app-sidebar:focus-within,.app-sidebar.sidebar-pinned{width:min(78vw,250px);box-shadow:14px 0 35px #0009}.sidebar-section-title{height:32px;padding:0 14px}.section-label,.sidebar-link-label,.sidebar-chevron{display:block!important;opacity:1}.sidebar-link,.app-sidebar:hover .sidebar-link,.app-sidebar:focus-within .sidebar-link,.app-sidebar.sidebar-pinned .sidebar-link{width:100%;min-height:44px;justify-content:flex-start;gap:15px;margin:2px 0;padding:0 14px}.sidebar-menu-toggle .sidebar-chevron{display:block!important}.sidebar-submenu{padding:3px 0 6px 13px}.sidebar-child-link,.app-sidebar:hover .sidebar-child-link{width:100%;min-height:39px;justify-content:flex-start;padding:0 12px}.sidebar-brand{justify-content:flex-start;height:46px;margin-top:8px;padding:0 12px;border-top:1px solid #ffffff12}.sidebar-brand .sidebar-link-label{display:block!important}}
@media(max-width:600px){.app-sidebar{padding-bottom:calc(14px + env(safe-area-inset-bottom))}}
</style>

<style scoped>
.sidebar-logo{width:25px;height:25px;flex:none}
</style>
