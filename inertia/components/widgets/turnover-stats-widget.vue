<template>
  <div v-if="isLoading" class="flex column flex-center justify-center">
    <q-spinner size="lg" />
    <p class="q-mt-lg">{{ t('label.loading') }}</p>
  </div>
  <div v-else-if="isError" class="q-mx-lg q-my-lg">
    <q-banner inline-actions class="text-white bg-red">
      {{ error?.message ?? error }}
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
import { computed } from 'vue'
import { useWidgetAPI } from '~/composables/useWidgetAPI'
import { cssVariable } from '~/helpers/document'
import { useTheme } from '~/composables/useTheme'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'

type State = {
  turnoverByMonth: number[]
  categories: string[]
}

const { isDark } = useTheme()
const { t } = useI18n()

const props = defineProps<{
  year: number
  includeTaxes: boolean
}>()

const { state, isError, error, isLoading, hasData } = useWidgetAPI<State>({
  urlQueries: computed(() => ({
    year: props.year,
    includeTaxes: props.includeTaxes,
  })),
  widgetPath: 'turnover',
  baseValues: {
    turnoverByMonth: [],
    categories: [],
  },
})

const series = computed(() => [
  {
    name: t('dictionary.turnover'),
    data: state.value.turnoverByMonth,
  },
])

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    height: 350,
    background: 'transparent',
    zoom: {
      enabled: false,
    },
    toolbar: {
      show: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth',
  },
  theme: {
    mode: isDark.value ? 'dark' : 'light',
  },
  colors: [cssVariable('--q-primary')],
  labels: state.value.categories,
  xaxis: {
    type: 'date',
    labels: {
      formatter: (val: unknown) => {
        if (typeof val !== 'string') return String(val)

        const match = val.match(/^\d{4}-\d{2}$/)
        if (!match) return val

        const d = dayjs(`${val}-01`)
        return d.isValid() ? d.format('MMMM') : val
      },
    },
  },
  yaxis: {
    opposite: false,
  },
  legend: {
    horizontalAlign: 'left',
  },
}))
</script>
