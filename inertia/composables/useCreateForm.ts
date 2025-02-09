import { useForm } from '@inertiajs/vue3'
import { watch } from 'vue'

export const useCreateForm = (formData: Record<any, any>) => {
  const form = useForm(formData)

  Object.keys(formData).forEach((key) => {
    watch(
      () => form[key],
      () => {
        form.clearErrors(key)
      }
    )
  })

  return { form }
}
