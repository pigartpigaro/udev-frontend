<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from '../layout/AppIcon.vue'

export interface FormSelectOption {
  value: string
  label: string
}

const props = withDefaults(defineProps<{
  id: string
  modelValue: string
  options: FormSelectOption[]
  disabled?: boolean
  placeholder?: string
}>(), { disabled: false, placeholder: 'Pilih...' })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const trigger = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const open = ref(false)
const activeIndex = ref(0)
const panelStyle = ref<Record<string, string>>({})
const selectedLabel = computed(() => props.options.find((option) => option.value === props.modelValue)?.label || props.placeholder)
const listId = computed(() => `${props.id}-options`)

function positionPanel() {
  if (!trigger.value) return
  const rect = trigger.value.getBoundingClientRect()
  const theme = getComputedStyle(trigger.value)
  const viewportWidth = document.documentElement.clientWidth
  const viewportHeight = window.innerHeight
  const maxHeight = Math.min(260, viewportHeight - 16)
  const roomBelow = Math.max(0, viewportHeight - rect.bottom - 8)
  const roomAbove = Math.max(0, rect.top - 8)
  const placeAbove = roomBelow < Math.min(200, maxHeight) && roomAbove > roomBelow
  const availableHeight = placeAbove ? roomAbove : roomBelow
  const width = Math.min(rect.width, viewportWidth - 16)
  const left = Math.min(Math.max(8, rect.left), viewportWidth - width - 8)
  panelStyle.value = {
    position: 'fixed',
    left: `${left}px`,
    width: `${width}px`,
    maxHeight: `${Math.max(0, Math.min(maxHeight, availableHeight))}px`,
    '--form-popup-bg': theme.getPropertyValue('--form-popup-bg').trim() || '#1c1f1c',
    '--form-popup-text': theme.getPropertyValue('--form-popup-text').trim() || theme.color,
    '--form-field-border': theme.getPropertyValue('--form-field-border').trim() || '#393d38',
    ...(placeAbove ? { bottom: `${viewportHeight - rect.top + 5}px` } : { top: `${rect.bottom + 5}px` }),
  }
}

async function showOptions() {
  if (props.disabled) return
  activeIndex.value = Math.max(0, props.options.findIndex((option) => option.value === props.modelValue))
  open.value = true
  await nextTick()
  positionPanel()
  scrollActiveOption()
}

function hideOptions() { open.value = false }
function choose(index: number) {
  const option = props.options[index]
  if (!option) return
  emit('update:modelValue', option.value)
  hideOptions()
}
function scrollActiveOption() {
  panel.value?.querySelector<HTMLElement>(`[id="${props.id}-option-${activeIndex.value}"]`)?.scrollIntoView({ block: 'nearest' })
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (!open.value) { void showOptions(); return }
    activeIndex.value = (activeIndex.value + 1) % props.options.length
    scrollActiveOption()
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (!open.value) { void showOptions(); return }
    activeIndex.value = (activeIndex.value - 1 + props.options.length) % props.options.length
    scrollActiveOption()
  } else if (event.key === 'Enter' || (event.key === ' ' && open.value)) {
    event.preventDefault()
    if (open.value) choose(activeIndex.value)
    else void showOptions()
  } else if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    hideOptions()
  }
}
function onPointerDown(event: PointerEvent) {
  const target = event.target as Node
  if (!trigger.value?.contains(target) && !panel.value?.contains(target)) hideOptions()
}
function reposition() { if (open.value) positionPanel() }

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('resize', reposition)
  window.addEventListener('scroll', reposition, true)
  window.visualViewport?.addEventListener('resize', reposition)
  window.visualViewport?.addEventListener('scroll', reposition)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  window.removeEventListener('resize', reposition)
  window.removeEventListener('scroll', reposition, true)
  window.visualViewport?.removeEventListener('resize', reposition)
  window.visualViewport?.removeEventListener('scroll', reposition)
})
</script>

<template>
  <button :id="props.id" ref="trigger" class="form-select" type="button" role="combobox" aria-haspopup="listbox" :aria-controls="listId" :aria-expanded="open" :aria-activedescendant="open ? `${props.id}-option-${activeIndex}` : undefined" :disabled="props.disabled" @click="open ? hideOptions() : showOptions()" @keydown="onKeydown">
    <span>{{ selectedLabel }}</span><AppIcon name="chevron-down" :size="15" />
  </button>
  <Teleport to="body">
    <div v-if="open" :id="listId" ref="panel" class="form-select-options" role="listbox" :aria-activedescendant="`${props.id}-option-${activeIndex}`" :style="panelStyle">
      <button v-for="(option, index) in props.options" :id="`${props.id}-option-${index}`" :key="option.value" type="button" role="option" :aria-selected="props.modelValue === option.value" :class="{ active: activeIndex === index }" @mouseenter="activeIndex = index" @click="choose(index)">{{ option.label }}</button>
    </div>
  </Teleport>
</template>

<style scoped>
.form-select{width:100%;min-height:42px;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border:1px solid var(--form-field-border,#393d38);border-radius:8px;outline:0;background:var(--form-field-bg,transparent);color:var(--form-field-text,inherit);text-align:left;font:400 12px 'DM Sans',sans-serif;cursor:pointer}.form-select>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.form-select svg{flex:none;color:var(--form-field-placeholder,#9da398)}.form-select:focus-visible{border-color:#8bbf58;box-shadow:0 0 0 3px #8bd74f19}.form-select:disabled{opacity:.6;cursor:not-allowed}.form-select-options{z-index:300;overflow-y:auto;overscroll-behavior:contain;padding:4px;border:1px solid var(--form-field-border,#393d38);border-radius:8px;background:var(--form-popup-bg,#1c1f1c);color:var(--form-popup-text,#e5e9e0);box-shadow:0 10px 25px #0008;scrollbar-width:thin}.form-select-options button{width:100%;min-height:38px;display:block;padding:9px 10px;border:0;border-radius:5px;background:transparent;color:inherit;text-align:left;font:400 12px 'DM Sans',sans-serif;cursor:pointer}.form-select-options button:hover,.form-select-options button.active,.form-select-options button[aria-selected='true']{background:#8bd74f1a;color:#d7efa9}
</style>
