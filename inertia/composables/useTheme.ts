import { useQuasar } from 'quasar'
import { computed } from 'vue'

const useTheme = () => {
  const $q = useQuasar()

  const setTheme = (theme?: 'light' | 'dark' | undefined) => {
    if (theme) {
      $q.dark.set(theme === 'dark')
      return
    }

    const userPrefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    if (userPrefersDark) {
      $q.dark.set(true)
    }
  }

  const updateTheme = () => {
    $q.dark.toggle()
  }

  return {
    updateTheme,
    setTheme,
    isDark: computed(() => $q.dark.isActive),
  }
}

export { useTheme }
