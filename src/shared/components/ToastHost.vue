<script setup lang="ts">
import AppIcon from './layout/AppIcon.vue'
import { useToast } from '../composables/useToast'

const { toast, dismissToast } = useToast()
</script>

<template>
  <Teleport to="body">
    <Transition name="app-toast">
      <div v-if="toast" :key="toast.id" class="app-toast" :class="`is-${toast.kind}`" :role="toast.kind === 'error' ? 'alert' : 'status'" :aria-live="toast.kind === 'error' ? 'assertive' : 'polite'">
        <AppIcon :name="toast.kind === 'success' ? 'check' : 'x'" :size="18" />
        <span>{{ toast.message }}</span>
        <button type="button" aria-label="Tutup notifikasi" @click="dismissToast"><AppIcon name="x" :size="16" /></button>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.app-toast{position:fixed;z-index:10000;top:max(16px,env(safe-area-inset-top));right:max(16px,env(safe-area-inset-right));box-sizing:border-box;width:min(420px,calc(100vw - 32px));display:flex;align-items:center;gap:11px;padding:14px 14px;border:1px solid #8bd74f55;border-radius:11px;background:#1c2419;color:#d8efc1;box-shadow:0 14px 40px #0008;font:600 13px/1.45 Manrope,system-ui,sans-serif;backdrop-filter:blur(14px)}
.app-toast>svg{flex:none;color:#a7df65}.app-toast>span{flex:1;min-width:0;overflow-wrap:anywhere}.app-toast>button{width:28px;height:28px;display:grid;place-items:center;flex:none;border:0;border-radius:7px;background:#ffffff0d;color:#d5ddce;cursor:pointer}.app-toast>button:hover{background:#ffffff1a}.app-toast.is-error{border-color:#d96c5d77;background:#2c1c1a;color:#ffd4cf}.app-toast.is-error>svg{color:#ff8f81}.app-toast-enter-active,.app-toast-leave-active{transition:opacity .18s ease,transform .18s ease}.app-toast-enter-from,.app-toast-leave-to{opacity:0;transform:translateY(-8px)}
@media(max-width:600px){.app-toast{top:max(10px,env(safe-area-inset-top));right:max(10px,env(safe-area-inset-right));width:calc(100vw - 20px);padding:12px;font-size:12px}}
</style>
