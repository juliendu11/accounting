<template>
  <Head :title="t('tools_page.title')" />

  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Calcul des jours ouvrés</div>
          </q-card-section>
          <q-card-section>
            <BaseInput :model-value="getDateSelectedInLiteral" :label="t('label.date')">
              <q-popup-proxy
                ref="popupProxyComponent"
                transition-show="scale"
                transition-hide="scale"
              >
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
          </q-card-section>

          <q-card-section v-if="result !== 0">
            Il y'a {{ result }} jours ouvrés entre le {{ formatDate(selectedDate.from) }} et le
            {{ formatDate(selectedDate.to) }}
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { Head } from '@inertiajs/vue3'
import { useI18n } from 'vue-i18n'

import BaseInput from '~/components/base-input.vue'

const { t } = useI18n()

const popupProxyComponent = ref()

const selectedDate = ref({
  from: null,
  to: null,
})
const result = ref(0)

watch(selectedDate, (value) => {
  if (value.from && value.to) {
    const start = dayjs(value.from)
    const end = dayjs(value.to)
    result.value = end.diff(start, 'day') - end.diff(start, 'week') * 2

    if (popupProxyComponent.value) {
      popupProxyComponent.value.hide()
    }
  } else {
    result.value = 0
  }
})

const onClearSelectedDates = () => {
  selectedDate.value.from = null
  selectedDate.value.to = null
}

const formatDate = (date: Date) => {
  return dayjs(date).format(t('unit.date'))
}

const getDateSelectedInLiteral = computed(() => {
  return selectedDate.value.from && selectedDate.value.to
    ? `${formatDate(selectedDate.value.from)} - ${formatDate(selectedDate.value.to)}`
    : ''
})
</script>
