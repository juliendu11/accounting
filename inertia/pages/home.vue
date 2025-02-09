<template>
  <Head :title="t('home_page.title')" />
  <q-page padding>
    <div class="row q-col-gutter-md items-stretch">
      <div class="col-12">
        <div class="row">
          <div class="col-12">
            <BaseInput :model-value="getDateSelectedInLiteral" :label="t('label.date')">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-date v-model="selectedDate" range landscape>
                  <div class="row items-center no-wrap justify-end">
                    <q-btn
                      @click="onClearSelectedDates"
                      :label="t('label.clear_selected_dates')"
                      color="primary"
                      no-caps
                      flat
                    />
                    <q-btn v-close-popup :label="t('label.close')" color="primary" no-caps flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </BaseInput>
          </div>
          <div class="col-12">
            <h3>
              {{ t('home_page.section.date.filters.title') }}
              <span>
                <span class="text-primary cursor-pointer">{{ getSelectedYear }}</span>

                <q-menu>
                  <q-list style="min-width: 100px">
                    <q-item
                      v-for="year in availableYears"
                      :key="year"
                      clickable
                      v-close-popup
                      @click="onClickYear(year)"
                    >
                      <q-item-section>{{ year }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </span>
            </h3>
          </div>
          <div class="col-12 q-mb-md">
            <q-tabs mobile-arrows outside-arrows align="left">
              <q-chip
                v-for="(filter, idx) in availableDateQuarterFilters"
                :key="idx"
                clickable
                :class="{ 'bg-primary text-white': filter.selected }"
                @click="onClickFilter(filter)"
              >
                {{ filter.label }}
              </q-chip>
            </q-tabs>
          </div>
          <div class="col-12">
            <q-tabs mobile-arrows outside-arrows align="left">
              <q-chip
                v-for="(filter, idx) in availableDateMonthFilters"
                :key="idx"
                clickable
                :class="{ 'bg-primary text-white': filter.selected }"
                @click="onClickFilter(filter)"
              >
                {{ filter.label }}
              </q-chip>
            </q-tabs>
          </div>
        </div>
      </div>
      <div class="col-12">
        <q-btn
          :label="t('home_page.section.date.actions.generate_report')"
          color="primary"
          @click="onClickGenerateReport"
        />
      </div>
      <div class="col-12">
        <div class="flex items-center q-gutter-x-md">
          <q-icon name="currency_exchange" size="lg" />
          <h2 class="text-h6">{{ t('home_page.sub_title_1') }}</h2>
        </div>
      </div>
      <div class="col-6 col-md-4">
        <q-card flat bordered class="full-height">
          <q-card-section>
            <q-card-section class="q-pt-xs">
              <div class="text-overline">{{ t('home_page.section.turnover.title') }}</div>
              <div class="text-h5 q-mt-sm q-mb-xs">{{ getTotalRecipeAmount.toFixed(2) }}€</div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-4">
        <q-card flat bordered class="full-height">
          <q-card-section>
            <q-card-section class="q-pt-xs">
              <div class="text-overline" v-html="t('home_page.section.profit.title')"></div>
              <div class="text-h5 q-mt-sm q-mb-xs">
                {{ (getTotalRecipeAmount - getTotalExpenseAmount).toFixed(2) }}€
              </div>
            </q-card-section>
            <q-card-section class="q-pt-xs">
              <div class="flex items-center q-gutter-sm">
                <q-badge color="primary">
                  {{
                    t('home_page.section.profit.earnings', {
                      amount: getTotalRecipeAmount.toFixed(2),
                    })
                  }}
                </q-badge>
                <span>-</span>
                <q-badge color="negative">
                  {{
                    t('home_page.section.profit.expenses', {
                      amount: getTotalExpenseAmount.toFixed(2),
                    })
                  }}
                </q-badge>
              </div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card flat bordered class="full-height">
          <q-card-section>
            <q-card-section class="q-pt-xs">
              <div
                class="text-overline"
                v-html="t('home_page.section.profit_after_salary.title')"
              ></div>
              <div class="text-h5 q-mt-sm q-mb-xs">{{ getBalanceAmount.toFixed(2) }}€</div>
            </q-card-section>
            <q-card-section class="q-pt-xs">
              <div class="flex items-center q-gutter-sm">
                <q-badge color="primary">
                  {{
                    t('home_page.section.profit_after_salary.profits', {
                      amount: (getTotalRecipeAmount - getTotalExpenseAmount).toFixed(2),
                    })
                  }}
                </q-badge>
                <span>-</span>
                <q-badge color="negative">
                  {{
                    t('home_page.section.profit_after_salary.salaries', {
                      amount: getTotalSalaryAmount.toFixed(2),
                    })
                  }}
                </q-badge>
              </div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12">
        <div class="flex items-center q-gutter-x-md">
          <q-icon name="account_balance" size="lg" />
          <h2 class="text-h6">{{ t('home_page.sub_title_2') }}</h2>
        </div>
      </div>
      <div class="col-6">
        <q-card flat bordered class="full-height">
          <q-card-section>
            <q-card-section class="q-pt-xs">
              <div class="text-overline">{{ t('home_page.section.vat_due.title') }}</div>
              <div class="text-h5 q-mt-sm q-mb-xs">{{ getRecipesTaxesAmount.toFixed(2) }}€</div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6">
        <q-card flat bordered class="full-height">
          <q-card-section>
            <q-card-section class="q-pt-xs">
              <div class="text-overline">{{ t('home_page.section.vat_recovered.title') }}</div>
              <div class="text-h5 q-mt-sm q-mb-xs">{{ getExpensesTaxesAmount.toFixed(2) }}€</div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12">
        <div class="flex items-center q-gutter-x-md">
          <q-icon name="business" size="lg" />
          <h2 class="text-h6">{{ t('home_page.sub_title_3') }}</h2>
        </div>
      </div>
      <div class="col-12">
        <q-card flat bordered class="full-height">
          <q-card-section>
            <q-card-section class="q-pt-xs">
              <div class="flex items-center">
                <div class="text-overline">
                  {{ t('home_page.section.treasury.title', { date: formatDate(date.to) }) }}
                </div>
                <q-toggle
                  v-model="treasuryIncludingTaxes"
                  :label="t('home_page.section.treasury.actions.including_taxes_toggle')"
                />
              </div>
              <div class="text-h5 q-mt-sm q-mb-xs">
                {{
                  treasuryIncludingTaxes
                    ? treasury.includingTaxes.current.toFixed(2)
                    : treasury.excludingTaxes.current.toFixed(2)
                }}€
              </div>
            </q-card-section>
            <q-card-section class="q-pt-xs">
              <div class="flex items-center q-gutter-sm">
                <q-badge color="secondary">
                  {{ t('home_page.section.treasury.base_amount', { amount: treasury.base }) }}
                </q-badge>
                <span>+</span>
                <q-badge color="primary">
                  {{
                    t('home_page.section.treasury.earning_amount', {
                      amount: treasuryIncludingTaxes
                        ? treasury.includingTaxes.gains.toFixed(2)
                        : treasury.excludingTaxes.gains.toFixed(2),
                    })
                  }}
                </q-badge>
                <span>-</span>
                <q-badge color="negative">
                  {{
                    t('home_page.section.treasury.losses_amount', {
                      amount: treasuryIncludingTaxes
                        ? treasury.includingTaxes.losses.toFixed(2)
                        : treasury.excludingTaxes.losses.toFixed(2),
                    })
                  }}
                </q-badge>
              </div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12"></div>
      <div class="col-12">
        <HomeTransactionTable
          :label="t('home_page.table.recipe.title')"
          :rows="recipes"
          :referents="referents"
          :categories="categories"
        />
      </div>
      <div class="col-12">
        <HomeTransactionTable
          :label="t('home_page.table.expense.title')"
          :rows="expenses"
          :referents="referents"
          :categories="categories"
        />
      </div>
      <div class="col-12">
        <HomeTransactionTable
          :label="t('home_page.table.salary.title')"
          :rows="salaries"
          :referents="referents"
          :categories="categories"
        />
      </div>
    </div>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" @click="onClickAddItem" />
    </q-page-sticky>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'

import { Head, router } from '@inertiajs/vue3'
import HomeTransactionTable from '~/components/home-transaction-table.vue'
import { TransactionType } from '#enums/TransactionType'
import BaseInput from '~/components/base-input.vue'
import { getMonths, getTrimesters } from '~/helpers/date'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

type DateFilter = {
  label: string
  value: {
    from: Date
    to: Date
  }
  selected: boolean
}

const props = defineProps<{
  transactions: any
  date: any
  availableYears: string[]
  treasury: {
    base: number
    excludingTaxes: {
      current: number
      losses: number
      gains: number
    }
    includingTaxes: {
      current: number
      losses: number
      gains: number
    }
  }
  referents: any[]
  categories: any[]
}>()

const treasuryIncludingTaxes = ref(true)

const availableDateQuarterFilters = computed(() => {
  const dates: { label: string; value: { from: Date; to: Date }; selected: boolean }[] = []

  getTrimesters(Number(getSelectedYear.value)).forEach((trimester, index) => {
    dates.push({
      label: t('unit.quarter', { value: index + 1 }),
      value: { from: trimester.min, to: trimester.max },
      selected:
        dayjs(props.date.from).isSame(trimester.min, 'day') &&
        dayjs(props.date.to).isSame(trimester.max, 'day'),
    })
  })

  return dates
})

const availableDateMonthFilters = computed(() => {
  const dates: { label: string; value: { from: Date; to: Date }; selected: boolean }[] = []

  getMonths(Number(getSelectedYear.value)).forEach((month, index) => {
    dates.push({
      label: dayjs().set('month', index).format('MMMM'),
      value: { from: month.min, to: month.max },
      selected:
        dayjs(props.date.from).isSame(month.min, 'day') &&
        dayjs(props.date.to).isSame(month.max, 'day'),
    })
  })

  return dates
})

const selectedDate = ref({
  from: dayjs(props.date.from).format('YYYY/MM/DD'),
  to: dayjs(props.date.to).format('YYYY/MM/DD'),
})

const onClearSelectedDates = () => {
  selectedDate.value.from = ''
  selectedDate.value.to = ''
}

const getSelectedYear = computed(() => {
  return dayjs(selectedDate.value.from).format('YYYY')
})

const getDateSelectedInLiteral = computed(() => {
  return `${dayjs(selectedDate.value.from, 'YYYY/MM/DD').format(t('unit.date'))} - ${dayjs(selectedDate.value.to, 'YYYY/MM/DD').format(t('unit.date'))}`
})

const onClickAddItem = () => {
  router.get('/transaction/create')
}

const loadTransactions = (from: Date | string, to: Date | string) => {
  const formFormatted = dayjs(from, 'YYYY/MM/DD').format('YYYY-MM-DD')
  const toFormatedd = dayjs(to, 'YYYY/MM/DD').format('YYYY-MM-DD')

  router.get(`/?date.from=${formFormatted}&date.to=${toFormatedd}`)
}

const onClickFilter = (filter: DateFilter) => {
  selectedDate.value.from = dayjs(filter.value.from).format('YYYY/MM/DD')
  selectedDate.value.to = dayjs(filter.value.to).format('YYYY/MM/DD')
}

const onClickYear = (year: string) => {
  selectedDate.value.from = dayjs(selectedDate.value.from)
    .set('year', Number(year))
    .format('YYYY/MM/DD')

  selectedDate.value.to = dayjs(selectedDate.value.to)
    .set('year', Number(year))
    .format('YYYY/MM/DD')
}

watch(
  selectedDate,
  (newValue) => {
    if (!newValue.from || !newValue.to) return
    loadTransactions(newValue.from, newValue.to)
  },
  { deep: true }
)

const expenses = computed(() => {
  return props.transactions.filter((t) => t.type === TransactionType.EXPENSE)
})

const recipes = computed(() => {
  return props.transactions.filter((t) => t.type === TransactionType.RECIPE)
})

const salaries = computed(() => {
  return props.transactions.filter((t) => t.type === TransactionType.SALARY)
})

const getRecipesTaxesAmount = computed(() => {
  return recipes.value.reduce((acc, transaction) => {
    return acc + (transaction.amountAllTax - transaction.amountExcludingTax)
  }, 0)
})

const getExpensesTaxesAmount = computed(() => {
  return expenses.value.reduce((acc, transaction) => {
    return acc + (transaction.amountAllTax - transaction.amountExcludingTax)
  }, 0)
})

const getTotalRecipeAmount = computed(() => {
  const totalIncome = recipes.value.reduce((acc, transaction) => {
    return acc + transaction.amountExcludingTax
  }, 0)

  return totalIncome
})

const getTotalExpenseAmount = computed(() => {
  const totalExpense = expenses.value.reduce((acc, transaction) => {
    return acc + transaction.amountExcludingTax
  }, 0)

  return totalExpense
})

const getTotalSalaryAmount = computed(() => {
  const total = salaries.value.reduce((acc, transaction) => {
    return acc + transaction.amountAllTax
  }, 0)

  return total
})

const getBalanceAmount = computed(() => {
  return getTotalRecipeAmount.value - getTotalExpenseAmount.value - getTotalSalaryAmount.value
})

const formatDate = (date) => {
  return dayjs(date).format(t('unit.date'))
}

const onClickGenerateReport = () => {
  window.location.href = `/report?year=${getSelectedYear.value}`
}
</script>
