<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <PageHeader
      title="ແຈ້ງເຄມ ແລະ ປະສານງານສິນໄໝ (Broker Claim Intake)"
      description="ບັນທຶກຂໍ້ມູນອຸບັດຕິເຫດຈາກລູກຄ້າ ເພື່ອສົ່ງຕໍ່ປະສານງານກັບບໍລິສັດປະກັນໄພ ແລະ ອູ່ສ້ອມແປງ."
    />

    <BaseCard>
      <form class="space-y-6" @submit.prevent="submit">
        <!-- 1. ຂໍ້ມູນກົມມະທັນ ແລະ ບໍລິສັດປະກັນໄພ -->
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b border-line pb-2">
            <h2 class="text-sm font-bold uppercase tracking-wider text-muted">
              1. ຂໍ້ມູນກົມມະທັນ ແລະ ບໍລິສັດປະກັນ
            </h2>
            <span class="text-xs text-muted">Policy & Insurer Info</span>
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <BaseInput
              v-model="form.policyNumber"
              label="ເລກກົມມະທັນ (Broker Policy No.)"
              placeholder="P-2026-000001"
              required
              :error="errors.policyNumber"
              @blur="onPolicyBlur"
            />
            <BaseInput
              v-model="form.insurerPolicyNumber"
              label="ເລກກົມມະທັນບໍລິສັດ (Insurer Policy No.)"
              placeholder="DHP-..."
            />
            <BaseSelect
              v-model="form.companyId"
              label="ບໍລິສັດປະກັນໄພຜູ້ຮັບປະກັນ"
              :options="companyOptions"
              required
            />
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <BaseSelect
              v-model="form.type"
              label="ໝວດປະກັນໄພ"
              :options="PRODUCT_TYPES"
              required
              :error="errors.type"
            />
            <BaseInput
              v-model="form.claimant"
              label="ຊື່ຜູ້ແຈ້ງເຄມ / ລູກຄ້າ"
              placeholder="ສົມສັກ ບຸນທະວີ"
              required
              :error="errors.claimant"
            />
            <BaseInput
              v-model="form.claimantPhone"
              label="ເບີໂທລະສັບຜູ້ແຈ້ງ"
              placeholder="020 5555 1234"
              prefix-icon="phone"
            />
          </div>
        </div>

        <!-- 2. ລາຍລະອຽດອຸບັດຕິເຫດ ແລະ ສະຖານທີ່ -->
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b border-line pb-2">
            <h2 class="text-sm font-bold uppercase tracking-wider text-muted">
              2. ລາຍລະອຽດອຸບັດຕິເຫດ
            </h2>
            <span class="text-xs text-muted">Incident Particulars</span>
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <BaseInput
              v-model="form.incidentDate"
              type="date"
              label="ວັນທີເກີດເຫດ"
              required
              :error="errors.incidentDate"
            />
            <BaseInput v-model="form.incidentTime" type="time" label="ເວລາເກີດເຫດ" />
            <BaseSelect
              v-model="form.incidentProvince"
              label="ແຂວງທີ່ເກີດເຫດ"
              :options="LAO_PROVINCES"
            />
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <BaseInput
              v-model="form.driverName"
              label="ຊື່ຜູ້ຂັບຂີ່ຂະນະເກີດເຫດ"
              placeholder="ຊື່ຄົນຂັບ"
            />
            <BaseInput
              v-model="form.driverLicenseNo"
              label="ເລກໃບຂັບຂີ່ຜູ້ຂັບ"
              placeholder="ໃບຂັບຂີ່..."
            />
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <BaseInput
              v-model="form.amount"
              type="number"
              label="ມູນຄ່າປະເມີນຄວາມເສຍຫາຍ (₭)"
              placeholder="10,000,000"
              required
              :error="errors.amount"
            />
            <BaseInput
              v-model="form.coverageLimit"
              type="number"
              label="ວົງເງິນຄຸ້ມຄອງຕາມກົມມະທັນ (₭)"
              placeholder="150,000,000"
            />
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <BaseInput
              v-model="form.repairGarage"
              label="ອູ່ສ້ອມແປງ / ສູນບໍລິການ / ໂຮງໝໍ"
              placeholder="ເຊັ່ນ: ອູ່ສ້ອມແປງມິດຕະພາບ, ສູນໂຕໂຢຕ້າ, ໂຮງໝໍມິດຕະພາບ"
            />
            <BaseInput
              v-model="form.insurerClaimNo"
              label="ເລກເຄມຂອງບໍລິສັດປະກັນ (ຖ້າມີ)"
              placeholder="CLM-DHP-..."
            />
          </div>

          <BaseTextarea
            v-model="form.description"
            label="ລາຍລະອຽດເຫດການ ແລະ ສະພາບຄວາມເສຍຫາຍ"
            placeholder="ອະທິບາຍລັກສະນະການເກີດເຫດ, ຄູ່ກໍລະນີ, ແລະ ຄວາມເສຍຫາຍເບື້ອງຕົ້ນ..."
          />
        </div>

        <!-- 3. ເອກະສານປະກອບການເຄມ -->
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b border-line pb-2">
            <h2 class="text-sm font-bold uppercase tracking-wider text-muted">
              3. ເອກະສານ ແລະ ຮູບພາບປະກອບ
            </h2>
            <span class="text-xs text-muted">Supporting Evidence</span>
          </div>

          <FileUpload
            v-model="form.attachment"
            label="ຮູບຖ່າຍຈຸດເກີດເຫດ, ໃບແຈ້ງຄວາມຕຳຫຼວດ, ຫຼື ໃບປະເມີນລາຄາອູ່"
            hint="ຮູບພາບ ຫຼື PDF, ສູງສຸດ 5 MB"
            auto-upload
            @uploaded="uploadedAttachment = $event"
          />
        </div>

        <div class="flex justify-end gap-3 border-t border-line pt-4">
          <BaseButton variant="secondary" @click="router.back()">ຍົກເລີກ</BaseButton>
          <BaseButton type="submit" icon="send" :loading="saving">
            ບັນທຶກ ແລະ ສົ່ງຕໍ່ບໍລິສັດປະກັນ
          </BaseButton>
        </div>
      </form>
    </BaseCard>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { navigateTo, useRoute, useRouter } from '#app'
import { useClaims } from '~/composables/api/useClaims'
import { usePolicies } from '~/composables/api/usePolicies'
import { useFileUpload } from '~/composables/useFileUpload'
import { useToast } from '~/composables/useToast'
import { LAO_PROVINCES, PRODUCT_TYPES } from '~/utils/constants'
import { companies } from '~/mocks/companies'
import { numeric, required, validate } from '~/utils/validators'

definePageMeta({
  layout: 'admin',
  title: 'ແຈ້ງເຄມໃໝ່ (Broker)',
  permission: 'claim.create',
})

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { create } = useClaims({ immediate: false })
const { getById: getPolicy } = usePolicies({ immediate: false })
const { upload } = useFileUpload()

const saving = ref(false)
const uploadedAttachment = ref(null)

const companyOptions = companies.map((c) => ({
  value: c.id,
  label: `${c.code} - ${c.name}`,
}))

const form = reactive({
  policyNumber: '',
  insurerPolicyNumber: '',
  companyId: 1,
  type: 'Motor',
  claimant: '',
  claimantPhone: '',
  incidentDate: new Date().toISOString().slice(0, 10),
  incidentTime: '10:00',
  incidentProvince: 'Vientiane Capital',
  driverName: '',
  driverLicenseNo: '',
  amount: '',
  coverageLimit: '',
  repairGarage: '',
  insurerClaimNo: '',
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

const onPolicyBlur = async () => {
  // ຖ້າມີການປ້ອນ policy number ສາມາດ prefill ໄດ້
}

const loadPrefill = async () => {
  const policyId = route.query.policyId
  if (policyId) {
    try {
      const pol = await getPolicy(policyId)
      if (pol) {
        form.policyNumber = pol.policyNumber || ''
        form.insurerPolicyNumber = pol.insurerPolicyNumber || ''
        form.claimant = pol.customerName || ''
        form.claimantPhone = pol.customerPhone || ''
        form.type = pol.productType || 'Motor'
        form.coverageLimit = pol.sumInsured || pol.totalPremium || ''
        if (pol.insuranceCompanyId) {
          form.companyId = pol.insuranceCompanyId
        }
        toast.info('ດຶງຂໍ້ມູນກົມມະທັນມາກຽມແຈ້ງເຄມແລ້ວ')
      }
    } catch {
      // ignore
    }
  }
}

const submit = async () => {
  errors.policyNumber = required(form.policyNumber)
  errors.type = required(form.type)
  errors.claimant = required(form.claimant)
  errors.incidentDate = required(form.incidentDate)
  errors.amount = form.amount ? validate(form.amount, [required, numeric]) : required(form.amount)

  if (Object.values(errors).some(Boolean)) {
    toast.error('ກະລຸນາຕື່ມຂໍ້ມູນທີ່ຈຳເປັນໃຫ້ຄົບຖ້ວນ')
    return
  }

  saving.value = true
  try {
    let attachment = uploadedAttachment.value
    if (form.attachment && !attachment?.url) {
      attachment = await upload(form.attachment)
    }

    const selectedCompany = companies.find((c) => c.id === form.companyId)

    await create({
      policyNumber: form.policyNumber,
      insurerPolicyNumber: form.insurerPolicyNumber,
      companyId: form.companyId,
      companyName: selectedCompany?.name || 'ບໍລິສັດປະກັນໄພ',
      type: form.type,
      claimant: form.claimant,
      claimantPhone: form.claimantPhone,
      incidentDate: form.incidentDate,
      incidentTime: form.incidentTime,
      incidentProvince: form.incidentProvince,
      driverName: form.driverName,
      driverLicenseNo: form.driverLicenseNo,
      amount: Number(form.amount),
      coverageLimit: Number(form.coverageLimit) || 0,
      repairGarage: form.repairGarage,
      insurerClaimNo: form.insurerClaimNo,
      description: form.description,
      status: 'submitted_to_insurer', // Broker ສົ່ງຕໍ່ຫາບໍລິສັດປະກັນ
      attachments: attachment?.url ? [attachment.url] : [],
    })

    toast.success('ບັນທຶກການແຈ້ງເຄມ ແລະ ສົ່ງຕໍ່ບໍລິສັດປະກັນສຳເລັດ')
    await navigateTo('/claims')
  } catch (requestError) {
    toast.error(requestError?.message || 'ບໍ່ສາມາດສົ່ງແຈ້ງເຄມໄດ້')
  } finally {
    saving.value = false
  }
}

onMounted(loadPrefill)
</script>
