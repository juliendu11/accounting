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
    :series="state.recipesByReferent"
  ></apexchart>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useWidgetAPI } from '~/composables/useWidgetAPI'
import { cssVariable } from '~/helpers/document'
import { useTheme } from '~/composables/useTheme'
import { useI18n } from 'vue-i18n'

type State = {
  recipesByReferent: number[]
  referents: string[]
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
  widgetPath: 'recipesByReferent',
  baseValues: {
    recipesByReferent: [],
    referents: [],
  },
})

const chartOptions = computed(() => ({
  chart: {
    width: 380,
    type: 'pie',
    background: 'transparent',
  },
  colors: [
    cssVariable('--q-negative'),
    cssVariable('--q-primary'),
    cssVariable('--q-secondary'),
    cssVariable('--q-info'),
    cssVariable('--q-accent'),
    cssVariable('--q-warning'),
    cssVariable('--q-positive'),
  ],
  theme: {
    mode: isDark.value ? 'dark' : 'light',
  },
  labels: state.value.referents,
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
