<script setup lang="ts">
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ modelValue: string | null | undefined }>(), { modelValue: '' })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <textarea class="form-control" :value="props.modelValue ?? ''" v-bind="$attrs" @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"></textarea>
</template>

<style scoped>
.form-control{width:100%;min-width:0;min-height:78px;box-sizing:border-box;padding:10px 12px;border:1px solid var(--form-field-border,#393d38);border-radius:8px;outline:0;background:var(--form-field-bg,transparent);color:var(--form-field-text,inherit);font:400 12px/1.5 'DM Sans',sans-serif;resize:vertical;transition:border-color .15s,box-shadow .15s}.form-control::placeholder{color:var(--form-field-placeholder,#777d74)}.form-control:focus{border-color:#8bbf58;box-shadow:0 0 0 3px #8bd74f19}
</style>
