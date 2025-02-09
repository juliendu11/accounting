<template>
  <q-layout view="hHh LpR lFf">
    <q-page-container>
      <q-page class="flex flex-center column q-gutter-md">
        <div class="text-h1 text-weight-bold text-grey-5">{{ t('404_page.title') }}</div>
        <div class="text-h5">{{ t('404_page.text_1') }}</div>
        <div class="text-body1 text-grey-6">{{ t('404_page.text_2') }}</div>
        <q-btn color="primary" icon="home" :label="t('404_page.actions.home')" href="/" />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
