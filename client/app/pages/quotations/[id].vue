<template>
  <div class="space-y-6">
    <PageHeader
      :title="quotation?.reference || 'ລາຍລະອຽດສະເໜີລາຄາ'"
      :description="
        quotation ? `${quotation.customerName} · ${quotation.productName}` : 'ກຳລັງໂຫຼດຂໍ້ມູນ'
      "
    >
      <template #actions>
        <BaseButton variant="secondary" icon="arrow_back" @click="router.back()">ກັບຄືນ</BaseButton>
        <BaseButton
          icon="arrow_outward"
          @click="navigateTo({ path: '/policies/create', query: { quotationId: route.params.id } })"
          >ອອກປະກັນໄພຈາກໃບສະເໜີນີ້ ↗</BaseButton
        >
      </template>
    </PageHeader>

    <BaseSkeleton v-if="pending" height="xl" />
    <ErrorState v-else-if="error" :message="error" @retry="load" />

    <template v-else-if="quotation">
      <div class="grid gap-6 lg:grid-cols-3">
        <BaseCard class="lg:col-span-2">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold">ຂໍ້ມູນສະເໜີລາຄາ</h2>
              <StatusBadge :status="quotation.status" />
            </div>
          </template>
          <dl class="grid gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-xs text-muted">ລູກຄ້າ</dt>
              <dd class="mt-1 text-sm font-bold">{{ quotation.customerName }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ເບີໂທ</dt>
              <dd class="mt-1 text-sm font-bold">{{ format.phone(quotation.customerPhone) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ປະເພດ</dt>
              <dd class="mt-1 text-sm font-bold">{{ quotation.productType }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ໃຊ້ໄດ້ຮອດ</dt>
              <dd class="mt-1 text-sm font-bold">{{ format.date(quotation.validUntil) }}</dd>
            </div>
            <div class="sm:col-span-2">
              <dt class="text-xs text-muted">ເບ້ຍປະກັນ</dt>
              <dd class="mt-1 text-2xl font-bold tabular-nums text-primary-text">
                {{ format.currency(quotation.premium) }}
              </dd>
            </div>
          </dl>
        </BaseCard>
        <BaseCard>
          <template #header>
            <h2 class="text-sm font-bold">ການດຳເນີນການ</h2>
          </template>
          <div class="space-y-2">
            <BaseButton block variant="secondary" icon="print" @click="toast.info('ພິມ (mock)')"
              >ພິມ</BaseButton
            >
            <BaseButton block icon="check_circle" @click="toast.success('ຍອມຮັບສະເໜີລາຄາ (mock)')"
              >ຍອມຮັບ</BaseButton
            >
          </div>
        </BaseCard>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { navigateTo, useRoute, useRouter } from '#app'
import { useQuotations } from '~/composables/api/useQuotations'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ລາຍລະອຽດສະເໜີລາຄາ',
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

onMounted(load)
</script>
