<template>
  <Head :title="t('confirm_page.title')" />

  <q-page class="full-height full-width">
    <div class="container">
      <h1 class="text-center">{{ t('confirm_page.title') }}</h1>
      <q-card flat bordered>
        <q-card-section v-if="state === 'loading'" class="q-pa-lg">
          <div class="flex justify-center q-mb-md">
            <strong class="text-weight-bold">{{ t('confirm_page.state.loading') }}</strong>
          </div>
          <div class="flex items-center justify-center">
            <q-circular-progress
              indeterminate
              rounded
              size="60px"
              color="primary"
              class="q-ma-md"
            />
          </div>
        </q-card-section>
      </q-card>
      <AuthPageBottom />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { Head, router } from '@inertiajs/vue3'
import { useI18n } from 'vue-i18n'
import AuthPageBottom from '~/components/auth-page-bottom.vue'
import { onMounted, ref } from 'vue'

const props = defineProps<{
  token: string
  email: string
}>()

const { t } = useI18n()

const state = ref('loading')

onMounted(() => {
  router.post(
    '/confirm',
    {
      token: props.token,
      email: props.email,
    },
    {
      preserveScroll: true,
      onSuccess: () => {
        router.get('/login')
      },
      onError: () => {
        state.value = 'error'
      },
    }
  )
})
</script>

<style scoped>
.container {
  max-width: 550px;
  margin: 0 auto;
}
</style>
