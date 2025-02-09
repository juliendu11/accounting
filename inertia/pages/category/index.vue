<template>
  <Head :title="t('categories_page.title')" />

  <q-page padding>
    <q-list>
      <q-card
        v-for="(category, idx) in categories"
        :key="idx"
        :class="{ 'q-mb-md': idx !== categories.length - 1 }"
        flat
        bordered
      >
        <q-item>
          <q-item-section>{{ category.name }}</q-item-section>
          <q-item-section side>
            <q-btn
              icon="delete"
              flat
              round
              color="negative"
              @click="onClickDeleteItem(category.id)"
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
  categories: any[]
}>()

const { t } = useI18n()

const onClickAddItem = () => {
  router.get('/category/create')
}

const onClickDeleteItem = (id: number) => {
  router.delete(`/category/${id}`)
}
</script>
