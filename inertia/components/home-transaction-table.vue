<template>
  <q-table flat bordered :title="label" :rows="currentRows" :columns="columns" row-key="id">
    <template #top>
      <div class="flex column q-gutter-sm full-width">
        <div class="q-table__title">{{ label }}</div>

        <div class="q-mt-lg full-width">
          <CategoriesChart
            :categories="categoriesForCategoriesChart"
            :series="seriesForCategoriesChart"
          />
        </div>

        <div class="row q-col-gutter-x-sm full-width q-mt-lg">
          <div class="col-2 q-px-none">
            <BaseInput v-model="filter.text" label="Recherche" dense>
              <template #prepend>
                <q-icon name="search" class="cursor-pointer" />
              </template>
            </BaseInput>
          </div>

          <div class="col-2">
            <BaseSelect
              v-model="filter.referents"
              label="Référent"
              :options="referents.map((referent) => ({ label: referent.name, value: referent.id }))"
              multiple
              use-chips
              dense
            />
          </div>

          <div class="col-2">
            <BaseSelect
              v-model="filter.categories"
              label="Catégories"
              :options="
                categories.map((referent) => ({ label: referent.name, value: referent.id }))
              "
              multiple
              use-chips
              dense
            />
          </div>

          <div class="col-2">
            <BaseInput :model-value="getDateSelectedInLiteral" :label="t('label.date')" dense>
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-date v-model="filter.date" range landscape>
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
        </div>
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-popup-proxy context-menu>
          <q-list style="min-width: 100px">
            <q-item clickable v-close-popup @click="onClickOpenFileTransaction(props.row.id)">
              <q-item-section>{{ t('home_page.table.actions.open_file') }}</q-item-section>
            </q-item>
            <q-item clickable v-close-popup :href="`/transaction/${props.row.id}`">
              <q-item-section>{{ t('home_page.table.actions.update') }}</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="onClickDeleteTransaction(props.row.id)">
              <q-item-section>{{ t('home_page.table.actions.delete') }}</q-item-section>
            </q-item>
          </q-list>
        </q-popup-proxy>

        <q-td key="id" :props="props">
          {{ props.row.id }}
        </q-td>
        <q-td key="documents" :props="props">
          {{ props.row.documents.length }}
        </q-td>
        <q-td key="invoice" :props="props"> {{ props.row.invoice }}</q-td>
        <q-td key="date" :props="props"> {{ formatDate(props.row.date) }}</q-td>
        <q-td key="referent" :props="props">
          <q-chip v-if="props.row.referent">{{ props.row.referent.name }}</q-chip>
        </q-td>
        <q-td key="amountExcludingTax" :props="props"> {{ props.row.amountExcludingTax }}</q-td>
        <q-td key="amountAllTax" :props="props"> {{ props.row.amountAllTax }}</q-td>
        <q-td key="currency" :props="props"> {{ props.row.currency }}</q-td>
        <q-td key="comment" :props="props"> {{ props.row.comment }}</q-td>
        <q-td key="categories" :props="props">
          <q-chip v-for="category in props.row.categories" :key="category.id"
            >{{ category.name }}
          </q-chip>
        </q-td>
      </q-tr>
    </template>
    <template v-if="rows.length !== 0" v-slot:bottom-row>
      <q-tr>
        <q-td class="text-left"></q-td>
        <q-td class="text-right"></q-td>
        <q-td class="text-right"></q-td>
        <q-td class="text-right"></q-td>
        <q-td class="text-right">
          <strong class="text-weight-bold">Total</strong>
        </q-td>
        <q-td class="text-right">
          <strong class="text-weight-bold">{{ getTotalExcludeTaxAmount.toFixed(2) }}</strong>
        </q-td>
        <q-td class="text-right">
          <strong class="text-weight-bold">{{ getTotalIncludeTaxAmount.toFixed(2) }}</strong>
        </q-td>
        <q-td class="text-right"></q-td>
        <q-td class="text-right"></q-td>
        <q-td class="text-right"></q-td>
      </q-tr>
    </template>
  </q-table>
  <q-dialog v-model="dialog.confirm.show" persistent>
    <q-card>
      <q-card-section class="row items-center q-gutter-md">
        <q-avatar icon="delete" color="primary" text-color="white" />
        <span>{{ t('home_page.table.confirm_delete.message') }}</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="t('label.cancel')" color="primary" v-close-popup />
        <q-btn
          flat
          :label="t('home_page.table.confirm_delete.actions.confirm')"
          color="primary"
          v-close-popup
          @click="onClickConfirmDelete"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="dialog.files.show">
    <q-card>
      <q-card-section>
        <q-list v-for="document in dialog.files.documents" :key="document.id" class="q-pa-none">
          <q-item>
            <q-item-section avatar>
              <q-icon v-if="document.type.includes('image')" name="image" />
              <q-icon v-else-if="document.type.includes('video')" name="movie" />
              <q-icon v-else name="description" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ document.name }}</q-item-label>
            </q-item-section>
            <q-item-section top side>
              <div class="text-grey-8 q-gutter-xs">
                <q-btn flat round icon="file_download" @click="onClickDownloadDocument(document)" />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat :label="t('label.exit')" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
    {{ dialog.files.files }}
  </q-dialog>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs'
import { router } from '@inertiajs/vue3'
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseInput from '~/components/base-input.vue'
import BaseSelect from '~/components/base-select.vue'
import CategoriesChart from '~/components/categories-chart.vue'

const props = defineProps<{
  label: string
  rows: any[]
  referents: any[]
  categories: any[]
}>()

const { t } = useI18n()

const dialog = reactive({
  confirm: { show: false, transaction: { id: -1 } },
  files: { show: false, transaction: { id: -1 }, documents: [] },
})

const filter = reactive({
  text: '',
  referents: [],
  categories: [],
  date: {
    from: '',
    to: '',
  },
})

const currentRows = computed(() => {
  const rows = props.rows

  if (filter.text) {
    return rows.filter((row) => {
      return (
        row.invoice.toString().includes(filter.text) ||
        row.referent?.name.toLowerCase().includes(filter.text.toLowerCase()) ||
        row.comment?.toLowerCase().includes(filter.text.toLowerCase())
      )
    })
  }

  if (filter.referents.length !== 0) {
    return rows.filter((row) => {
      return filter.referents.map((ref) => ref.value).includes(row.referent.id)
    })
  }

  if (filter.categories.length !== 0) {
    return rows.filter((row) => {
      const rowCategoriesIds = row.categories.map((category) => category.id)
      return filter.categories.map((cat) => cat.value).some((cat) => rowCategoriesIds.includes(cat))
    })
  }

  if (filter.date.from && filter.date.to) {
    return rows.filter((row) => {
      const date = dayjs(row.date)
      return date.isAfter(dayjs(filter.date.from)) && date.isBefore(dayjs(filter.date.to))
    })
  }

  return rows
})

const formatDate = (date: Date) => {
  return dayjs(date).format('DD/MM/YYYY')
}

const columns = [
  {
    name: 'id',
    required: true,
    label: 'Id',
    field: 'id',
    align: 'left',
  },
  {
    name: 'documents',
    label: 'Documents',
    field: 'documents',
  },
  { name: 'invoice', label: 'Facture', field: 'invoice' },
  {
    name: 'date',
    label: 'Date',
    field: 'date',
    sortable: true,
  },
  { name: 'referent', label: 'Rérérent', field: 'referent' },
  { name: 'amountExcludingTax', label: 'Montant HT', field: 'amountExcludingTax' },
  { name: 'amountAllTax', label: 'Montant TTC', field: 'amountAllTax' },
  { name: 'currency', label: 'Devise', field: 'currency' },
  { name: 'comment', label: 'Commentaire', field: 'comment' },
  {
    name: 'categories',
    label: 'Categories',
    field: 'categories',
  },
]

const onClickOpenFileTransaction = (id: number) => {
  const transaction = props.rows.find((row) => row.id === id)
  if (!transaction) return

  dialog.files.show = true
  dialog.files.transaction.id = id
  dialog.files.documents = transaction.documents.map((document: any) => ({
    id: document.id,
    name: document.name,
    size: document.size,
    type: document.type,
  }))
}

const onClickDownloadDocument = (document: any) => {
  const link = window.document.createElement('a')
  link.href = `transaction/${dialog.files.transaction.id}/file/${document.id}`
  link.download = document.name || `file-${document.id}`
  link.click()
  link.remove()
}

const onClickDeleteTransaction = (id: number) => {
  dialog.confirm.show = true
  dialog.confirm.transaction.id = id
}

const onClickConfirmDelete = () => {
  router.delete(`transaction/${dialog.confirm.transaction.id}`)
}

const getTotalExcludeTaxAmount = computed(() => {
  return props.rows.reduce((acc, row) => acc + row.amountExcludingTax, 0)
})

const getTotalIncludeTaxAmount = computed(() => {
  return props.rows.reduce((acc, row) => acc + row.amountAllTax, 0)
})

const getDateSelectedInLiteral = computed(() => {
  if (!filter.date.from && !filter.date.to) {
    return ''
  }
  return `${dayjs(filter.date.from, 'YYYY/MM/DD').format(t('unit.date'))} - ${dayjs(filter.date.to, 'YYYY/MM/DD').format(t('unit.date'))}`
})

const onClearSelectedDates = () => {
  filter.date.from = ''
  filter.date.to = ''
}

const categoriesForCategoriesChart = computed(() => {
  const rows = props.rows

  return rows.reduce((acc: string[], row) => {
    row.categories.forEach((category: any) => {
      if (!acc.includes(category.name)) {
        acc.push(category.name)
      }
    })
    return acc
  }, [])
})

const seriesForCategoriesChart = computed(() => {
  const rows = props.rows
  const categories = categoriesForCategoriesChart.value

  return categories.map((category) => {
    return rows.reduce((acc, row) => {
      if (row.categories.some((cat: any) => cat.name === category)) {
        return acc + 1
      }
      return acc
    }, 0)
  })
})
</script>
