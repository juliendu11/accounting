<template>
  <q-select
    v-model="model"
    outlined
    :label="label"
    hide-bottom-space
    :error="!!error"
    :error-message="error"
  >
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>{{ scope.opt.label }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script lang="ts" setup>
const model = defineModel<{ value: number | string; label: string }[]>()

defineProps<{
  label: string
  error?: string
}>()
</script>
