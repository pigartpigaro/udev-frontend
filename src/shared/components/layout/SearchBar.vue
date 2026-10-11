<script setup lang="ts">
import AppIcon from './AppIcon.vue'

withDefaults(defineProps<{ query: string; placeholder?: string }>(), { placeholder: 'Cari di UDev' })
const emit = defineEmits<{ 'update:query': [value: string] }>()

function updateQuery(event: Event) {
  emit('update:query', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <form class="app-search" role="search" @submit.prevent>
    <input
      :value="query"
      type="search"
      aria-label="Cari di UDev"
      :placeholder="placeholder"
      @input="updateQuery"
    />
    <button class="search-submit" type="submit" aria-label="Cari">
      <AppIcon name="search" :size="19" />
    </button>
  </form>
</template>

<style scoped>
.app-search{width:100%;height:42px;display:flex;align-items:center;overflow:hidden;border:1px solid #343634;border-radius:24px;background:#121312;transition:border-color .18s,background .18s}.app-search:focus-within{border-color:#696e68;background:#101110}.app-search input{min-width:0;flex:1;height:100%;padding:0 17px;border:0;outline:0;background:transparent;color:#f2f3f1;font-size:14px}.app-search input::placeholder{color:#858983}.app-search input::-webkit-search-cancel-button{filter:grayscale(1) brightness(2)}.search-submit{width:58px;height:100%;display:grid;place-items:center;flex:none;border:0;border-left:1px solid #343634;background:#242624;color:#e4e6e2;cursor:pointer;transition:background .18s}.search-submit:hover{background:#303330}
</style>
