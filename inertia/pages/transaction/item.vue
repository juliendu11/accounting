<template>
  <q-page padding>
    <form @submit.prevent="onClickSubmit">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-tabs v-model="form.type" align="justify">
            <q-tab name="INCOME" icon="savings" label="Revenu" />
            <q-tab name="EXPENSE" icon="paid" label="Dépense" />
          </q-tabs>
        </div>
        <div class="col-12">
          <BaseInput v-model="form.invoice" label="Facture" :error="form.errors.invoice" />
        </div>
        <div class="col-12">
          <BaseInput v-model="form.date" type="date" label="Date" :error="form.errors.date" />
        </div>
        <div class="col-12">
          <BaseSelect
            v-model="referentProxyValue"
            label="Référent"
            :options="referents.map((referent) => ({ label: referent.name, value: referent.id }))"
            use-input
            use-chips
            input-debounce="0"
            new-value-mode="toggle"
            :error="form.errors.referent"
          />
        </div>
        <div class="col-12">
          <BaseSelect
            v-model="form.categories"
            :options="categories.map((category) => ({ label: category.name, value: category.id }))"
            label="Catégories"
            multiple
            use-chips
            :error="form.errors.categories"
          />
        </div>
        <div class="col-12">
          <BaseInput
            v-model="form.amountExcludingTax"
            label="Montant (HT)"
            type="number"
            :error="form.errors.amountExcludingTax"
          />
        </div>
        <div class="col-12">
          <BaseInput
            v-model="form.amountAllTax"
            label="Montant (TTC)"
            type="number"
            :error="form.errors.amountAllTax"
          />
        </div>
        <div class="col-12">
          <BaseInput v-model="form.currency" label="Devise" :error="form.errors.currency" />
        </div>
        <div class="col-12">
          <BaseInput
            v-model="form.comment"
            type="textarea"
            label="Commentaire"
            :error="form.errors.comment"
          />
        </div>
        <div class="col-12">
          <q-btn type="submit" label="Modifier" color="primary" :disabled="form.processing" />
        </div>
      </div>
    </form>
  </q-page>
</template>

<script lang="ts" setup>
import BaseSelect from '~/components/base-select.vue'
import BaseInput from '~/components/base-input.vue'
import { useCreateForm } from '~/composables/useCreateForm'
import dayjs from 'dayjs'
import { computed } from 'vue'

const props = defineProps<{
  transaction: any
  categories: any
  referents: any
}>()

const { form } = useCreateForm({
  invoice: props.transaction.invoice,
  date: dayjs(props.transaction.date).format('YYYY-MM-DD'),
  referent: props.transaction.referent?.name,
  categories: props.transaction.categories.map((category) => ({
    label: category.name,
    value: category.id,
  })),
  amountExcludingTax: props.transaction.amountExcludingTax,
  amountAllTax: props.transaction.amountAllTax,
  currency: props.transaction.currency,
  comment: props.transaction.comment,
  type: props.transaction.type,
})

const referentProxyValue = computed({
  get() {
    return form.referent
  },
  set(newValue) {
    if (!newValue) {
      form.referent = null
      return
    }
    form.referent = newValue.label
  },
})

const onClickSubmit = () => {
  form
    .transform((data) => ({
      ...data,
      categories: data.categories?.map((category) => category.value) ?? [],
    }))
    .put(`/transaction/${props.transaction.id}`)
}
</script>
