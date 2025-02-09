import { createI18n } from 'vue-i18n'
import type { App } from 'vue'

import en from '../locales/en.json'
import fr from '../locales/fr.json'
import dayjs from 'dayjs'
import { watch } from 'vue'

export type MessageLanguages = 'en' | 'fr'
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = typeof en

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition

declare module 'vue-i18n' {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {}

  // define the number format schema
  export interface DefineNumberFormat {}
}

const messages = {
  en,
  fr,
}

export const generateI18n = () => {
  const i18n = createI18n({
    legacy: false,
    locale: navigator.language.split('-')[0],
    globalInjection: true,
    messages,
  })
  return i18n
}

export default {
  install: (app: App, opts?: { initialLanguage: 'fr' | 'en' }) => {
    const i18n = generateI18n()
    i18n.global.locale.value = opts?.initialLanguage ?? 'en'

    document.documentElement.setAttribute('lang', i18n.global.locale.value)
    dayjs.locale(i18n.global.locale.value)

    app.use(i18n)

    watch(i18n.global.locale, (locale) => {
      document.documentElement.setAttribute('lang', locale)
      dayjs.locale(locale)
    })
  },
}
