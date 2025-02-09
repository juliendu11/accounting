<template>
  <Head :title="t('create_category_page.title')" />

  <q-page padding>
    <form @submit.prevent="form.post('/category')">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <BaseInput
            v-model="form.name"
            autofocus
            :label="t('form.name')"
            :error="form.errors.name"
          />
        </div>
        <div class="col-12">
          <q-btn
            type="submit"
            :label="t('label.add')"
            color="primary"
            :disabled="form.processing"
          />
        </div>
      </div>
    </form>
  </q-page>
</template>

<script lang="ts" setup>
import { watch } from 'vue'

import BaseInput from '~/components/base-input.vue'

import { Head, useForm } from '@inertiajs/vue3'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const form = useForm({
  name: '',
})

watch(
  () => form.name,
  () => {
    form.clearErrors('name')
  }
)
</script>
