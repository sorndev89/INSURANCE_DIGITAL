<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <PageHeader title="ສ້າງໃບສະເໜີລາຄາ" description="ປ້ອນຂໍ້ມູນເພື່ອສ້າງໃບສະເໜີລາຄາໃຫ້ລູກຄ້າ." />

    <BaseCard>
      <form class="space-y-4" @submit.prevent="submit">
        <div class="grid gap-4 sm:grid-cols-2">
          <BaseInput
            v-model="form.customerName"
            label="ຊື່ລູກຄ້າ"
            required
            :error="errors.customerName"
          />
          <BaseInput v-model="form.customerPhone" label="ເບີໂທ" prefix-icon="phone" />
          <BaseSelect
            v-model="form.productType"
            label="ປະເພດປະກັນໄພ"
            :options="PRODUCT_TYPES"
            required
            :error="errors.productType"
          />
          <BaseInput v-model="form.productName" label="ຊື່ແຜນ" placeholder="ລົດຍົນ ຊັ້ນ 1" />
          <BaseInput
            v-model="form.premium"
            type="number"
            label="ເບ້ຍປະກັນ (₭)"
            required
            :error="errors.premium"
          />
          <BaseInput
            v-model="form.validUntil"
            type="date"
            label="ໃຊ້ໄດ້ຮອດ"
            required
            :error="errors.validUntil"
          />
        </div>
        <BaseTextarea v-model="form.note" label="ໝາຍເຫດ" placeholder="ເງື່ອນໄຂເພີ່ມເຕີມ..." />
        <div class="flex justify-end gap-2 border-t border-line pt-4">
          <BaseButton variant="secondary" @click="router.back()">ຍົກເລີກ</BaseButton>
          <BaseButton type="submit" icon="save" :loading="saving">ບັນທຶກຮ່າງ</BaseButton>
        </div>
      </form>
    </BaseCard>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { navigateTo, useRouter } from '#app'
import { useQuotations } from '~/composables/api/useQuotations'
import { useToast } from '~/composables/useToast'
import { PRODUCT_TYPES } from '~/utils/constants'
import { numeric, required, validate } from '~/utils/validators'

definePageMeta({
  layout: 'admin',
  title: 'ສ້າງໃບສະເໜີລາຄາ',
  permission: 'quotation.create',
})

const router = useRouter()
const toast = useToast()
const { create } = useQuotations({ immediate: false })

const saving = ref(false)
const form = reactive({
  customerName: '',
  customerPhone: '',
  productType: 'Motor',
  productName: '',
  premium: '',
  validUntil: '',
  note: '',
})
const errors = reactive({
  customerName: '',
  productType: '',
  premium: '',
  validUntil: '',
})

const submit = async () => {
  errors.customerName = required(form.customerName)
  errors.productType = required(form.productType)
  errors.premium = form.premium
    ? validate(form.premium, [required, numeric])
    : required(form.premium)
  errors.validUntil = required(form.validUntil)
  if (Object.values(errors).some(Boolean)) return

  saving.value = true
  try {
    await create({
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      productType: form.productType,
      productName: form.productName || form.productType,
      premium: Number(form.premium),
      validUntil: form.validUntil,
      note: form.note,
    })
    toast.success('ສ້າງສະເໜີລາຄາສຳເລັດ')
    await navigateTo('/quotations')
  } catch (requestError) {
    toast.error(requestError?.message || 'ບໍ່ສາມາດສ້າງສະເໜີລາຄາໄດ້')
  } finally {
    saving.value = false
  }
}
</script>
