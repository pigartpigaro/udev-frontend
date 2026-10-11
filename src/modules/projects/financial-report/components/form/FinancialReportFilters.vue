<script setup lang="ts">
import FormDateInput from '../../../../../shared/components/form/FormDateInput.vue'
import FormField from '../../../../../shared/components/form/FormField.vue'
import FormSelect from '../../../../../shared/components/form/FormSelect.vue'
import type { FinancialReportFilters } from '../../types/financialReport'

defineProps<{ filters: FinancialReportFilters; projectOptions: Array<{ value: string; label: string }> }>()
const emit = defineEmits<{ 'update:dateFrom': [value: string]; 'update:dateTo': [value: string]; 'update:projectId': [value: string] }>()
</script>

<template>
  <section class="report-filters" aria-label="Filter laporan keuangan">
    <FormField id="report-date-from" label="Dari tanggal"><FormDateInput id="report-date-from" :model-value="filters.dateFrom" type="date" @update:model-value="emit('update:dateFrom', $event)" /></FormField>
    <FormField id="report-date-to" label="Sampai tanggal"><FormDateInput id="report-date-to" :model-value="filters.dateTo" type="date" @update:model-value="emit('update:dateTo', $event)" /></FormField>
    <FormField id="report-project" label="Project"><FormSelect id="report-project" :model-value="filters.projectId" :options="projectOptions" @update:model-value="emit('update:projectId', $event)" /></FormField>
  </section>
</template>

<style scoped>
.report-filters{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px;margin-bottom:17px;padding:15px;border:1px solid #ffffff12;border-radius:10px;background:#191b19}.report-filters :deep(.field){color:#bfc5ba}@media(max-width:600px){.report-filters{grid-template-columns:1fr 1fr;padding:12px;gap:11px}.report-filters :deep(.field:last-child){grid-column:1/-1}}@media(max-width:360px){.report-filters{grid-template-columns:1fr}.report-filters :deep(.field:last-child){grid-column:auto}}
</style>
