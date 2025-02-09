<template>
  <Head :title="t('account_page.title')" />

  {{ user }}
</template>

<script lang="ts" setup>
import { Head } from '@inertiajs/vue3'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  user: any
}>()
</script>
