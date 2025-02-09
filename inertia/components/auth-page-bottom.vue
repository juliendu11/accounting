<template>
  <div class="q-mt-lg flex items-center justify-center">
    <q-list>
      <q-item v-ripple clickable data-testid="themeBtn" @click="updateTheme">
        <q-item-section avatar class="col-4">
          <q-icon :name="isDark ? 'light_mode' : 'dark_mode'"></q-icon>
        </q-item-section>

        <q-item-section>
          <q-item-label>
            {{ isDark ? t('menu.light_theme') : t('menu.dark_theme') }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable v-ripple>
        <q-item-section avatar class="col-4">
          <img
            :src="`/flags/${locale}.svg`"
            width="25px"
            :alt="`${t(`language.${locale}`)} flag`"
          />
        </q-item-section>
        <q-item-section>
          {{ t(`language.${locale}`) }}
        </q-item-section>
        <q-menu fit>
          <q-list style="min-width: 100px">
            <q-item clickable v-close-popup @click="locale = 'en'">
              <q-item-section avatar>
                <img src="/flags/en.svg" width="32px" :alt="`${t('language.en')} flag`" />
              </q-item-section>
              <q-item-section>
                {{ t('language.en') }}
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="locale = 'fr'">
              <q-item-section avatar>
                <img src="/flags/fr.svg" width="32px" :alt="`${t('language.fr')} flag`" />
              </q-item-section>
              <q-item-section>
                {{ t('language.fr') }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useTheme } from '~/composables/useTheme'
import { onMounted } from 'vue'

const { t, locale } = useI18n()
const { setTheme, updateTheme, isDark } = useTheme()

onMounted(() => {
  setTheme()
})
</script>
