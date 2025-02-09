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
    type="line"
    height="350"
    :options="chartOptions"
    :series="series"
  ></apexchart>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useWidgetAPI } from '~/composables/useWidgetAPI'
import { cssVariable } from '~/helpers/document'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'
import { useTheme } from '~/composables/useTheme'

type State = {
  expensesByMonth: number[]
  recipesByMonth: number[]
  salariesByMonth: number[]
  treasuryByMonth: number[]
  categories: string[]
}

const { t } = useI18n()
const { isDark } = useTheme()

const props = defineProps<{
  year: number
  includeTaxes: boolean
}>()

const { state, isError, error, isLoading, hasData } = useWidgetAPI<State>({
  urlQueries: computed(() => ({
    year: props.year,
    includeTaxes: props.includeTaxes,
  })),
  widgetPath: 'overview',
  baseValues: {
    expensesByMonth: [],
    recipesByMonth: [],
    salariesByMonth: [],
    treasuryByMonth: [],
    categories: [],
  },
})

const series = computed(() => [
  {
    name: t('dictionary.expenses'),
    type: 'column',
    data: state.value.expensesByMonth,
  },
  {
    name: t('dictionary.recipes'),
    type: 'column',
    data: state.value.recipesByMonth,
  },
  {
    name: t('dictionary.salaries'),
    type: 'column',
    data: state.value.salariesByMonth,
  },
  {
    name: t('dictionary.treasury'),
    type: 'line',
    data: state.value.treasuryByMonth,
  },
])

const chartOptions = computed(() => ({
  chart: {
    height: 350,
    type: 'line',
    stacked: false,
    toolbar: {
      show: false,
    },
    background: 'transparent',
    zoom: {
      enabled: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: [1, 1, 1, 4],
  },
  xaxis: {
    categories: state.value.categories,
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
  theme: {
    mode: isDark.value ? 'dark' : 'light',
  },
  colors: [
    cssVariable('--q-negative'),
    cssVariable('--q-primary'),
    cssVariable('--q-secondary'),
    cssVariable('--q-info'),
  ],
  yaxis: [
    {
      seriesName: t('dictionary.expenses'),
      axisTicks: {
        show: true,
      },
      axisBorder: {
        show: true,
        color: cssVariable('--q-negative'),
      },
      labels: {
        style: {
          color: cssVariable('--q-negative'),
        },
      },
      title: {
        text: t('dictionary.expenses'),
        style: {
          color: cssVariable('--q-negative'),
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    {
      seriesName: t('dictionary.recipes'),
      opposite: true,
      axisTicks: {
        show: true,
      },
      axisBorder: {
        show: true,
        color: cssVariable('--q-primary'),
      },
      labels: {
        style: {
          colors: cssVariable('--q-primary'),
        },
      },
      title: {
        text: t('dictionary.recipes'),
        style: {
          color: cssVariable('--q-primary'),
        },
      },
    },
    {
      seriesName: t('dictionary.salaries'),
      opposite: true,
      axisTicks: {
        show: true,
      },
      axisBorder: {
        show: true,
        color: cssVariable('--q-secondary'),
      },
      labels: {
        style: {
          colors: cssVariable('--q-secondary'),
        },
      },
      title: {
        text: t('dictionary.salaries'),
        style: {
          color: cssVariable('--q-secondary'),
        },
      },
    },
    {
      seriesName: t('dictionary.treasury'),
      show: false,
    },
  ],
  tooltip: {
    fixed: {
      enabled: true,
      position: 'topLeft', // topRight, topLeft, bottomRight, bottomLeft
      offsetY: 30,
      offsetX: 60,
    },
  },
  legend: {
    horizontalAlign: 'center',
    offsetX: 40,
  },
}))
</script>
