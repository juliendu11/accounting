<template>
  <q-dialog v-model="model">
    <slot></slot>
  </q-dialog>
</template>

<script lang="ts" setup>
const model = defineModel<boolean>()
</script>
