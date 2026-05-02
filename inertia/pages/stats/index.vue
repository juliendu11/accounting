<template>
  <Head :title="t('stats_page.title')" />

  <q-page padding>
    <div class="row q-col-gutter-y-lg">
      <div class="col-12">
        <q-tabs v-model="tab">
          <q-tab name="treasury" icon="domain" label="Trésorerie" />
          <q-tab name="trend" icon="trending_up" label="Tendance" />
        </q-tabs>
      </div>

      <div class="col-12">
        <Transition mode="out-in">
          <div v-if="tab === 'treasury'">
            <div class="row q-col-gutter-md items-stretch">
              <div class="col-12">
                <div class="row items-center q-gutter-md">
                  <div class="col-12 col-md-2">
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
                    <div class="text-overline">
                      {{ t('stats_page.section.charts.treasury.title') }}
                    </div>
                  </q-card-section>
                  <TreasuryStatsWidget :include-taxes="filters.includeTaxes" :year="filters.year" />
                </q-card>
              </div>
              <div class="col-12 col-md-6">
                <q-card class="full-height" flat bordered>
                  <q-card-section>
                    <div class="text-overline">
                      {{ t('stats_page.section.charts.turnover.title') }}
                    </div>
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
                  <RecipesReferentsStatsWidget
                    :include-taxes="filters.includeTaxes"
                    :year="filters.year"
                  />
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
          </div>

          <div v-else-if="tab === 'trend'">
            <div class="row q-col-gutter-md items-stretch">
              <div class="col-12">
                <div class="row q-col-gutter-sm items-center">
                  <div class="col-12 col-sm-3">
                    <q-input
                      v-model="trendFilters.dateFrom"
                      :label="t('label.date_from')"
                      dense
                      outlined
                      readonly
                    >
                      <template #append>
                        <q-icon name="event" class="cursor-pointer">
                          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-date v-model="trendFilters.dateFrom" :mask="TREND_DATE_MASK">
                              <div class="row items-center justify-end">
                                <q-btn
                                  v-close-popup
                                  :label="t('label.close')"
                                  color="primary"
                                  flat
                                />
                              </div>
                            </q-date>
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-3">
                    <q-input
                      v-model="trendFilters.dateTo"
                      :label="t('label.date_to')"
                      dense
                      outlined
                      readonly
                    >
                      <template #append>
                        <q-icon name="event" class="cursor-pointer">
                          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-date v-model="trendFilters.dateTo" :mask="TREND_DATE_MASK">
                              <div class="row items-center justify-end">
                                <q-btn
                                  v-close-popup
                                  :label="t('label.close')"
                                  color="primary"
                                  flat
                                />
                              </div>
                            </q-date>
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-3">
                    <q-toggle
                      v-model="trendFilters.includeTaxes"
                      :label="t('home_page.section.treasury.actions.including_taxes_toggle')"
                    />
                  </div>
                </div>
              </div>

              <div class="col-12">
                <q-card class="full-height" flat bordered>
                  <q-card-section>
                    <div class="text-overline">
                      {{ t('stats_page.section.charts.all_referents_evolution.title') }}
                    </div>
                  </q-card-section>
                  <AllReferentsEvolutionStatsWidget
                    :date-from="trendFilters.dateFrom"
                    :date-to="trendFilters.dateTo"
                    :include-taxes="trendFilters.includeTaxes"
                    :show-date-selector="false"
                    :show-taxes-switch="false"
                  />
                </q-card>
              </div>

              <div class="col-12">
                <q-card class="full-height" flat bordered>
                  <q-card-section>
                    <div class="text-overline">
                      {{ t('stats_page.section.charts.all_categories_evolution.title') }}
                    </div>
                  </q-card-section>
                  <AllCategoriesEvolutionStatsWidget
                    :date-from="trendFilters.dateFrom"
                    :date-to="trendFilters.dateTo"
                    :include-taxes="trendFilters.includeTaxes"
                    :show-date-selector="false"
                    :show-taxes-switch="false"
                  />
                </q-card>
              </div>

              <div class="col-12">
                <q-card class="full-height" flat bordered>
                  <q-card-section>
                    <div class="text-overline">
                      {{ t('stats_page.section.charts.category_evolution.title') }}
                    </div>
                  </q-card-section>
                  <CategoryEvolutionStatsWidget
                    :categories="props.availableCategories"
                    :date-from="trendFilters.dateFrom"
                    :date-to="trendFilters.dateTo"
                    :include-taxes="trendFilters.includeTaxes"
                    :show-date-selector="false"
                    :show-taxes-switch="false"
                  />
                </q-card>
              </div>

              <div class="col-12">
                <q-card class="full-height" flat bordered>
                  <q-card-section>
                    <div class="text-overline">
                      {{ t('stats_page.section.charts.referent_evolution.title') }}
                    </div>
                  </q-card-section>
                  <ReferentEvolutionStatsWidget
                    :referents="props.availableReferents"
                    :date-from="trendFilters.dateFrom"
                    :date-to="trendFilters.dateTo"
                    :include-taxes="trendFilters.includeTaxes"
                    :show-date-selector="false"
                    :show-taxes-switch="false"
                  />
                </q-card>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { Head, router } from '@inertiajs/vue3'
import { useI18n } from 'vue-i18n'
import { computed, reactive, watch, onMounted, ref } from 'vue'
import dayjs from 'dayjs'

import OverviewStatsWidget from '~/components/widgets/overview-stats-widget.vue'
import TreasuryStatsWidget from '~/components/widgets/treasury-stats-widget.vue'
import TurnoverStatsWidget from '~/components/widgets/turnover-stats-widget.vue'
import ExpensesCategoriesStatsWidget from '~/components/widgets/expenses-categories-stats-widget.vue'
import ExpensesReferentsStatsWidget from '~/components/widgets/expenses-referents-stats-widget.vue'
import RecipesCategoriesStatsWidget from '~/components/widgets/recipes-categories-stats-widget.vue'
import RecipesReferentsStatsWidget from '~/components/widgets/recipes-referents-stats-widget.vue'
import RecipesExpensesRatioStatsWidget from '~/components/widgets/recipes-expenses-ratio-stats-widget.vue'
import CategoryEvolutionStatsWidget from '~/components/widgets/category-evolution-stats-widget.vue'
import AllCategoriesEvolutionStatsWidget from '~/components/widgets/all-categories-evolution-stats-widget.vue'
import ReferentEvolutionStatsWidget from '~/components/widgets/referent-evolution-stats-widget.vue'
import AllReferentsEvolutionStatsWidget from '~/components/widgets/all-referents-evolution-stats-widget.vue'
import BaseSelect from '~/components/base-select.vue'

const { t } = useI18n()

const props = defineProps<{
  availableYears: number[]
  availableCategories: string[]
  availableReferents: string[]
}>()

const TREND_DATE_MASK = 'YYYY/MM/DD'
const now = dayjs()

const urlParams = new URLSearchParams(window.location.search)
const tabFromUrl = urlParams.get('tab')
const dateYearFromUrl = urlParams.get('date.year')
const taxesFromUrl = urlParams.get('taxes.include')
const trendDateFromUrl = urlParams.get('date.from')
const trendDateToUrl = urlParams.get('date.to')
const trendTaxesFromUrl = urlParams.get('trend.taxes.include')

const tab = ref(tabFromUrl || 'treasury')

const filters = reactive({
  year: dateYearFromUrl ? parseInt(dateYearFromUrl) : new Date().getFullYear(),
  includeTaxes: taxesFromUrl ? taxesFromUrl === 'true' : true,
})

const trendFilters = reactive({
  dateFrom: trendDateFromUrl || now.add(-2, 'years').format(TREND_DATE_MASK),
  dateTo: trendDateToUrl || now.format(TREND_DATE_MASK),
  includeTaxes: trendTaxesFromUrl ? trendTaxesFromUrl === 'true' : true,
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

const updateUrl = () => {
  if (tab.value === 'treasury') {
    router.get(
      '/stats',
      { 'tab': tab.value, 'date.year': filters.year, 'taxes.include': filters.includeTaxes },
      { preserveState: true, preserveScroll: true, replace: true }
    )
  } else {
    router.get(
      '/stats',
      {
        'tab': tab.value,
        'date.from': trendFilters.dateFrom,
        'date.to': trendFilters.dateTo,
        'trend.taxes.include': trendFilters.includeTaxes,
      },
      { preserveState: true, preserveScroll: true, replace: true }
    )
  }
}

watch(tab, updateUrl)
watch(filters, updateUrl, { deep: true })
watch(trendFilters, updateUrl, { deep: true })

onMounted(updateUrl)
</script>

<style scoped>
.q-field :deep(.q-field__control)::before {
  border-style: solid !important;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
