<template>
  <q-card bordered flat class="categories-chart">
    <q-card-section>
      <div class="row no-wrap q-gutter-x-xs q-mb-sm">
        <span
          v-for="(category, idx) in categories"
          :key="idx"
          class="category-chart-item"
          :style="{
            width: `${getSeriesInPercent[idx]}%`,
            backgroundColor: `var(--${pickColor(idx)})`,
          }"
        >
          <q-tooltip class="bg-black">
            <div>{{ category }}</div>
            <div class="category-chart-legend">
              <span :style="{ backgroundColor: `var(--${pickColor(idx)})` }"></span>
              <div class="text-caption">{{ series[idx] }}</div>
            </div>
          </q-tooltip>
        </span>
      </div>
      <div class="row no-wrap q-gutter-x-xs">
        <div v-for="(category, idx) in categories" :key="idx" class="category-chart-legend">
          <span :style="{ backgroundColor: `var(--${pickColor(idx)})` }"></span>
          <div class="text-caption">{{ category }}</div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const AVAILABLE_COLORS = [
  'q-primary',
  'q-secondary',
  'q-accent',
  'q-positive',
  'q-negative',
  'q-info',
  'q-warning',
]

const pickColor = (index: number) => AVAILABLE_COLORS[index % AVAILABLE_COLORS.length]

const props = defineProps<{
  series: number[]
  categories: string[]
}>()

const getSeriesInPercent = computed(() => {
  const total = props.series.reduce((acc, val) => acc + val, 0)
  return props.series.map((val) => (val / total) * 100)
})
</script>

<style lang="scss" scoped>
.categories-chart {
  .category-chart-item {
    display: block;
    height: 8px;
    width: 30%;
    border-radius: 4px;
  }

  .category-chart-legend {
    display: flex;
    align-items: center;
    gap: 4px;

    span {
      display: block;
      height: 8px;
      aspect-ratio: 1;
      border-radius: 50%;
    }
  }
}
</style>
