<template>
  <div class="space-y-6">
    <PageHeader
      :title="quotation?.reference || 'ລາຍລະອຽດສະເໜີລາຄາປຽບທຽບ'"
      :description="
        quotation
          ? `${quotation.customerName} · ປຽບທຽບ ${quotation.productType || 'ປະກັນໄພ'}`
          : 'ກຳລັງໂຫຼດຂໍ້ມູນ'
      "
    >
      <template #actions>
        <BaseButton variant="secondary" icon="arrow_back" @click="router.back()">ກັບຄືນ</BaseButton>
        <BaseButton variant="secondary" icon="print" @click="toast.info('ພິມເອກະສານປຽບທຽບ (mock)')">
          ພິມໃບສະເໜີລາຄາ
        </BaseButton>
        <BaseButton
          icon="arrow_outward"
          @click="convertToPolicy(selectedOption || quotation?.options?.[0])"
        >
          ອອກປະກັນໄພຈາກໃບສະເໜີນີ້ ↗
        </BaseButton>
      </template>
    </PageHeader>

    <BaseSkeleton v-if="pending" height="xl" />
    <ErrorState v-else-if="error" :message="error" @retry="load" />

    <template v-else-if="quotation">
      <!-- ຂໍ້ມູນລູກຄ້າ ແລະ ຄວາມຕ້ອງການ -->
      <div class="grid gap-6 lg:grid-cols-3">
        <BaseCard class="lg:col-span-2">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold">ຂໍ້ມູນລູກຄ້າ ແລະ ຄວາມຕ້ອງການ</h2>
              <StatusBadge :status="quotation.status" />
            </div>
          </template>
          <dl class="grid gap-4 sm:grid-cols-3">
            <div>
              <dt class="text-xs text-muted">ລູກຄ້າ</dt>
              <dd class="mt-1 text-sm font-bold">{{ quotation.customerName }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ເບີໂທລະສັບ</dt>
              <dd class="mt-1 text-sm font-bold">{{ format.phone(quotation.customerPhone) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ປະເພດລູກຄ້າ</dt>
              <dd class="mt-1 text-sm font-bold">
                {{
                  quotation.customerType === 'corporate' ? 'ນິຕິບຸກຄົນ / ບໍລິສັດ' : 'ບຸກຄົນທົ່ວໄປ'
                }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ໝວດປະກັນໄພ</dt>
              <dd class="mt-1 text-sm font-bold">{{ quotation.productType }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ໃຊ້ໄດ້ຮອດວັນທີ</dt>
              <dd class="mt-1 text-sm font-bold">{{ format.date(quotation.validUntil) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ວັນທີສ້າງ</dt>
              <dd class="mt-1 text-sm font-bold">{{ format.date(quotation.createdAt) }}</dd>
            </div>
            <div
              v-if="quotation.vehicle?.make"
              class="sm:col-span-3 rounded-lg border border-line bg-surface-muted p-3"
            >
              <span class="text-xs font-semibold text-muted">ຂໍ້ມູນລົດ:</span>
              <span class="ml-2 text-sm font-bold">
                {{ quotation.vehicle.make }} {{ quotation.vehicle.model }} ({{
                  quotation.vehicle.year
                }})
                {{
                  quotation.vehicle.plateNumber ? `· ທະບຽນ ${quotation.vehicle.plateNumber}` : ''
                }}
              </span>
            </div>
          </dl>
        </BaseCard>

        <!-- ສະຫຼຸບ ແລະ ສະຖານະ -->
        <BaseCard>
          <template #header>
            <h2 class="text-sm font-bold">ການດຳເນີນການ</h2>
          </template>
          <div class="space-y-3">
            <div>
              <span class="text-xs text-muted">ເບ້ຍແນະນຳເລີ່ມຕົ້ນ:</span>
              <p class="mt-0.5 text-2xl font-bold text-primary-text tabular-nums">
                {{ format.currency(quotation.premium) }}
              </p>
            </div>
            <div class="space-y-2 pt-2 border-t border-line">
              <BaseButton block icon="check_circle" @click="acceptQuote">
                ລູກຄ້າຕົກລົງຍອມຮັບແຜນ
              </BaseButton>
              <BaseButton
                block
                variant="secondary"
                icon="share"
                @click="toast.info('ຄັດລອກລິ້ງແບ່ງປັນໃຫ້ລູກຄ້າແລ້ວ (mock)')"
              >
                ແບ່ງປັນໃຫ້ລູກຄ້າ (Share)
              </BaseButton>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- ຕາຕະລາງປຽບທຽບແຜນ (Multi-Insurer Comparison Cards) -->
      <BaseCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold">
                ຕາຕະລາງປຽບທຽບແຜນແຕ່ລະບໍລິສັດປະກັນ (Comparison Matrix)
              </h2>
              <p class="text-xs text-muted">
                ປຽບທຽບທຶນປະກັນ, ເງື່ອນໄຂ, ແລະ ເບ້ຍປະກັນສຸດທິລະຫວ່າງບໍລິສັດຄູ່ຄ້າ
              </p>
            </div>
            <span
              class="text-xs font-semibold rounded-full bg-primary/10 px-2.5 py-1 text-primary-text"
            >
              {{ displayOptions.length }} ຕົວເລືອກ
            </span>
          </div>
        </template>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="opt in displayOptions"
            :key="opt.id"
            class="flex flex-col justify-between rounded-xl border p-5 transition-all"
            :class="
              opt.isRecommended
                ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.02]'
                : 'border-line bg-surface'
            "
          >
            <div>
              <div class="flex items-start justify-between gap-2">
                <div>
                  <span
                    class="inline-block rounded-md bg-surface-muted px-2 py-0.5 text-[11px] font-bold text-muted"
                  >
                    {{ getCompanyName(opt.companyId) }}
                  </span>
                  <h3 class="mt-1 text-base font-bold">{{ opt.planName }}</h3>
                </div>
                <span
                  v-if="opt.isRecommended"
                  class="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary-text"
                >
                  ແນະນຳ ★
                </span>
              </div>

              <div class="mt-4 space-y-2 border-y border-line py-3 text-xs">
                <div class="flex justify-between">
                  <span class="text-muted">ທຶນປະກັນຄຸ້ມຄອງ:</span>
                  <span class="font-bold tabular-nums">
                    {{ opt.sumInsured ? format.currency(opt.sumInsured) : 'ຕາມມູນຄ່າລົດ' }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">ຄ່າເສຍຫາຍສ່ວນທຳອິດ:</span>
                  <span class="font-bold tabular-nums">
                    {{ opt.deductible ? format.currency(opt.deductible) : 'ບໍ່ມີ (0 ₭)' }}
                  </span>
                </div>
                <div v-if="opt.discountPercent" class="flex justify-between text-danger">
                  <span>ສ່ວນຫຼຸດພິເສດ:</span>
                  <span class="font-bold">-{{ opt.discountPercent }}%</span>
                </div>
              </div>

              <div v-if="opt.highlights" class="mt-3 text-xs text-muted">
                <p class="font-semibold text-primary-text">ຈຸດເດັ່ນຄວາມຄຸ້ມຄອງ:</p>
                <p class="mt-0.5 leading-relaxed">{{ opt.highlights }}</p>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-line">
              <span class="text-xs text-muted">ເບ້ຍປະກັນລວມສຸດທິ:</span>
              <p class="mt-1 text-2xl font-bold text-primary-text tabular-nums">
                {{ format.currency(opt.totalPremium || opt.basePremium || quotation.premium) }}
              </p>

              <BaseButton
                block
                class="mt-3"
                :variant="opt.isRecommended ? 'primary' : 'secondary'"
                icon="arrow_forward"
                @click="convertToPolicy(opt)"
              >
                ເລືອກແຜນນີ້ ແລະ ອອກປະກັນ ↗
              </BaseButton>
            </div>
          </div>
        </div>
      </BaseCard>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { navigateTo, useRoute, useRouter } from '#app'
import { useQuotations } from '~/composables/api/useQuotations'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'
import { companies } from '~/mocks/companies'

definePageMeta({
  layout: 'admin',
  title: 'ລາຍລະອຽດໃບສະເໜີລາຄາປຽບທຽບ',
  permission: 'quotation.view',
})

const route = useRoute()
const router = useRouter()
const format = useFormat()
const toast = useToast()
const { getById } = useQuotations({ immediate: false })

const quotation = ref(null)
const pending = ref(true)
const error = ref('')
const selectedOption = ref(null)

const getCompanyName = (companyId) => {
  const match = companies.find((c) => c.id === Number(companyId))
  return match ? `${match.code} - ${match.name}` : 'ບໍລິສັດປະກັນໄພ'
}

const displayOptions = computed(() => {
  if (quotation.value?.options && quotation.value.options.length > 0) {
    return quotation.value.options
  }
  // Fallback ຖ້າເປັນຂໍ້ມູນເກົ່າ
  return [
    {
      id: 1,
      companyId: quotation.value?.companyId || 1,
      planName: quotation.value?.productName || 'ແຜນປະກັນໄພ',
      sumInsured: 150000000,
      deductible: 0,
      basePremium: quotation.value?.premium || 2500000,
      totalPremium: quotation.value?.premium || 2500000,
      highlights: quotation.value?.notes || 'ຄຸ້ມຄອງຕາມເງື່ອນໄຂມາດຕະຖານ',
      isRecommended: true,
    },
  ]
})

const load = async () => {
  pending.value = true
  error.value = ''
  try {
    quotation.value = await getById(route.params.id)
  } catch (requestError) {
    error.value = requestError?.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້'
  } finally {
    pending.value = false
  }
}

const acceptQuote = () => {
  if (quotation.value) {
    quotation.value.status = 'accepted'
    toast.success('ອັບເດດສະຖານະ: ລູກຄ້າຍອມຮັບໃບສະເໜີລາຄາແລ້ວ')
  }
}

const convertToPolicy = (opt) => {
  const targetOption = opt || displayOptions.value[0]
  navigateTo({
    path: '/policies/create',
    query: {
      quotationId: route.params.id,
      companyId: targetOption?.companyId,
      planName: targetOption?.planName,
      premium: targetOption?.totalPremium || targetOption?.basePremium,
    },
  })
}

onMounted(load)
</script>
