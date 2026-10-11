<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCurrentUser } from '../modules/auth/api/auth'
import { getWorkspaces } from '../shared/api/workspaces'
import { setActiveWorkspaceId } from '../shared/api/client'
import ToastHost from '../shared/components/ToastHost.vue'
import UDevLogo from '../shared/components/UDevLogo.vue'

const route = useRoute()
const router = useRouter()
const checking = ref(true)

onMounted(async () => {
  const user = await getCurrentUser().catch(() => null)
  const isLogin = route.path === '/login'
  if (user) {
    try {
      const workspaces = await getWorkspaces()
      const savedId = Number(window.localStorage.getItem('udev.active-workspace-id'))
      const active = workspaces.find((workspace) => workspace.id === savedId) || workspaces[0]
      setActiveWorkspaceId(active?.id ?? null)
    } catch {
      setActiveWorkspaceId(null)
    }
  }
  checking.value = false
  if (!user && !isLogin) await router.replace('/login')
  if (user && isLogin) await router.replace('/')
})
</script>

<template>
  <ToastHost />
  <div v-if="checking" class="app-loading" role="status" aria-label="Memeriksa sesi">
    <UDevLogo variant="circle" class="app-loading-logo" alt="" />
    <span class="sr-only">Memeriksa sesi...</span>
  </div>
  <RouterView v-else />
</template>
