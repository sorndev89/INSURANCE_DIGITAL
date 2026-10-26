<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <PageHeader title="ແຈ້ງເຄມໃໝ່" description="ສົ່ງຂໍ້ມູນເຄມເພື່ອໃຫ້ທີມງານກວດສອບ." />

    <BaseCard>
      <form class="space-y-4" @submit.prevent="submit">
        <div class="grid gap-4 sm:grid-cols-2">
          <BaseInput
            v-model="form.policyNumber"
            label="ເລກປະກັນໄພ"
            placeholder="P-2026-000001"
            required
            :error="errors.policyNumber"
          />
          <BaseSelect
            v-model="form.type"
            label="ປະເພດເຄມ"
            :options="PRODUCT_TYPES"
            required
            :error="errors.type"
          />
          <BaseInput v-model="form.claimant" label="ຊື່ຜູ້ແຈ້ງ" required :error="errors.claimant" />
          <BaseInput
            v-model="form.incidentDate"
            type="date"
            label="ວັນທີເກີດເຫດ"
            required
            :error="errors.incidentDate"
          />
          <BaseInput
            v-model="form.amount"
            type="number"
            label="ມູນຄ່າປະເມີນ (₭)"
            required
            :error="errors.amount"
          />
          <BaseInput v-model="form.coverageLimit" type="number" label="ວົງເງິນຄຸ້ມຄອງ (₭)" />
        </div>
        <BaseTextarea
          v-model="form.description"
          label="ລາຍລະອຽດ"
          placeholder="ອະທິບາຍຄວາມເສຍຫາຍ..."
        />
        <FileUpload
          v-model="form.attachment"
          label="ເອກະສານປະກອບ"
          hint="ຮູບພາບ ຫຼື PDF, ສູງສຸດ 5 MB"
          auto-upload
          @uploaded="uploadedAttachment = $event"
        />

        <div class="flex justify-end gap-2 border-t border-line pt-4">
          <BaseButton variant="secondary" @click="router.back()">ຍົກເລີກ</BaseButton>
          <BaseButton type="submit" icon="send" :loading="saving">ສົ່ງແຈ້ງເຄມ</BaseButton>
        </div>
      </form>
    </BaseCard>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { navigateTo, useRouter } from '#app'
import { useClaims } from '~/composables/api/useClaims'
import { useFileUpload } from '~/composables/useFileUpload'
import { useToast } from '~/composables/useToast'
import { PRODUCT_TYPES } from '~/utils/constants'
import { numeric, required, validate } from '~/utils/validators'

definePageMeta({
  layout: 'admin',
  title: 'ແຈ້ງເຄມໃໝ່',
  permission: 'claim.create',
})

const router = useRouter()
const toast = useToast()
const { create } = useClaims({ immediate: false })
const { upload } = useFileUpload()

const saving = ref(false)
const uploadedAttachment = ref(null)
const form = reactive({
  policyNumber: '',
  type: 'Motor',
  claimant: '',
  incidentDate: '',
  amount: '',
  coverageLimit: '',
  description: '',
  attachment: null,
})
const errors = reactive({
  policyNumber: '',
  type: '',
  claimant: '',
  incidentDate: '',
  amount: '',
})

const submit = async () => {
  errors.policyNumber = required(form.policyNumber)
  errors.type = required(form.type)
  errors.claimant = required(form.claimant)
  errors.incidentDate = required(form.incidentDate)
  errors.amount = form.amount ? validate(form.amount, [required, numeric]) : required(form.amount)
  if (Object.values(errors).some(Boolean)) return

  saving.value = true
  try {
    let attachment = uploadedAttachment.value
    if (form.attachment && !attachment?.url) {
      attachment = await upload(form.attachment)
    }
    await create({
      policyNumber: form.policyNumber,
      type: form.type,
      claimant: form.claimant,
      incidentDate: form.incidentDate,
      amount: Number(form.amount),
      coverageLimit: Number(form.coverageLimit) || 0,
      description: form.description,
      attachments: attachment?.url ? [attachment.url] : [],
    })
    toast.success('ສົ່ງແຈ້ງເຄມສຳເລັດ')
    await navigateTo('/claims')
  } catch (requestError) {
    toast.error(requestError?.message || 'ບໍ່ສາມາດສົ່ງແຈ້ງເຄມໄດ້')
  } finally {
    saving.value = false
  }
}
</script>
