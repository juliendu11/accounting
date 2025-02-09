<template>
  <Head :title="t('login_page.title')" />

  <q-page class="full-height full-width">
    <div class="container">
      <h1 class="text-center">{{ t('login_page.title') }}</h1>
      <q-card flat bordered>
        <q-card-section class="q-pa-lg">
          <form @submit.prevent="form.post('/login')">
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
                  v-model="form.password"
                  type="password"
                  :label="t('form.password')"
                  :error="form.errors.password"
                />
              </div>
              <div class="col-12">
                <q-btn
                  type="submit"
                  :label="t('login_page.form.actions.submit')"
                  class="full-width q-mb-sm"
                  color="primary"
                  :loading="form.processing"
                />
              </div>
            </div>
          </form>

          <q-banner v-if="email && password" class="bg-primary text-white q-mt-md">
            <span class="text-h6">Demo account:</span>
            <span class="block q-mb-xs q-mt-md"
              >Email: <strong>{{ email }}</strong></span
            >
            <span
              >Password: <strong>{{ password }}</strong></span
            >
          </q-banner>
        </q-card-section>
      </q-card>
      <AuthPageBottom />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { Head, useForm } from '@inertiajs/vue3'
import BaseInput from '~/components/base-input.vue'
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AuthPageBottom from '~/components/auth-page-bottom.vue'

const { t } = useI18n()

defineProps<{
  email?: string
  password?: string
}>()

const form = useForm({
  email: '',
  password: '',
})

watch(
  () => form.email,
  () => {
    form.clearErrors('email')
  }
)

watch(
  () => form.password,
  () => {
    form.clearErrors('password')
  }
)
</script>

<style scoped>
.container {
  max-width: 550px;
  margin: 0 auto;
}
</style>
