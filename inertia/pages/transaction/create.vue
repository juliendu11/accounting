<template>
  <Head :title="t('create_transaction_page.title')" />

  <q-page padding>
    <form @submit.prevent="onClickSubmit" up-submit="success">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-tabs v-model="form.type" align="justify">
            <q-tab
              :name="TransactionType.RECIPE"
              icon="trending_up"
              :label="t('home_page.table.recipe.title')"
            />
            <q-tab
              :name="TransactionType.EXPENSE"
              icon="trending_down"
              :label="t('home_page.table.expense.title')"
            />
            <q-tab
              :name="TransactionType.SALARY"
              icon="paid"
              :label="t('home_page.table.salary.title')"
            />
          </q-tabs>
        </div>
        <div class="col-12">
          <BaseInput
            v-model="form.invoice"
            :label="form.type === TransactionType.SALARY ? 'Référence' : 'Facture'"
            :error="form.errors.invoice"
          />
        </div>
        <div class="col-12">
          <BaseInput v-model="form.date" type="date" label="Date" :error="form.errors.date" />
        </div>
        <div v-if="form.type !== TransactionType.SALARY" class="col-12">
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
        <div v-if="form.type !== TransactionType.SALARY" class="col-12">
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
          <div class="row q-col-gutter-md">
            <div
              :class="form.documents.length === 0 ? 'col-12' : $q.screen.gt.sm ? 'col-6' : 'col-12'"
            >
              <div
                class="dropzone"
                @dragover.prevent
                @drop.prevent="onDrop"
                @click="onClickDropzone"
              >
                <p class="text-h5">Déposez vos fichiers ici ou cliquer pour sélectionner</p>
                <input
                  type="file"
                  ref="uploadInput"
                  multiple
                  class="hidden"
                  @change="onFilesSelectedChanged"
                />
              </div>
            </div>
            <div v-if="form.documents.length !== 0" :class="$q.screen.gt.sm ? 'col-6' : 'col-12'">
              <q-list bordered style="height: 200px; overflow-y: auto">
                <q-item v-for="(file, idx) in form.documents" :key="idx">
                  <q-item-section avatar>
                    <q-icon v-if="file.type.includes('image')" name="image" />
                    <q-icon v-else-if="file.type.includes('video')" name="movie" />
                    <q-icon v-else name="description" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label> {{ file.name }}</q-item-label>
                  </q-item-section>
                  <q-item-section top side>
                    <div class="text-grey-8 q-gutter-xs">
                      <q-btn
                        class="gt-xs"
                        size="12px"
                        flat
                        dense
                        round
                        icon="delete"
                        @click="onClickDeleteFile(idx)"
                      />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </div>
        <div class="col-12">
          <q-btn type="submit" label="Ajouter" color="primary" :disabled="form.processing" />
        </div>
      </div>
    </form>
  </q-page>
</template>

<script lang="ts" setup>
import BaseSelect from '~/components/base-select.vue'
import BaseInput from '~/components/base-input.vue'
import { TransactionType } from '#enums/TransactionType'
import { useCreateForm } from '~/composables/useCreateForm'
import { Head } from '@inertiajs/vue3'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'

defineProps<{
  categories: any
  referents: any
}>()

const { t } = useI18n()
const $q = useQuasar()

const { form } = useCreateForm({
  invoice: '',
  date: '',
  referent: null,
  categories: [],
  amountExcludingTax: 0,
  amountAllTax: 0,
  currency: 'EUR',
  comment: '',
  type: TransactionType.RECIPE,
  documents: [],
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
    if (newValue && !newValue.label) {
      form.referent = newValue
      return
    }
    form.referent = newValue.label
  },
})

const onClickSubmit = () => {
  if (form.type === TransactionType.SALARY) {
    form.amountExcludingTax = form.amountAllTax
  }

  form
    .transform((data) => ({
      ...data,
      categories: data.categories?.map((category) => category.value) ?? [],
    }))
    .post('/transaction')
}

const uploadInput = ref(null)
const onClickDropzone = () => {
  if (!uploadInput.value) return

  uploadInput.value.click()
}

const onFilesSelectedChanged = () => {
  const files = uploadInput.value?.files
  if (!files) return

  for (let i = 0; i < files.length; i++) {
    form.documents.push(files[i])
  }
}

const onDrop = (event: any) => {
  const files = event.dataTransfer.files
  if (!files) return

  for (let i = 0; i < files.length; i++) {
    form.documents.push(files[i])
  }
}

const onClickDeleteFile = (index: number) => {
  form.documents.splice(index, 1)
}
</script>

<style scoped>
.dropzone {
  height: 200px;
  width: 100%;
  border: 1px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: var(--q-primary);
    color: var(--q-primary);
  }
}
</style>
