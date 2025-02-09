<template>
  <q-input
    v-model="model"
    :label
    outlined
    hide-bottom-space
    :error="!!error"
    :error-message="error"
  >
    <template v-for="(_, name) in $slots" v-slot:[name]="slotData">
      <slot :name="name" v-bind="slotData" :key="name" />
    </template>
  </q-input>
</template>

<script lang="ts" setup>
defineProps<{
  label: string
  error?: string
}>()

const model = defineModel<string | number>()
</script>
