<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CurrentUser } from '../../../modules/auth/api/auth'
import AppIcon from './AppIcon.vue'
import SearchBar from './SearchBar.vue'
import type { WorkspaceOption } from '../../api/workspaces'
import UDevLogo from '../UDevLogo.vue'

const props = withDefaults(defineProps<{ user: CurrentUser | null; query: string; searchPlaceholder?: string; workspaces?: WorkspaceOption[]; activeWorkspaceId?: number | null }>(), {
  searchPlaceholder: 'Cari di UDev',
  workspaces: () => [],
  activeWorkspaceId: null,
})
const emit = defineEmits<{
  'update:query': [value: string]
  'toggle-sidebar': []
  'sign-out': []
  'select-workspace': [workspaceId: number]
}>()

const profileOpen = ref(false)
const workspaceOpen = ref(false)
const initials = computed(() => props.user?.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'U')
const activeWorkspace = computed(() => props.workspaces.find((workspace) => workspace.id === props.activeWorkspaceId) || null)
</script>

<template>
  <header class="app-topbar">
    <div class="topbar-inner">
      <div class="topbar-start">
        <button class="topbar-icon sidebar-toggle" type="button" aria-label="Tampilkan atau sembunyikan sidebar" @click="emit('toggle-sidebar')">
          <AppIcon name="menu" :size="23" />
        </button>
        <a class="topbar-brand" href="/" aria-label="UDev beranda">
          <UDevLogo class="topbar-brand-full-logo" alt="UDev" />
          <!-- <UDevLogo variant="circle" class="topbar-brand-circle-logo" alt="UDev" /> -->
        </a>
      </div>

      <div class="topbar-search">
        <SearchBar :query="props.query" :placeholder="props.searchPlaceholder" @update:query="emit('update:query', $event)" />
        <button class="topbar-icon voice-search" type="button" aria-label="Pencarian suara"><AppIcon name="mic" :size="19" /></button>
      </div>

      <div class="topbar-actions">
        <div v-if="activeWorkspace" class="workspace-switcher">
          <button class="workspace-trigger" type="button" :aria-expanded="workspaceOpen" aria-label="Pilih workspace" @click="workspaceOpen = !workspaceOpen"><AppIcon name="briefcase" :size="15" /><span>{{ activeWorkspace.name }}</span><AppIcon name="chevron-down" :size="13" /></button>
          <div v-if="workspaceOpen" class="workspace-menu"><small>WORKSPACE AKTIF</small><button v-for="workspace in props.workspaces" :key="workspace.id" type="button" :class="{ selected: workspace.id === activeWorkspaceId }" @click="workspaceOpen = false; emit('select-workspace', workspace.id)">{{ workspace.name }}<span>{{ workspace.role }}</span></button></div>
        </div>
        <button class="topbar-icon notifications" type="button" aria-label="Notifikasi"><AppIcon name="bell" :size="20" /><span class="notification-indicator"></span></button>
        <div class="profile-area">
          <button class="profile-trigger" type="button" :aria-expanded="profileOpen" aria-label="Menu profil" @click="profileOpen = !profileOpen">
            <span class="profile-avatar">{{ initials }}</span>
            <span class="profile-name">{{ props.user?.name || 'Administrator' }}</span>
            <AppIcon class="profile-chevron" name="chevron-down" :size="16" />
          </button>
          <div v-if="profileOpen" class="profile-menu">
            <div class="profile-menu-user"><strong>{{ props.user?.name || 'Administrator' }}</strong><span>{{ props.user?.email }}</span></div>
            <button type="button" class="profile-logout" @click="emit('sign-out')"><AppIcon name="logout" :size="16" /> Keluar akun</button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-topbar{position:sticky;z-index:50;top:0;height:64px;border-bottom:1px solid #ffffff10;background:rgba(16,17,16,.76);backdrop-filter:blur(18px) saturate(140%);-webkit-backdrop-filter:blur(18px) saturate(140%);color:#f3f4f2}.topbar-inner{height:100%;display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,600px) minmax(0,1fr);align-items:center;gap:24px;padding:0 25px}.topbar-start,.topbar-actions,.topbar-search{min-width:0;display:flex;align-items:center}.topbar-start{gap:17px}.topbar-search{gap:12px}.topbar-actions{justify-content:flex-end;gap:17px}.topbar-icon{position:relative;width:38px;height:38px;display:grid;place-items:center;flex:none;border:0;border-radius:50%;background:transparent;color:#e4e6e2;cursor:pointer;transition:background .15s}.topbar-icon:hover{background:#ffffff16}.topbar-brand{display:flex;align-items:center;gap:8px;white-space:nowrap}.topbar-brand-mark{width:31px;height:31px;display:grid;place-items:center;border-radius:10px;background:#ffd64c;color:#1e3a07;font:800 18px Manrope,sans-serif}.topbar-brand-name{font:800 18px Manrope,sans-serif;letter-spacing:-.8px}.topbar-brand-name span{color:#ffd64c}.voice-search{width:41px;height:41px;background:#202220}.voice-search:hover{background:#303330}.notifications{margin-left:auto}.notification-indicator{position:absolute;top:8px;right:9px;width:7px;height:7px;border:1px solid #101110;border-radius:50%;background:#ffd64c}.profile-area{position:relative}.profile-trigger{height:42px;display:flex;align-items:center;gap:9px;padding:0 0 0 4px;border:0;background:transparent;color:#f2f3f1;cursor:pointer}.profile-avatar{width:33px;height:33px;display:grid;place-items:center;border:1px solid #59634c;border-radius:50%;background:#29341f;color:#d8eeae;font-size:11px;font-weight:700}.profile-name{max-width:110px;overflow:hidden;color:#e3e5e1;font-size:12px;text-overflow:ellipsis;white-space:nowrap}.profile-chevron{color:#999e98}.profile-menu{position:absolute;top:50px;right:0;width:230px;padding:9px;border:1px solid #343734;border-radius:13px;background:#222421;box-shadow:0 14px 35px #0008}.profile-menu-user{display:grid;gap:5px;padding:10px 9px 13px;border-bottom:1px solid #373a36}.profile-menu-user strong{font-size:12px}.profile-menu-user span{overflow:hidden;color:#a2a69f;font-size:10px;text-overflow:ellipsis}.profile-logout{width:100%;display:flex;align-items:center;gap:10px;margin-top:5px;padding:10px;border:0;border-radius:8px;background:transparent;color:#e3e5e1;text-align:left;font-size:12px;cursor:pointer}.profile-logout:hover{background:#ffffff10}
.workspace-switcher{position:relative;min-width:0}.workspace-trigger{max-width:190px;height:36px;display:flex;align-items:center;gap:7px;padding:0 9px;border:1px solid #ffffff18;border-radius:8px;background:#ffffff08;color:#d8e7c5;cursor:pointer}.workspace-trigger>span{overflow:hidden;font-size:10px;text-overflow:ellipsis;white-space:nowrap}.workspace-menu{position:absolute;top:43px;right:0;width:min(250px,calc(100vw - 24px));padding:8px;border:1px solid #343734;border-radius:10px;background:#222421;box-shadow:0 14px 35px #0008}.workspace-menu>small{display:block;padding:7px 8px;color:#8f9689;font-size:8px;font-weight:700;letter-spacing:.8px}.workspace-menu>button{width:100%;display:flex;flex-direction:column;gap:4px;padding:9px 8px;border:0;border-radius:7px;background:transparent;color:#e3e5e1;text-align:left;font-size:10px;cursor:pointer}.workspace-menu>button:hover,.workspace-menu>button.selected{background:#ffffff0c}.workspace-menu>button span{color:#969d90;font-size:8px;text-transform:capitalize}
@media(min-width:601px) and (max-width:1200px){.topbar-inner{grid-template-columns:auto minmax(0,1fr) auto;gap:16px;padding:0 18px}.topbar-start{gap:11px}.topbar-search{width:100%;max-width:600px;justify-self:center}.topbar-actions{gap:9px}.profile-name,.profile-chevron{display:none}.workspace-trigger{max-width:155px}.workspace-trigger>span{max-width:105px}}
@media(min-width:601px) and (max-width:900px){.topbar-inner{gap:12px;padding:0 16px}.topbar-search{min-width:0}.topbar-actions{gap:8px}.workspace-trigger{width:36px;max-width:36px;justify-content:center;padding:0}.workspace-trigger>span,.workspace-trigger>svg:last-child{display:none}.notifications{display:none}}
@media(max-width:600px){.app-topbar{height:58px}.topbar-inner{grid-template-columns:auto minmax(0,1fr) auto;gap:8px;padding:0 10px;padding-left:max(10px,env(safe-area-inset-left));padding-right:max(10px,env(safe-area-inset-right))}.topbar-start{gap:7px}.topbar-icon{width:34px;height:34px}.topbar-brand{gap:0}.topbar-brand-mark{width:29px;height:29px;border-radius:9px;font-size:16px}.topbar-brand-name{display:none}.topbar-search{gap:0}.app-search{height:36px;min-width:0}.app-search input{min-width:0;padding:0 11px;font-size:12px}.search-submit{width:39px}.voice-search{display:none}.topbar-actions{gap:7px}.notifications{display:none}.profile-avatar{width:31px;height:31px}.workspace-trigger{width:34px;height:34px;justify-content:center;padding:0}.workspace-trigger>span,.workspace-trigger>svg:last-child{display:none}}
</style>

<style scoped>
.topbar-brand{min-width:0}
.topbar-brand-full-logo{width:119px;max-height:45px}
.topbar-brand-circle-logo{display:none;width:34px;height:34px;flex:none}
@media(max-width:600px){.topbar-brand-full-logo{display:none}.topbar-brand-circle-logo{display:block;width:30px;height:30px}}
</style>
