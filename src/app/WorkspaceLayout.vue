<script setup lang="ts">
import { computed, onMounted, onUnmounted, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { CurrentUser } from '../modules/auth/api/auth'
import { getCurrentUser, logout } from '../modules/auth/api/auth'
import { getNavigation, type MenuItem } from '../shared/api/navigation'
import { useGlobalSearch } from '../shared/composables/useGlobalSearch'
import AppHeader from '../shared/components/layout/AppHeader.vue'
import AppSidebar from '../shared/components/layout/AppSidebar.vue'
import { getWorkspaces, type WorkspaceOption } from '../shared/api/workspaces'
import { setActiveWorkspaceId } from '../shared/api/client'
import { navigationKey } from './keys'

const route = useRoute()
const router = useRouter()
const user = ref<CurrentUser | null>(null)
const navigation = ref<MenuItem[]>([])
const workspaces = ref<WorkspaceOption[]>([])
const activeWorkspaceId = ref<number | null>(null)
const sidebarPinned = ref(false)
const mobileSidebarOpen = ref(false)
const { searchQuery, clearSearch } = useGlobalSearch()
const searchPlaceholder = computed(() => String(route.meta.searchPlaceholder || 'Cari menu di UDev'))
provide(navigationKey, navigation)

function updateWorkspaceLabel(event: Event) {
  const updated = (event as CustomEvent<WorkspaceOption>).detail
  if (!updated) return
  workspaces.value = workspaces.value.map((workspace) => workspace.id === updated.id ? { ...workspace, name: updated.name } : workspace)
}

onMounted(async () => {
  window.addEventListener('udev:workspace-updated', updateWorkspaceLabel)
  user.value = await getCurrentUser()
  if (!user.value) return

  try {
    workspaces.value = await getWorkspaces()
    const savedId = Number(window.localStorage.getItem('udev.active-workspace-id'))
    const selected = workspaces.value.find((workspace) => workspace.id === savedId) || workspaces.value[0]
    if (selected) {
      activeWorkspaceId.value = selected.id
      setActiveWorkspaceId(selected.id)
      navigation.value = await getNavigation().catch(() => [])
    }
  } catch {
    navigation.value = []
  }
})

onUnmounted(() => window.removeEventListener('udev:workspace-updated', updateWorkspaceLabel))

watch(() => route.path, (path, previousPath) => {
  if (path !== previousPath) clearSearch()
  mobileSidebarOpen.value = false
})

function toggleSidebar() {
  if (window.matchMedia('(max-width: 600px)').matches) {
    mobileSidebarOpen.value = !mobileSidebarOpen.value
    return
  }
  sidebarPinned.value = !sidebarPinned.value
}

function selectWorkspace(workspaceId: number) {
  if (workspaceId === activeWorkspaceId.value) return
  activeWorkspaceId.value = workspaceId
  setActiveWorkspaceId(workspaceId)
  window.location.reload()
}

async function signOut() {
  try { await logout() } finally { await router.replace('/login') }
}
</script>

<template>
  <div class="udev-workspace" :class="{ 'print-layout': route.meta.printLayout === true }">
    <AppHeader
      v-model:query="searchQuery"
      :user="user"
      :workspaces="workspaces"
      :active-workspace-id="activeWorkspaceId"
      :search-placeholder="searchPlaceholder"
      @toggle-sidebar="toggleSidebar"
      @sign-out="signOut"
      @select-workspace="selectWorkspace"
    />
    <button v-if="mobileSidebarOpen" class="mobile-nav-backdrop" type="button" aria-label="Tutup menu" @click="mobileSidebarOpen = false"></button>
    <AppSidebar
      :menus="navigation"
      :pinned="sidebarPinned"
      :mobile-open="mobileSidebarOpen"
      @navigate="mobileSidebarOpen = false"
      @sign-out="signOut"
    />
    <RouterView />
  </div>
</template>

<style>
.udev-workspace{--workspace-bg:#0f100f;--workspace-surface:#191b19;--workspace-line:#ffffff12;min-height:100vh;background:var(--workspace-bg);color:#eff1ed}
.udev-workspace{--form-field-bg:transparent;--form-field-text:inherit;--form-field-border:#393d38;--form-field-placeholder:#777d74;--form-field-scheme:dark;--form-popup-bg:#1c1f1c;--form-popup-text:#e5e9e0}
.mobile-nav-backdrop{position:fixed;z-index:35;inset:58px 0 0;width:100%;border:0;background:rgba(0,0,0,.62);backdrop-filter:blur(2px)}
@media(min-width:601px){.mobile-nav-backdrop{display:none}}
.udev-workspace.print-layout .app-topbar,.udev-workspace.print-layout .app-sidebar,.udev-workspace.print-layout .mobile-nav-backdrop{display:none!important}
</style>
