<template>
  <q-card-section
    v-if="showDateSelector || showTypeSelector || showTaxesSwitch"
    class="row q-col-gutter-sm items-center"
  >
    <div v-if="showTypeSelector" class="col-12 col-sm-3">
      <q-select
        v-model="transactionType"
        :options="transactionTypeOptions"
        :label="t('dictionary.transaction_type')"
        dense
        outlined
        emit-value
        map-options
      />
    </div>
    <div v-if="showDateSelector" class="col-12 col-sm-3">
      <q-input v-model="dateFrom" :label="t('label.date_from')" dense outlined readonly>
        <template #append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="dateFrom" :mask="DATE_MASK">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup :label="t('label.close')" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
    <div v-if="showDateSelector" class="col-12 col-sm-3">
      <q-input v-model="dateTo" :label="t('label.date_to')" dense outlined readonly>
        <template #append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="dateTo" :mask="DATE_MASK">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup :label="t('label.close')" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
    <div v-if="showTaxesSwitch" class="col-12 col-sm-3">
      <q-toggle
        v-model="includeTaxes"
        :label="t('home_page.section.treasury.actions.including_taxes_toggle')"
      />
    </div>
  </q-card-section>

  <div v-if="isLoading" class="flex column flex-center justify-center">
    <q-spinner size="lg" />
    <p class="q-mt-lg">{{ t('label.loading') }}</p>
  </div>
  <div v-else-if="isError" class="q-mx-lg q-my-lg">
    <q-banner inline-actions class="text-white bg-red">
      {{ errorMsg }}
    </q-banner>
  </div>
  <apexchart
    v-else-if="hasData"
    type="area"
    height="350"
    :options="chartOptions"
    :series="series"
  ></apexchart>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useTheme } from '~/composables/useTheme'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'

const DATE_MASK = 'YYYY/MM/DD'

type SeriesItem = { name: string; data: number[] }
type State = { months: string[]; series: SeriesItem[] }

const { isDark } = useTheme()
const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    dateFrom?: string
    dateTo?: string
    includeTaxes?: boolean
    showTypeSelector?: boolean
    showDateSelector?: boolean
    showTaxesSwitch?: boolean
  }>(),
  {
    showTypeSelector: true,
    showDateSelector: true,
    showTaxesSwitch: true,
  }
)

const transactionTypeOptions = [
  { label: t('dictionary.expense'), value: 'EXPENSE' },
  { label: t('dictionary.recipe'), value: 'RECIPE' },
  { label: t('dictionary.salary'), value: 'SALARY' },
]

const now = dayjs()
const transactionType = ref('EXPENSE')
const dateFrom = ref(props.dateFrom || now.add(-2, 'years').format(DATE_MASK))
const dateTo = ref(props.dateTo || now.format(DATE_MASK))

watch(
  () => props.dateFrom,
  (val) => {
    if (val) dateFrom.value = val
  }
)
watch(
  () => props.dateTo,
  (val) => {
    if (val) dateTo.value = val
  }
)
const includeTaxes = ref(props.includeTaxes ?? true)
watch(() => props.includeTaxes, (val) => { if (val !== undefined) includeTaxes.value = val })

const state = ref<State>({ months: [], series: [] })
const isLoading = ref(false)
const isError = ref(false)
const errorMsg = ref('')
const hasData = ref(false)

const fetchData = async () => {
  try {
    isLoading.value = true
    isError.value = false
    hasData.value = false

    const params = new URLSearchParams({
      'date.from': dateFrom.value,
      'date.to': dateTo.value,
      'taxes.include': String(includeTaxes.value),
      'type': transactionType.value,
    })

    const data: State = await fetch(`/stats/widget/allCategoriesEvolution?${params}`).then((res) =>
      res.json()
    )

    state.value = data
    hasData.value = true
  } catch (err: any) {
    isError.value = true
    errorMsg.value = err?.message ?? String(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)

watch([transactionType, dateFrom, dateTo, includeTaxes], fetchData)

const series = computed(() => state.value.series)

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    height: 350,
    background: 'transparent',
    toolbar: { show: false },
    zoom: { enabled: false },
    stacked: false,
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth' },
  theme: {
    mode: isDark.value ? 'dark' : 'light',
  },
  xaxis: {
    categories: state.value.months,
    labels: {
      formatter: (val: unknown) => {
        if (typeof val !== 'string') return String(val)
        const match = val.match(/^\d{4}-\d{2}$/)
        if (!match) return val
        const d = dayjs(`${val}-01`)
        return d.isValid() ? d.format('MMM YYYY') : val
      },
    },
  },
  yaxis: {
    labels: {
      formatter: (val: number) => val.toFixed(2),
    },
  },
  legend: { horizontalAlign: 'left' },
  tooltip: {
    y: {
      formatter: (val: number) => `${val.toFixed(2)} €`,
    },
  },
}))
</script>
