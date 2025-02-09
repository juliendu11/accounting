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
    type="pie"
    width="380"
    :options="chartOptions"
    :series="state.data"
  ></apexchart>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useWidgetAPI } from '~/composables/useWidgetAPI'
import { cssVariable } from '~/helpers/document'
import { useTheme } from '~/composables/useTheme'
import { useI18n } from 'vue-i18n'

type State = {
  data: number[]
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
  widgetPath: 'recipesExpensesRatio',
  baseValues: {
    data: [],
    categories: [],
  },
})

const chartOptions = computed(() => ({
  chart: {
    width: 380,
    type: 'pie',
    background: 'transparent',
  },
  colors: [cssVariable('--q-secondary'), cssVariable('--q-info')],
  theme: {
    mode: isDark.value ? 'dark' : 'light',
  },
  labels: state.value.categories,
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 200,
        },
        legend: {
          position: 'bottom',
        },
      },
    },
  ],
}))
</script>
