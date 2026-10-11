<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import FormDateInput from '../../../../../shared/components/form/FormDateInput.vue'
import FormField from '../../../../../shared/components/form/FormField.vue'
import FormInput from '../../../../../shared/components/form/FormInput.vue'
import FormSelect from '../../../../../shared/components/form/FormSelect.vue'
import FormTextarea from '../../../../../shared/components/form/FormTextarea.vue'
import type { Customer } from '../../../../master/customers/types/customer'
import type { ProjectType } from '../../../../master/project-types/types/projectType'
import { projectStatuses, projectStatusLabels, type Project, type ProjectPayload } from '../../types/project'

const props = defineProps<{
  project: Project | null
  customers: Customer[]
  projectTypes: ProjectType[]
  submitting: boolean
  error: string
}>()
const emit = defineEmits<{ submit: [payload: ProjectPayload] }>()
const customerQuery = ref('')
const projectTypeQuery = ref('')
const customerOpen = ref(false)
const projectTypeOpen = ref(false)
const customerOpensAbove = ref(false)
const projectTypeOpensAbove = ref(false)
const choiceError = ref('')
const form = ref<ProjectPayload>({
  name: '', customer_id: 0, project_type_id: 0, start_date: null,
  target_end_date: null, status: 'draft', description: null, application_url: null,
})
const statusOptions = projectStatuses.map((status) => ({ value: status, label: projectStatusLabels[status] }))

const filteredCustomers = computed(() => {
  const query = customerQuery.value.trim().toLocaleLowerCase('id-ID')
  return props.customers.filter((customer) => !query || `${customer.code} ${customer.name}`.toLocaleLowerCase('id-ID').includes(query)).slice(0, 10)
})
const filteredProjectTypes = computed(() => {
  const query = projectTypeQuery.value.trim().toLocaleLowerCase('id-ID')
  return props.projectTypes.filter((type) => !query || `${type.code} ${type.name}`.toLocaleLowerCase('id-ID').includes(query)).slice(0, 10)
})

function customerLabel(customer: Pick<Customer, 'code' | 'name'>) {
  return `${customer.code} — ${customer.name}`
}
function projectTypeLabel(type: Pick<ProjectType, 'code' | 'name'>) {
  return `${type.code} — ${type.name}`
}
function selectCustomer(customer: Customer) {
  form.value.customer_id = customer.id
  customerQuery.value = customerLabel(customer)
  customerOpen.value = false
  choiceError.value = ''
}
function selectProjectType(type: ProjectType) {
  form.value.project_type_id = type.id
  projectTypeQuery.value = projectTypeLabel(type)
  projectTypeOpen.value = false
  choiceError.value = ''
}
function onCustomerInput(value: string) {
  customerQuery.value = value
  form.value.customer_id = 0
  openChoice('customer')
  choiceError.value = ''
}
function onProjectTypeInput(value: string) {
  projectTypeQuery.value = value
  form.value.project_type_id = 0
  openChoice('type')
  choiceError.value = ''
}
function openChoice(kind: 'customer' | 'type') {
  const input = document.getElementById(kind === 'customer' ? 'project-customer' : 'project-type')
  const roomBelow = input ? window.innerHeight - input.getBoundingClientRect().bottom : 0
  const opensAbove = roomBelow < 220 && (input?.getBoundingClientRect().top ?? 0) > roomBelow
  if (kind === 'customer') { customerOpensAbove.value = opensAbove; customerOpen.value = true }
  else { projectTypeOpensAbove.value = opensAbove; projectTypeOpen.value = true }
}
function onChoiceKeydown(event: KeyboardEvent, kind: 'customer' | 'type') {
  if (event.key === 'Escape') {
    if (kind === 'customer') customerOpen.value = false
    else projectTypeOpen.value = false
  } else if (event.key === 'Enter' && kind === 'customer' && filteredCustomers.value.length) {
    event.preventDefault()
    selectCustomer(filteredCustomers.value[0]!)
  } else if (event.key === 'Enter' && kind === 'type' && filteredProjectTypes.value.length) {
    event.preventDefault()
    selectProjectType(filteredProjectTypes.value[0]!)
  }
}

watch(() => props.project, (project) => {
  form.value = project ? {
    name: project.name,
    customer_id: project.customer_id,
    project_type_id: project.project_type_id,
    start_date: project.start_date,
    target_end_date: project.target_end_date,
    status: project.status,
    description: project.description,
    application_url: project.application_url,
  } : {
    name: '', customer_id: 0, project_type_id: 0, start_date: null,
    target_end_date: null, status: 'draft', description: null, application_url: null,
  }
  customerQuery.value = project ? customerLabel(project.customer) : ''
  projectTypeQuery.value = project ? projectTypeLabel(project.project_type) : ''
  customerOpen.value = false
  projectTypeOpen.value = false
  choiceError.value = ''
}, { immediate: true })

function submit() {
  if (!form.value.customer_id || !form.value.project_type_id) {
    choiceError.value = 'Pilih pelanggan dan jenis project dari hasil pencarian.'
    return
  }
  emit('submit', {
    ...form.value,
    name: form.value.name.trim(),
    description: form.value.description?.trim() || null,
    application_url: form.value.application_url?.trim() || null,
    start_date: form.value.start_date || null,
    target_end_date: form.value.target_end_date || null,
  })
}
</script>

<template>
  <form class="project-form" @submit.prevent="submit">
    <div v-if="props.error" class="form-error" role="alert">{{ props.error }}</div>
    <div v-if="choiceError" class="form-error" role="alert">{{ choiceError }}</div>
    <div class="form-grid">
      <FormField id="project-name" label="Nama project" required full><FormInput id="project-name" v-model="form.name" maxlength="255" required autofocus placeholder="Contoh: Sistem Informasi Klinik" /></FormField>
      <FormField id="project-customer" label="Pelanggan" required><div class="combobox"><FormInput id="project-customer" :model-value="customerQuery" role="combobox" aria-autocomplete="list" aria-controls="project-customer-options" :aria-expanded="customerOpen" autocomplete="off" placeholder="Ketik kode atau nama pelanggan" required @update:model-value="onCustomerInput" @focus="openChoice('customer')" @keydown="onChoiceKeydown($event, 'customer')" /><div v-if="customerOpen" id="project-customer-options" class="choice-options" :class="{ 'opens-above': customerOpensAbove }" role="listbox"><button v-for="customer in filteredCustomers" :key="customer.id" type="button" role="option" :aria-selected="form.customer_id === customer.id" @mousedown.prevent="selectCustomer(customer)">{{ customerLabel(customer) }}</button><span v-if="!filteredCustomers.length" class="no-options">Pelanggan tidak ditemukan</span></div></div></FormField>
      <FormField id="project-type" label="Jenis project" required><div class="combobox"><FormInput id="project-type" :model-value="projectTypeQuery" role="combobox" aria-autocomplete="list" aria-controls="project-type-options" :aria-expanded="projectTypeOpen" autocomplete="off" placeholder="Ketik kode atau jenis project" required @update:model-value="onProjectTypeInput" @focus="openChoice('type')" @keydown="onChoiceKeydown($event, 'type')" /><div v-if="projectTypeOpen" id="project-type-options" class="choice-options" :class="{ 'opens-above': projectTypeOpensAbove }" role="listbox"><button v-for="type in filteredProjectTypes" :key="type.id" type="button" role="option" :aria-selected="form.project_type_id === type.id" @mousedown.prevent="selectProjectType(type)">{{ projectTypeLabel(type) }}</button><span v-if="!filteredProjectTypes.length" class="no-options">Jenis project tidak ditemukan</span></div></div></FormField>
      <FormField id="project-start" label="Tanggal mulai"><FormDateInput id="project-start" v-model="form.start_date" /></FormField>
      <FormField id="project-target" label="Target selesai"><FormDateInput id="project-target" v-model="form.target_end_date" :min="form.start_date || undefined" /></FormField>
      <FormField id="project-status" label="Status"><FormSelect id="project-status" :model-value="form.status" :options="statusOptions" @update:model-value="form.status = $event as ProjectPayload['status']" /></FormField>
      <FormField id="project-application-url" label="Tautan aplikasi"><FormInput id="project-application-url" v-model="form.application_url" type="url" maxlength="2048" placeholder="https://aplikasi-contoh.com" autocomplete="url" /></FormField>
      <FormField id="project-description" label="Deskripsi" full><FormTextarea id="project-description" v-model="form.description" rows="3" maxlength="2000" placeholder="Catatan singkat tentang project" /></FormField>
    </div>
    <div v-if="!props.customers.length || !props.projectTypes.length" class="choice-warning">Pastikan ada pelanggan dan jenis project aktif sebelum membuat project.</div>
    <div class="form-actions"><button type="submit" :disabled="props.submitting || !props.customers.length || !props.projectTypes.length">{{ props.submitting ? 'Menyimpan...' : 'Simpan project' }}</button></div>
  </form>
</template>

<style scoped>
.project-form{padding:21px 24px}.form-error,.choice-warning{margin-bottom:14px;padding:10px 12px;border:1px solid #a7463c55;border-radius:8px;background:#a7463c18;color:#ffb4a8;font-size:11px}.choice-warning{margin:15px 0 0;border-color:#d39c3c55;background:#d39c3c12;color:#f1ca7e}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.combobox{position:relative;min-width:0}.choice-options{position:absolute;z-index:8;top:calc(100% + 5px);left:0;right:0;width:100%;max-width:calc(100vw - 32px);max-height:min(210px,32dvh);box-sizing:border-box;overflow-y:auto;overscroll-behavior:contain;padding:4px;border:1px solid #393d38;border-radius:8px;background:#1c1f1c;box-shadow:0 10px 25px #0008}.choice-options.opens-above{top:auto;bottom:calc(100% + 5px)}.choice-options button{width:100%;display:block;padding:9px 10px;border:0;border-radius:5px;background:transparent;color:#e5e9e0;text-align:left;font:400 11px 'DM Sans',sans-serif;cursor:pointer;overflow-wrap:anywhere}.choice-options button:hover,.choice-options button[aria-selected="true"]{background:#8bd74f1a;color:#d7efa9}.no-options{display:block;padding:9px 10px;color:#989f94;font-size:11px}.form-actions{display:flex;justify-content:flex-end;margin-top:20px;padding-top:15px;border-top:1px solid #ffffff12}.form-actions button{height:38px;padding:0 15px;border:0;border-radius:8px;background:#ffd64c;color:#263215;font-size:11px;font-weight:700;cursor:pointer}.form-actions button:disabled{opacity:.55;cursor:wait}
@media(max-width:520px){.project-form{padding:17px}.form-grid{grid-template-columns:1fr}.field.full{grid-column:auto}}
@media(max-width:520px){.project-form{padding-bottom:calc(20px + env(safe-area-inset-bottom))}.form-actions{position:sticky;bottom:0;z-index:2;margin:0 -17px;padding:12px 17px calc(8px + env(safe-area-inset-bottom));background:#20221f}}
</style>
