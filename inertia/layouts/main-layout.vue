<template>
  <q-layout view="hHh LpR lFf">
    <q-header :elevated="!$q.dark.isActive" class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      side="left"
      :bordered="!$q.dark.isActive"
      :width="200"
      :mini="miniState"
      @mouseenter="miniState = false"
      @mouseleave="miniState = true"
    >
      <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: 0 }">
        <q-list padding>
          <q-item clickable v-ripple href="/" :active="menuIsActive('/')">
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>

            <q-item-section>{{ t('menu.home') }}</q-item-section>
          </q-item>

          <q-item clickable v-ripple href="/category" :active="menuIsActive('/category')">
            <q-item-section avatar>
              <q-icon name="category" />
            </q-item-section>

            <q-item-section>{{ t('menu.categories') }}</q-item-section>
          </q-item>

          <q-item clickable v-ripple href="/referent" :active="menuIsActive('/referent')">
            <q-item-section avatar>
              <q-icon name="group" />
            </q-item-section>

            <q-item-section>{{ t('menu.referents') }}</q-item-section>
          </q-item>

          <q-item clickable v-ripple href="/tools" :active="menuIsActive('/tools')">
            <q-item-section avatar>
              <q-icon name="build" />
            </q-item-section>

            <q-item-section>{{ t('menu.tools') }}</q-item-section>
          </q-item>

          <q-item clickable v-ripple href="/stats" :active="menuIsActive('/stats')">
            <q-item-section avatar>
              <q-icon name="analytics" />
            </q-item-section>

            <q-item-section>{{ t('menu.stats') }}</q-item-section>
          </q-item>

          <q-item clickable v-ripple href="/account" :active="menuIsActive('/account')">
            <q-item-section avatar>
              <q-icon name="manage_accounts" />
            </q-item-section>

            <q-item-section>{{ t('menu.account') }}</q-item-section>
          </q-item>

          <div class="absolute-bottom">
            <q-item clickable v-ripple>
              <q-item-section avatar>
                <img
                  :src="`/flags/${locale}.svg`"
                  width="32px"
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

            <q-item v-ripple clickable data-testid="themeBtn" @click="updateTheme">
              <q-item-section avatar>
                <q-icon :name="isDark ? 'light_mode' : 'dark_mode'"></q-icon>
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  {{ isDark ? t('menu.light_theme') : t('menu.dark_theme') }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="onClickLogout" :active="menuIsActive('/logout')">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>

              <q-item-section>{{ t('menu.logout') }}</q-item-section>
            </q-item>
          </div>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <slot />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { router, usePage } from '@inertiajs/vue3'
import { useI18n } from 'vue-i18n'
import { useTheme } from '~/composables/useTheme'
import { useQuasar } from 'quasar'
import dayjs from 'dayjs'

const { t, locale } = useI18n()

const leftDrawerOpen = ref(false)
const miniState = ref(true)
const { setTheme, updateTheme, isDark } = useTheme()
const page = usePage()
const $q = useQuasar()

onMounted(() => {
  if (!page.props?.user) {
    return
  }

  if (page.props?.user?.theme) {
    setTheme(page.props.user.theme as 'light' | 'dark')
    return
  }
  setTheme()
})

watch([locale, isDark], async ([currentLocal, isDarkTheme]) => {
  if (!page.props?.user) {
    return
  }
  router.patch(`/user/${page.props.user.id}/profile`, {
    locale: currentLocal,
    theme: isDarkTheme ? 'dark' : 'light',
  })

  dayjs.locale(currentLocal)
})

const menuIsActive = (route: string) => {
  return window.location.pathname === route
}

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const onClickLogout = () => {
  router.delete('/login')
}
</script>
