/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />

import '../css/app.css'
import { createApp, h, watch } from 'vue'
import type { DefineComponent } from 'vue'
import { createInertiaApp, usePage } from '@inertiajs/vue3'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { Notify, Quasar } from 'quasar'
import quasarLang from 'quasar/lang/fr'
import VueApexCharts from 'vue3-apexcharts'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// A few examples for animations from Animate.css:
// import @quasar/extras/animate/fadeIn.css
// import @quasar/extras/animate/fadeOut.css

// Import Quasar css
import 'quasar/src/css/index.sass'

import '../css/app.css'
import i18n from '~/app/i18n'
import dayjs from '~/app/dayjs'
import theme from '~/app/theme'
import { useI18n } from 'vue-i18n'
import { useTheme } from '~/composables/useTheme'
import MainLayout from '~/layouts/main-layout.vue'
import AuthLayout from '~/layouts/auth-layout.vue'

import '~/config/initializers/dayjs.config'
import type { PageProps } from '#config/inertia'

const appName = 'AE Accounting'

createInertiaApp({
  progress: { color: '#5468FF' },

  title: (title) => `${title} - ${appName}`,

  resolve: async (name) => {
    const page = await resolvePageComponent(
      `../pages/${name}.vue`,
      import.meta.glob<DefineComponent>('../pages/**/*.vue')
    )

    if (name.includes('auth')) {
      page.default.layout = page.default.layout || AuthLayout
    } else if (name.includes('errors')) {
      page.default.layout = page.default.layout || null
    } else {
      page.default.layout = page.default.layout || MainLayout
    }

    return page
  },

  setup({ el, App, props, plugin }) {
    console.log(props?.initialPage?.props)
    createApp({
      render: () => h(App, props),
      setup: () => {
        const page = usePage<PageProps>()
        const { locale } = useI18n()
        const { setTheme } = useTheme()

        setTheme()

        watch(
          () => page.props,
          (value) => {
            if (value && value.flash && value.flash.notification) {
              Notify.create({
                type: value.flash.notification.type === 'error' ? 'negative' : 'neutral',
                message: value.flash.notification.message,
              })
            }
            if (value && value.errors) {
              Object.values(value.errors).forEach((error: string) => {
                Notify.create({
                  type: 'negative',
                  message: error,
                })
              })
            }
            if (value && value.user) {
              locale.value = value.user.locale
              setTheme(value.user.theme as any)
            }
          },
          { immediate: true }
        )
      },
    })
      .use(plugin)
      .use(Quasar, {
        plugins: {
          Notify,
        }, // import Quasar plugins and add here
        lang: quasarLang,
      })
      .use(VueApexCharts)
      .use(i18n, {
        initialLanguage:
          props?.initialPage?.props?.user?.locale ??
          props?.initialPage?.props?.defaultLocale ??
          null,
      })
      .use(dayjs)
      .use(theme, { initialTheme: props.initialPage?.props?.user?.theme ?? null })
      .mount(el)
  },
})
