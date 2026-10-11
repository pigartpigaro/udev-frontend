<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import FormDateInput from '../../../../../shared/components/form/FormDateInput.vue'
import FormField from '../../../../../shared/components/form/FormField.vue'
import FormInput from '../../../../../shared/components/form/FormInput.vue'
import FormTextarea from '../../../../../shared/components/form/FormTextarea.vue'
import FormSelect from '../../../../../shared/components/form/FormSelect.vue'
import type { Project } from '../../../project/types/project'
import type { InvoicePayload, InvoiceUpdatePayload, ProjectInvoice } from '../../types/invoice'

const props = defineProps<{ invoice: ProjectInvoice | null; replacementOf: ProjectInvoice | null; projects: Project[]; submitting: boolean; error: string }>()
const emit = defineEmits<{ submit: [payload: InvoicePayload | InvoiceUpdatePayload] }>()
function localToday() {
  const today = new Date()
  return [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-')
}
function localMonth() { return localToday().slice(0, 7) }
const form = ref<InvoicePayload>({ project_id: 0, billing_cycle: 'monthly', billing_period: localMonth(), supersedes_invoice_id: null, amount: '', issued_at: localToday(), due_at: null, notes: null })
const projectQuery = ref('')
const projectOpen = ref(false)
const choiceError = ref('')
const linkedReplacement = computed(() => !!props.replacementOf || !!props.invoice?.supersedes_invoice_id)
const billingCycleOptions = [{ value: 'monthly', label: 'Bulanan' }, { value: 'one_time', label: 'Sekali' }]
const filteredProjects = computed(() => {
  const query = projectQuery.value.trim().toLocaleLowerCase('id-ID')
  return props.projects.filter((project) => !query || `${project.code} ${project.name} ${project.customer.name}`.toLocaleLowerCase('id-ID').includes(query)).slice(0, 10)
})

watch(() => [props.invoice, props.replacementOf] as const, ([invoice, previous]) => {
  form.value = invoice
    ? { project_id: invoice.project_id, billing_cycle: invoice.billing_cycle, billing_period: invoice.billing_period, supersedes_invoice_id: invoice.supersedes_invoice_id, amount: invoice.amount, issued_at: invoice.issued_at, due_at: invoice.due_at, notes: invoice.notes }
    : { project_id: previous?.project_id ?? 0, billing_cycle: previous?.billing_cycle ?? 'monthly', billing_period: previous?.billing_period ?? localMonth(), supersedes_invoice_id: previous?.id ?? null, amount: '', issued_at: localToday(), due_at: null, notes: null }
  projectQuery.value = invoice ? `${invoice.project.code} — ${invoice.project.name}` : previous ? `${previous.project.code} — ${previous.project.name}` : ''
  projectOpen.value = false
  choiceError.value = ''
}, { immediate: true })

function chooseProject(project: Project) {
  form.value.project_id = project.id
  projectQuery.value = `${project.code} — ${project.name}`
  projectOpen.value = false
  choiceError.value = ''
}
function changeBillingCycle(cycle: 'monthly' | 'one_time') {
  form.value.billing_cycle = cycle
  form.value.billing_period = cycle === 'monthly' ? localMonth() : null
}
function submit() {
  if (!props.invoice && !form.value.project_id) { choiceError.value = 'Pilih project dari hasil pencarian.'; return }
  const payload = { amount: form.value.amount, issued_at: form.value.issued_at, due_at: form.value.due_at || null, notes: form.value.notes?.trim() || null }
  if (props.invoice) emit('submit', { billing_cycle: form.value.billing_cycle, billing_period: form.value.billing_period, ...payload })
  else emit('submit', { project_id: form.value.project_id, billing_cycle: form.value.billing_cycle, billing_period: form.value.billing_period, supersedes_invoice_id: form.value.supersedes_invoice_id, ...payload })
}
</script>

<template>
  <form class="invoice-form" @submit.prevent="submit">
    <div v-if="props.error || choiceError" class="form-error" role="alert">{{ choiceError || props.error }}</div>
    <div class="form-grid">
      <FormField v-if="!props.invoice && !props.replacementOf" id="invoice-project" label="Project" required full><div class="combobox"><FormInput id="invoice-project" :model-value="projectQuery" required role="combobox" aria-autocomplete="list" aria-controls="invoice-project-options" :aria-expanded="projectOpen" autocomplete="off" placeholder="Ketik kode atau nama project" @update:model-value="projectQuery = $event; form.project_id = 0; projectOpen = true; choiceError = ''" @focus="projectOpen = true" @keydown.enter.prevent="filteredProjects[0] && chooseProject(filteredProjects[0])" @keydown.esc="projectOpen = false" /><div v-if="projectOpen" id="invoice-project-options" class="choice-options" role="listbox"><button v-for="project in filteredProjects" :key="project.id" type="button" role="option" @mousedown.prevent="chooseProject(project)">{{ project.code }} — {{ project.name }} · {{ project.customer.name }}</button><span v-if="!filteredProjects.length" class="no-options">Tidak ada project yang dapat dipilih</span></div></div></FormField>
      <div v-else class="project-summary full"><span>Project</span><strong>{{ (props.invoice || props.replacementOf)!.project.code }} — {{ (props.invoice || props.replacementOf)!.project.name }}</strong><small>{{ (props.invoice || props.replacementOf)!.project.customer.name }}</small><small v-if="props.replacementOf">Invoice pengganti untuk {{ props.replacementOf.code }}</small></div>
      <FormField id="invoice-cycle" label="Jenis tagihan" required><FormSelect id="invoice-cycle" :model-value="form.billing_cycle" :options="billingCycleOptions" :disabled="linkedReplacement" @update:model-value="changeBillingCycle($event as 'monthly' | 'one_time')" /></FormField>
      <FormField v-if="form.billing_cycle === 'monthly'" id="invoice-period" label="Periode tagihan" required><FormDateInput id="invoice-period" v-model="form.billing_period" type="month" required :readonly="linkedReplacement" /></FormField>
      <FormField id="invoice-amount" label="Total tagihan (Rp)" required><FormInput id="invoice-amount" v-model="form.amount" type="number" min="0.01" step="0.01" inputmode="decimal" required placeholder="Contoh: 15000000" /></FormField>
      <FormField id="invoice-issued" label="Tanggal invoice" required><FormDateInput id="invoice-issued" v-model="form.issued_at" type="date" required /></FormField>
      <FormField id="invoice-due" label="Jatuh tempo"><FormDateInput id="invoice-due" v-model="form.due_at" type="date" :min="form.issued_at" /></FormField>
      <FormField id="invoice-notes" label="Catatan" full><FormTextarea id="invoice-notes" v-model="form.notes" maxlength="2000" rows="3" placeholder="Keterangan pekerjaan atau ketentuan pembayaran" /></FormField>
    </div>
    <p class="form-hint">Invoice disimpan sebagai draft. Setelah diterbitkan, nominal dan detailnya terkunci.</p>
    <div class="form-actions"><button type="submit" :disabled="props.submitting">{{ props.submitting ? 'Menyimpan...' : 'Simpan draft' }}</button></div>
  </form>
</template>

<style scoped>
.invoice-form{padding:21px 24px}.form-error{margin-bottom:14px;padding:10px 12px;border:1px solid #a7463c55;border-radius:8px;background:#a7463c18;color:#ffb4a8;font-size:11px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.combobox{position:relative;min-width:0}.choice-options{position:absolute;z-index:8;top:calc(100% + 5px);left:0;right:0;width:100%;max-width:calc(100vw - 32px);max-height:min(210px,32dvh);box-sizing:border-box;overflow:auto;overscroll-behavior:contain;padding:4px;border:1px solid #393d38;border-radius:8px;background:#1c1f1c;box-shadow:0 10px 25px #0008}.choice-options button{width:100%;display:block;padding:9px 10px;border:0;border-radius:5px;background:transparent;color:#e5e9e0;text-align:left;font:400 11px 'DM Sans',sans-serif;cursor:pointer}.choice-options button:hover{background:#8bd74f1a}.no-options{display:block;padding:9px 10px;color:#989f94;font-size:11px}.project-summary{display:grid;gap:5px;padding:12px;border:1px solid #ffffff12;border-radius:8px;background:#151715}.project-summary span,.project-summary small,.form-hint{color:#969d91;font-size:10px}.project-summary strong{font-size:12px}.form-hint{margin:15px 0 0;line-height:1.5}.form-actions{display:flex;justify-content:flex-end;margin-top:18px;padding-top:15px;border-top:1px solid #ffffff12}.form-actions button{height:38px;padding:0 15px;border:0;border-radius:8px;background:#ffd64c;color:#263215;font-size:11px;font-weight:700;cursor:pointer}.form-actions button:disabled{opacity:.55;cursor:wait}@media(max-width:520px){.invoice-form{padding:17px}.form-grid{grid-template-columns:1fr}.project-summary.full{grid-column:auto}}
@media(max-width:520px){.invoice-form{padding-bottom:calc(20px + env(safe-area-inset-bottom))}.form-actions{position:sticky;bottom:0;z-index:2;margin:0 -17px;padding:12px 17px calc(8px + env(safe-area-inset-bottom));background:#20221f}}
</style>
