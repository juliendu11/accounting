<template>
  <Head :title="t('register_page.title')" />
  <q-page class="full-height full-width" padding>
    <div class="container">
      <h1 class="text-center">{{ t('register_page.title') }}</h1>
      <q-card flat bordered>
        <q-card-section class="q-pa-lg">
          <form @submit.prevent="form.post('/register')">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <BaseInput
                  v-model="form.email"
                  :label="t('form.email')"
                  :error="form.errors.email"
                />
              </div>
              <div class="col-12">
                <BaseInput
                  v-model="form.username"
                  :label="t('form.username')"
                  :error="form.errors.username"
                />
              </div>
              <div class="col-12">
                <BaseInput
                  v-model="form.password"
                  type="password"
                  :label="t('form.password')"
                  :error="form.errors.password"
                />
              </div>
              <div class="col-12">
                <BaseInput
                  v-model="form.treasury"
                  type="number"
                  :label="t('form.treasury')"
                  :error="form.errors.treasury"
                />
              </div>
              <div class="col-12">
                <q-btn
                  type="submit"
                  :label="t('register_page.form.actions.submit')"
                  color="primary"
                  class="full-width q-mb-sm"
                  :loading="form.processing"
                />
                <q-btn
                  :label="t('register_page.form.actions.login')"
                  color="primary"
                  outline
                  class="full-width"
                  href="/login"
                  :disable="form.processing"
                />
              </div>
            </div>
          </form>
        </q-card-section>
      </q-card>
      <AuthPageBottom />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { watch } from 'vue'

import { Head } from '@inertiajs/vue3'
import BaseInput from '~/components/base-input.vue'
import { useI18n } from 'vue-i18n'
import AuthPageBottom from '~/components/auth-page-bottom.vue'
import { useTheme } from '~/composables/useTheme'
import { useCreateForm } from '~/composables/useCreateForm'

const { t, locale } = useI18n()
const { isDark } = useTheme()

const { form } = useCreateForm({
  email: '',
  password: '',
  username: '',
  treasury: 0,
  locale: 'en',
  theme: 'light',
})

watch(
  locale,
  () => {
    form.locale = locale.value
  },
  { immediate: true }
)

watch(
  isDark,
  () => {
    form.theme = isDark.value ? 'dark' : 'light'
  },
  { immediate: true }
)
</script>

<style scoped>
.container {
  max-width: 550px;
  margin: 0 auto;
}
</style>
