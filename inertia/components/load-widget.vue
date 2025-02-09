<script lang="ts" setup>
// FROM: https://github.com/RomainLanz/romainlanz.com/blob/main/apps/romainlanz.com/inertia/components/load_fragment.vue
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { usePage } from '@inertiajs/vue3'
import { markRaw, onMounted, ref } from 'vue'

const props = defineProps<{
  source: string
  componentProps?: Record<string, any>
}>()

const assetVersion = usePage().version
const componentProps = ref<any>(null)
const component = ref<any>(null)

onMounted(async () => {
  const response = await fetch(props.source, {
    headers: {
      'X-Inertia': 'true',
      'X-Inertia-Fragment': 'true',
      'X-Inertia-Version': assetVersion,
    },
  }).then((r) => r.json())

  componentProps.value = {
    ...response.props,
    ...props.componentProps,
  }
  component.value = await resolvePageComponent(
    `./widgets/${response.component}.vue`,
    import.meta.glob('./widgets/**/*.vue')
  ).then((c: any) => markRaw(c.default))
})
</script>

<template>
  <div v-if="component === null">
    <slot name="fallback" />
  </div>

  <Component :is="component" v-bind="componentProps" v-else />
</template>
