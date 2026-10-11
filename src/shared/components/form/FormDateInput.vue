<script setup lang="ts">
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ modelValue: string | null | undefined; type?: 'date' | 'month' }>(), { modelValue: '', type: 'date' })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <input class="form-control" :type="props.type" :value="props.modelValue ?? ''" v-bind="$attrs" @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
</template>

<style scoped>
.form-control{width:100%;min-width:0;min-height:42px;box-sizing:border-box;padding:10px 12px;border:1px solid var(--form-field-border,#393d38);border-radius:8px;outline:0;background:var(--form-field-bg,transparent);color:var(--form-field-text,inherit);color-scheme:var(--form-field-scheme,dark);font:400 12px 'DM Sans',sans-serif;transition:border-color .15s,box-shadow .15s}.form-control:focus{border-color:#8bbf58;box-shadow:0 0 0 3px #8bd74f19}.form-control:disabled,.form-control:read-only{opacity:.75}
</style>
