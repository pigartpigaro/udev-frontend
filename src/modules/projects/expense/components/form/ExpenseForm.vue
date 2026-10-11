<script setup lang="ts">
import { ref, watch } from 'vue'
import FormDateInput from '../../../../../shared/components/form/FormDateInput.vue'
import FormField from '../../../../../shared/components/form/FormField.vue'
import FormInput from '../../../../../shared/components/form/FormInput.vue'
import FormSelect from '../../../../../shared/components/form/FormSelect.vue'
import FormTextarea from '../../../../../shared/components/form/FormTextarea.vue'
import AppIcon from '../../../../../shared/components/layout/AppIcon.vue'
import { getExpenseProjects } from '../../api/expenses'
import type { ExpensePayload } from '../../types/expense'

const props = defineProps<{ submitting: boolean; error: string }>()
const emit = defineEmits<{ submit: [payload: ExpensePayload] }>()
const today = new Date()
const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
const form = ref<ExpensePayload>({ project_id: null, category: 'other', paid_to: '', amount: '', spent_at: localDate, method: 'bank_transfer', reference: null, notes: null })
const categoryOptions = [{ value: 'transport', label: 'Transportasi' }, { value: 'accommodation', label: 'Akomodasi' }, { value: 'meals', label: 'Konsumsi' }, { value: 'equipment', label: 'Peralatan' }, { value: 'software', label: 'Software / layanan digital' }, { value: 'communication', label: 'Komunikasi' }, { value: 'other', label: 'Lainnya' }]
const methodOptions = [{ value: 'bank_transfer', label: 'Transfer bank' }, { value: 'cash', label: 'Tunai' }, { value: 'other', label: 'Lainnya' }]
const projectQuery = ref('')
const projects = ref<Array<{ id: number; code: string; name: string }>>([])
const projectOpen = ref(false)
const projectError = ref('')
const projectLoading = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
async function searchProjects() {
  projectLoading.value = true; projectError.value = ''
  try { projects.value = (await getExpenseProjects(projectQuery.value)).data }
  catch (error) { projectError.value = error instanceof Error ? error.message : 'Project gagal dimuat.' }
  finally { projectLoading.value = false }
}
function chooseProject(project: { id: number; code: string; name: string } | null) {
  form.value.project_id = project?.id ?? null
  projectQuery.value = project ? `${project.code} — ${project.name}` : 'Operasional tim (tanpa project)'
  projectOpen.value = false
}
watch(projectQuery, (value) => {
  if (form.value.project_id && projects.value.some((project) => project.id === form.value.project_id && `${project.code} — ${project.name}` === value)) return
  if (value === 'Operasional tim (tanpa project)') return
  form.value.project_id = null
  clearTimeout(timer); timer = setTimeout(() => { projectOpen.value = true; void searchProjects() }, 250)
})
function submit() { emit('submit', { ...form.value, paid_to: form.value.paid_to.trim(), reference: form.value.reference?.trim() || null, notes: form.value.notes?.trim() || null }) }
</script>

<template>
  <form class="expense-form" @submit.prevent="submit">
    <div v-if="props.error" class="form-error" role="alert">{{ props.error }}</div>
    <div class="form-grid">
      <FormField id="expense-project" label="Project (opsional)" full><div class="combobox"><FormInput id="expense-project" v-model="projectQuery" role="combobox" aria-autocomplete="list" :aria-expanded="projectOpen" autocomplete="off" placeholder="Cari project, atau kosongkan untuk operasional tim" @focus="projectOpen = true; void searchProjects()" @keydown.esc="projectOpen = false" /><div v-if="projectOpen" class="choice-options" role="listbox"><button type="button" role="option" @mousedown.prevent="chooseProject(null)"><strong>Operasional tim</strong><small>Tidak terkait project tertentu</small></button><button v-for="project in projects" :key="project.id" type="button" role="option" @mousedown.prevent="chooseProject(project)"><strong>{{ project.code }} — {{ project.name }}</strong></button><span v-if="projectLoading || projectError" class="no-options">{{ projectLoading ? 'Memuat project...' : projectError }}</span></div></div></FormField>
      <FormField id="expense-category" label="Kategori" required><FormSelect id="expense-category" :model-value="form.category" :options="categoryOptions" @update:model-value="form.category = $event as ExpensePayload['category']" /></FormField>
      <FormField id="expense-paid-to" label="Dibayarkan kepada" required><FormInput id="expense-paid-to" v-model="form.paid_to" required maxlength="150" placeholder="Nama toko, vendor, atau penerima" /></FormField>
      <FormField id="expense-amount" label="Nominal (Rp)" required><FormInput id="expense-amount" v-model="form.amount" type="number" min="0.01" step="0.01" inputmode="decimal" required placeholder="Contoh: 250000" /></FormField>
      <FormField id="expense-date" label="Tanggal pengeluaran" required><FormDateInput id="expense-date" v-model="form.spent_at" type="date" required /></FormField>
      <FormField id="expense-method" label="Metode pembayaran" required><FormSelect id="expense-method" :model-value="form.method" :options="methodOptions" @update:model-value="form.method = $event as ExpensePayload['method']" /></FormField>
      <FormField id="expense-reference" label="Referensi / bukti transaksi" full><FormInput id="expense-reference" v-model="form.reference" maxlength="100" placeholder="Nomor kuitansi, transfer, atau identitas bukti" /></FormField>
      <FormField id="expense-notes" label="Keterangan" full><FormTextarea id="expense-notes" v-model="form.notes" maxlength="2000" rows="3" placeholder="Rincian atau keperluan pengeluaran" /></FormField>
    </div>
    <p class="form-hint"><AppIcon name="info" :size="14" /> Pengeluaran langsung sah setelah disimpan. Koreksi mewajibkan alasan dan tetap tercatat di riwayat.</p>
    <div class="form-actions"><button type="submit" :disabled="props.submitting"><AppIcon name="check" :size="15" /> {{ props.submitting ? 'Menyimpan...' : 'Simpan pengeluaran' }}</button></div>
  </form>
</template>

<style scoped>
.expense-form{padding:21px 24px}.form-error{margin-bottom:14px;padding:10px 12px;border:1px solid #a7463c55;border-radius:8px;background:#a7463c18;color:#ffb4a8;font-size:11px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.combobox{position:relative;min-width:0}.choice-options{position:absolute;z-index:8;top:calc(100% + 5px);left:0;right:0;width:100%;max-width:calc(100vw - 32px);max-height:min(210px,32dvh);overflow:auto;padding:4px;border:1px solid #393d38;border-radius:8px;background:#1c1f1c;box-shadow:0 10px 25px #0008}.choice-options button{width:100%;display:grid;gap:4px;padding:9px 10px;border:0;border-radius:5px;background:transparent;color:#e5e9e0;text-align:left;font:400 11px 'DM Sans',sans-serif;overflow-wrap:anywhere}.choice-options button:hover{background:#8bd74f1a}.choice-options small,.no-options{color:#989f94;font-size:10px}.no-options{display:block;padding:9px 10px}.form-hint{display:flex;gap:7px;align-items:flex-start;margin:15px 0;color:#969d91;font-size:10px;line-height:1.5}.form-actions{display:flex;justify-content:flex-end;margin-top:18px;padding-top:15px;border-top:1px solid #ffffff12}.form-actions button{height:38px;display:flex;align-items:center;gap:7px;padding:0 15px;border:0;border-radius:8px;background:#ffd64c;color:#263215;font-size:11px;font-weight:700}.form-actions button:disabled{opacity:.55}@media(max-width:520px){.expense-form{padding:17px}.form-grid{grid-template-columns:1fr}.form-actions{position:sticky;bottom:0;z-index:2;margin:0 -17px;padding:12px 17px calc(8px + env(safe-area-inset-bottom));background:#20221f}}
</style>
