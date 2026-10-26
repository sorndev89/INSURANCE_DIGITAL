<template>
  <div class="space-y-6">
    <PageHeader
      :title="claim?.claimNumber || 'ລາຍລະອຽດເຄມ'"
      :description="
        claim
          ? `${claim.type} · ${claim.policyNumber} · ${claim.companyName || 'ບໍລິສັດຄູ່ຄ້າ'}`
          : 'ກຳລັງໂຫຼດຂໍ້ມູນ'
      "
    >
      <template #actions>
        <BaseButton variant="secondary" icon="arrow_back" @click="router.back()">ກັບຄືນ</BaseButton>
        <template v-if="claim && canProcess">
          <BaseButton
            v-if="claim.status === 'pending' || claim.status === 'submitted_to_insurer'"
            variant="secondary"
            icon="search"
            @click="setStatus('surveyor_assigned')"
          >
            ກວດກາຄວາມເສຍຫາຍ
          </BaseButton>
          <BaseButton
            v-if="claim.status !== 'approved' && claim.status !== 'settled'"
            icon="check_circle"
            @click="setStatus('approved')"
          >
            ອະນຸມັດເຄມ
          </BaseButton>
          <BaseButton
            v-if="claim.status === 'approved' || claim.status === 'repairing'"
            icon="task_alt"
            @click="setStatus('settled')"
          >
            ຊົດເຊີຍສຳເລັດ (Settled)
          </BaseButton>
          <BaseButton
            v-if="claim.status !== 'rejected' && claim.status !== 'closed'"
            variant="danger"
            icon="cancel"
            @click="setStatus('rejected')"
          >
            ປະຕິເສດ
          </BaseButton>
        </template>
      </template>
    </PageHeader>

    <div v-if="pending" class="grid gap-4 lg:grid-cols-3">
      <BaseSkeleton v-for="index in 3" :key="index" height="xl" />
    </div>

    <ErrorState v-else-if="error" :message="error" @retry="load" />

    <template v-else-if="claim">
      <BaseCard flush>
        <div class="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-lg font-bold">{{ claim.claimNumber }}</h2>
              <StatusBadge :status="claim.status" />
              <span
                v-if="claim.insurerClaimNo"
                class="rounded-md bg-surface-muted px-2 py-0.5 text-xs font-mono font-bold text-primary-text"
              >
                ເລກເຄມບໍລິສັດ: {{ claim.insurerClaimNo }}
              </span>
            </div>
            <p class="mt-1 text-sm text-muted">
              {{ claim.claimant }} · {{ claim.policyNumber }} · ບໍລິສັດ:
              {{ claim.companyName || '—' }}
            </p>
          </div>
          <div class="md:text-right">
            <p class="text-xs text-muted">ມູນຄ່າປະເມີນຄວາມເສຍຫາຍ</p>
            <p class="text-2xl font-bold tabular-nums text-danger">
              {{ format.currency(claim.amount) }}
            </p>
          </div>
        </div>
      </BaseCard>

      <div class="grid gap-6 lg:grid-cols-3">
        <BaseCard class="lg:col-span-2">
          <template #header>
            <h2 class="text-sm font-bold">ລາຍລະອຽດອຸບັດຕິເຫດ ແລະ ການປະສານງານ</h2>
          </template>
          <dl class="grid gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-xs text-muted">ຜູ້ແຈ້ງເຄມ</dt>
              <dd class="mt-1 text-sm font-bold">{{ claim.claimant }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ເບີໂທລະສັບຜູ້ແຈ້ງ</dt>
              <dd class="mt-1 text-sm font-bold">{{ format.phone(claim.claimantPhone) || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ເລກກົມມະທັນ</dt>
              <dd class="mt-1 text-sm font-bold">{{ claim.policyNumber }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ບໍລິສັດປະກັນໄພຜູ້ຮັບປະກັນ</dt>
              <dd class="mt-1 text-sm font-bold text-primary-text">
                {{ claim.companyName || '—' }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ວັນທີ ແລະ ເວລາເກີດເຫດ</dt>
              <dd class="mt-1 text-sm font-bold">
                {{ format.date(claim.incidentDate) }}
                {{ claim.incidentTime ? `· ${claim.incidentTime}` : '' }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ສະຖານທີ່ / ແຂວງ</dt>
              <dd class="mt-1 text-sm font-bold">{{ claim.incidentProvince || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ຜູ້ຂັບຂີ່ຂະນະເກີດເຫດ</dt>
              <dd class="mt-1 text-sm font-bold">
                {{ claim.driverName || '—' }}
                {{ claim.driverLicenseNo ? `(ໃບຂັບຂີ່: ${claim.driverLicenseNo})` : '' }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ອູ່ສ້ອມແປງ / ສູນບໍລິການ / ໂຮງໝໍ</dt>
              <dd class="mt-1 text-sm font-bold">{{ claim.repairGarage || 'ຍັງບໍ່ທັນລະບຸ' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ວົງເງິນຄຸ້ມຄອງຕາມສັນຍາ</dt>
              <dd class="mt-1 text-sm font-bold">{{ format.currency(claim.coverageLimit) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ວັນທີບັນທຶກແຈ້ງເຄມ</dt>
              <dd class="mt-1 text-sm font-bold">{{ format.date(claim.createdAt) }}</dd>
            </div>
            <div
              v-if="claim.description"
              class="sm:col-span-2 rounded-lg border border-line bg-surface-muted p-3"
            >
              <span class="text-xs text-muted font-semibold">ລາຍລະອຽດເຫດການ:</span>
              <p class="mt-1 text-sm">{{ claim.description }}</p>
            </div>
          </dl>
        </BaseCard>

        <!-- Sidebar ເອກະສານ & ຕິດຕາມ -->
        <div class="space-y-6">
          <BaseCard>
            <template #header>
              <h2 class="text-sm font-bold">ເອກະສານ ແລະ ຫຼັກຖານປະກອບ</h2>
            </template>
            <ul v-if="claim.attachments?.length" class="space-y-2">
              <li
                v-for="(file, index) in claim.attachments"
                :key="`${attachmentName(file)}-${index}`"
                class="flex items-center gap-2 rounded-lg border border-line p-2"
              >
                <BaseIcon name="description" size="sm" class="text-muted" />
                <span class="min-w-0 flex-1 truncate text-xs font-bold">
                  {{ attachmentName(file) }}
                </span>
                <BaseButton
                  variant="ghost"
                  size="sm"
                  icon-only
                  label="ດາວໂຫຼດ"
                  icon="download"
                  @click="downloadAttachment(file)"
                />
              </li>
            </ul>
            <p v-else class="text-sm text-muted">ບໍ່ມີເອກະສານ.</p>
          </BaseCard>

          <BaseCard>
            <template #header>
              <h2 class="text-sm font-bold">ສະຖານະການຕິດຕາມ (Workflow)</h2>
            </template>
            <div class="space-y-3 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-muted">ສະຖານະປັດຈຸບັນ:</span>
                <StatusBadge :status="claim.status" />
              </div>
              <div class="border-t border-line pt-3 space-y-1 text-muted">
                <p>• ຮັບເລື່ອງແລ້ວ</p>
                <p>• ປະສານງານກັບບໍລິສັດປະກັນ</p>
                <p>• ຕິດຕາມການສ້ອມແປງ / ຊົດເຊີຍ</p>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </template>

    <EmptyState
      v-else
      icon="search_off"
      title="ບໍ່ພົບເຄມ"
      description="ເຄມນີ້ອາດຖືກລຶບ ຫຼື ບໍ່ມີໃນລະບົບ."
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from '#app'
import { useRuntimeConfig } from '#imports'
import { useClaims } from '~/composables/api/useClaims'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'
import { attachmentName, resolveAttachmentUrl } from '~/utils/uploads'

definePageMeta({
  layout: 'admin',
  title: 'ລາຍລະອຽດເຄມ (Broker Claim View)',
  permission: 'claim.view',
})

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const auth = useAuthStore()
const format = useFormat()
const toast = useToast()
const { getById, updateStatus, refresh } = useClaims({ immediate: false })

const claim = ref(null)
const pending = ref(true)
const error = ref('')
const canProcess = computed(() => auth.can('claim.process'))

const load = async () => {
  pending.value = true
  error.value = ''
  try {
    claim.value = await getById(route.params.id)
  } catch (requestError) {
    error.value = requestError?.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້'
  } finally {
    pending.value = false
  }
}

const downloadAttachment = (file) => {
  const url = resolveAttachmentUrl(
    typeof file === 'string' ? file : file?.url,
    config.public.apiBase,
  )
  if (!url || !import.meta.client) {
    toast.warning('ເອກະສານນີ້ບໍ່ມີໄຟລ໌ສຳລັບດາວໂຫຼດ')
    return
  }
  window.open(url, '_blank', 'noopener')
}

const setStatus = async (status) => {
  await updateStatus(claim.value.id, status)
  claim.value.status = status
  toast.success(`ອັບເດດສະຖານະເຄມເປັນ: ${status}`)
  refresh()
}

onMounted(load)
</script>
