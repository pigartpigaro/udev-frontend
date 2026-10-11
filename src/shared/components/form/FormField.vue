<script setup lang="ts">
const props = withDefaults(defineProps<{ id: string; label: string; required?: boolean; full?: boolean; error?: string }>(), { required: false, full: false, error: '' })
</script>

<template>
  <div class="field" :class="{ full: props.full }">
    <label :for="props.id"><span>{{ props.label }} <i v-if="props.required">*</i></span></label>
    <slot />
    <small v-if="props.error" class="field-error" role="alert">{{ props.error }}</small>
  </div>
</template>

<style scoped>
.field{min-width:0;display:grid;gap:7px;color:#ccd0ca;font-size:11px;font-weight:600}.field.full{grid-column:1/-1}.field label{min-width:0}.field label i{color:#ffd64c;font-style:normal}.field-error{color:#ffb4a8;font-size:10px;font-weight:400;line-height:1.4}@media(max-width:520px){.field.full{grid-column:auto}}
</style>
