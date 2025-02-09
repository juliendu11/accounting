<template>
  <Head :title="t('stats_page.title')" />

  <q-page padding>
    <div class="row q-col-gutter-md items-stretch">
      <div class="col-12">
        <div class="row items-center">
          <div class="col-2">
            <BaseSelect
              v-model="yearSelected"
              :label="t('stats_page.section.filters.date.title')"
              :options="yearOptions"
            />
          </div>
          <div>
            <q-toggle
              v-model="filters.includeTaxes"
              :label="t('home_page.section.treasury.actions.including_taxes_toggle')"
            />
          </div>
        </div>
      </div>
      <div class="col-12">
        <q-card class="full-height" flat bordered>
          <q-card-section>
            <div class="text-overline">
              {{ t('stats_page.section.charts.overview.title') }}
            </div>
          </q-card-section>
          <OverviewStatsWidget :include-taxes="filters.includeTaxes" :year="filters.year" />
        </q-card>
      </div>
      <div class="col-12 col-md-6">
        <q-card class="full-height" flat bordered>
          <q-card-section>
            <div class="text-overline">{{ t('stats_page.section.charts.treasury.title') }}</div>
          </q-card-section>
          <TreasuryStatsWidget :include-taxes="filters.includeTaxes" :year="filters.year" />
        </q-card>
      </div>
      <div class="col-12 col-md-6">
        <q-card class="full-height" flat bordered>
          <q-card-section>
            <div class="text-overline">{{ t('stats_page.section.charts.turnover.title') }}</div>
          </q-card-section>
          <TurnoverStatsWidget :include-taxes="filters.includeTaxes" :year="filters.year" />
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card class="full-height" flat bordered>
          <q-card-section>
            <div class="text-overline">
              {{ t('stats_page.section.charts.expenses_sharing_categories.title') }}
            </div>
          </q-card-section>
          <ExpensesCategoriesStatsWidget
            :include-taxes="filters.includeTaxes"
            :year="filters.year"
          />
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card class="full-height" flat bordered>
          <q-card-section>
            <div class="text-overline">
              {{ t('stats_page.section.charts.expenses_sharing_referents.title') }}
            </div>
          </q-card-section>
          <ExpensesReferentsStatsWidget
            :include-taxes="filters.includeTaxes"
            :year="filters.year"
          />
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="full-height" flat bordered>
          <q-card-section>
            <div class="text-overline">
              {{ t('stats_page.section.charts.recipes_sharing_categories.title') }}
            </div>
          </q-card-section>
          <RecipesCategoriesStatsWidget
            :include-taxes="filters.includeTaxes"
            :year="filters.year"
          />
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="full-height" flat bordered>
          <q-card-section>
            <div class="text-overline">
              {{ t('stats_page.section.charts.recipes_sharing_referents.title') }}
            </div>
          </q-card-section>
          <RecipesReferentsStatsWidget :include-taxes="filters.includeTaxes" :year="filters.year" />
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="full-height" flat bordered>
          <q-card-section>
            <div class="text-overline">
              {{ t('stats_page.section.charts.recipes_expenses_ratio.title') }}
            </div>
          </q-card-section>
          <RecipesExpensesRatioStatsWidget
            :include-taxes="filters.includeTaxes"
            :year="filters.year"
          />
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { Head, router } from '@inertiajs/vue3'
import { useI18n } from 'vue-i18n'
import { computed, reactive, watch, onMounted } from 'vue'

import OverviewStatsWidget from '~/components/widgets/overview-stats-widget.vue'
import TreasuryStatsWidget from '~/components/widgets/treasury-stats-widget.vue'
import TurnoverStatsWidget from '~/components/widgets/turnover-stats-widget.vue'
import ExpensesCategoriesStatsWidget from '~/components/widgets/expenses-categories-stats-widget.vue'
import ExpensesReferentsStatsWidget from '~/components/widgets/expenses-referents-stats-widget.vue'
import RecipesCategoriesStatsWidget from '~/components/widgets/recipes-categories-stats-widget.vue'
import RecipesReferentsStatsWidget from '~/components/widgets/recipes-referents-stats-widget.vue'
import RecipesExpensesRatioStatsWidget from '~/components/widgets/recipes-expenses-ratio-stats-widget.vue'
import BaseSelect from '~/components/base-select.vue'

const { t } = useI18n()

const props = defineProps<{
  availableYears: number[]
}>()

const urlParams = new URLSearchParams(window.location.search)
const dateFromUrl = urlParams.get('date.year')
const taxesFromUrl = urlParams.get('taxes.include')

const filters = reactive({
  year: dateFromUrl ? parseInt(dateFromUrl) : new Date().getFullYear(),
  includeTaxes: taxesFromUrl ? taxesFromUrl === 'true' : true,
})

const yearSelected = computed({
  get() {
    return {
      value: filters.year,
      label: filters.year,
    }
  },
  set(value: { value: number; label: string }) {
    filters.year = value.value
  },
})

const yearOptions = computed(() => {
  return props.availableYears.map((year) => ({
    value: year,
    label: year,
  }))
})

watch(
  filters,
  () => {
    router.get(
      '/stats',
      {
        'date.year': filters.year,
        'taxes.include': filters.includeTaxes,
      },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      }
    )
  },
  { deep: true }
)

onMounted(() => {
  if (!dateFromUrl || !taxesFromUrl) {
    router.get(
      '/stats',
      {
        'date.year': filters.year,
        'taxes.include': filters.includeTaxes,
      },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      }
    )
  }
})
</script>
