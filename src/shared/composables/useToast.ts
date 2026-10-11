import { readonly, ref } from 'vue'

export type ToastKind = 'success' | 'error'
export interface ToastItem { id: number; message: string; kind: ToastKind }

const activeToast = ref<ToastItem | null>(null)
let nextId = 0
let dismissTimer: ReturnType<typeof setTimeout> | undefined

export function useToast() {
  function dismissToast() {
    if (dismissTimer) clearTimeout(dismissTimer)
    dismissTimer = undefined
    activeToast.value = null
  }

  function showToast(message: string, kind: ToastKind = 'success', duration = 4500) {
    if (dismissTimer) clearTimeout(dismissTimer)
    activeToast.value = { id: ++nextId, message, kind }
    dismissTimer = setTimeout(() => { activeToast.value = null }, duration)
  }

  return { toast: readonly(activeToast), showToast, dismissToast }
}
