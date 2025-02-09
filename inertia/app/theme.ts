import type { App } from 'vue'

export default {
  install: (app: App, opts?: { initialTheme: 'light' | 'dark' }) => {
    if (opts?.initialTheme === 'dark') {
      app.config.globalProperties.$q.dark.toggle()
    }
  },
}
