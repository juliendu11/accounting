import { ComputedRef, onMounted, ref, watch } from 'vue'

export type UseWidgetOptions<S> = {
  widgetPath: string
  baseValues: S
  urlQueries: ComputedRef<{
    year: number
    includeTaxes: boolean
  }>
}

export const useWidgetAPI = <S>(opts: UseWidgetOptions<S>) => {
  const state = ref<S>(opts.baseValues)

  const isLoading = ref(false)
  const isError = ref(false)
  const hasData = ref(false)
  const error = ref<any>()

  onMounted(async () => {
    await toFetch()
  })

  const toFetch = async () => {
    try {
      isLoading.value = true

      const url = `/stats/widget/${opts.widgetPath}`

      const widgetPathWithQuery = `${url}?date.year=${opts.urlQueries.value.year}&taxes.include=${opts.urlQueries.value.includeTaxes}`

      const data = await fetch(widgetPathWithQuery).then((res) => res.json())

      state.value = data

      hasData.value = true
    } catch (er: any) {
      isError.value = true
      error.value = er
    } finally {
      isLoading.value = false
    }
  }

  watch(
    () => opts.urlQueries.value,
    async () => {
      await toFetch()
    }
  )

  return { state, isError, isLoading, error, hasData }
}
