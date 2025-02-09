<template>
  <Head :title="t('referents_page.title')" />

  <q-page padding>
    <q-list>
      <q-card
        v-for="(referent, idx) in referents"
        :key="idx"
        :class="{ 'q-mb-md': idx !== referent.length - 1 }"
        flat
        bordered
      >
        <q-item>
          <q-item-section>{{ referent.name }}</q-item-section>
          <q-item-section side>
            <q-btn
              icon="delete"
              flat
              round
              color="negative"
              @click="onClickDeleteItem(referent.id)"
            />
          </q-item-section>
        </q-item>
      </q-card>
    </q-list>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" @click="onClickAddItem" />
    </q-page-sticky>
  </q-page>
</template>

<script lang="ts" setup>
import { Head, router } from '@inertiajs/vue3'
import { useI18n } from 'vue-i18n'

defineProps<{
  referents: any[]
}>()

const { t } = useI18n()

const onClickAddItem = () => {
  router.get('/referent/create')
}

const onClickDeleteItem = (id: number) => {
  router.delete(`/referent/${id}`)
}
</script>
