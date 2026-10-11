import { ref } from 'vue'

const searchQuery = ref('')

export function useGlobalSearch() {
  function clearSearch() {
    searchQuery.value = ''
  }

  return { searchQuery, clearSearch }
}
