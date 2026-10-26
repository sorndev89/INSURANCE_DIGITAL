<template>
  <div class="space-y-6">
    <PageHeader
      :title="customer?.fullName || 'ລາຍລະອຽດລູກຄ້າ'"
      :description="
        customer ? `${customer.code} · ${customer.occupation || 'ລູກຄ້າ'}` : 'ກຳລັງໂຫຼດຂໍ້ມູນ'
      "
    >
      <template #actions>
        <BaseButton variant="secondary" icon="arrow_back" @click="router.back()">ກັບຄືນ</BaseButton>
        <BaseButton icon="add_circle" @click="navigateTo('/policies/create')"
          >ເຮັດປະກັນໄພ</BaseButton
        >
      </template>
    </PageHeader>

    <div v-if="pending" class="grid gap-4 lg:grid-cols-3">
      <BaseSkeleton v-for="index in 3" :key="index" height="xl" />
    </div>

    <ErrorState v-else-if="error" :message="error" @retry="load" />

    <template v-else-if="customer">
      <div class="grid gap-6 lg:grid-cols-3">
        <BaseCard class="lg:col-span-2">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold">ຂໍ້ມູນສ່ວນຕົວ</h2>
              <StatusBadge :status="customer.status" />
            </div>
          </template>
          <div class="flex items-center gap-4">
            <BaseAvatar :name="customer.fullName" size="lg" />
            <div>
              <p class="text-lg font-bold">{{ customer.fullName }}</p>
              <p class="text-sm text-muted">{{ customer.code }}</p>
            </div>
          </div>
          <dl class="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-xs text-muted">ເບີໂທ</dt>
              <dd class="mt-1 text-sm font-bold">{{ format.phone(customer.phone) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ອີເມວ</dt>
              <dd class="mt-1 text-sm font-bold">{{ customer.email || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ວັນເດືອນປີເກີດ</dt>
              <dd class="mt-1 text-sm font-bold">
                {{ customer.dob ? format.date(customer.dob) : '—' }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ເພດ</dt>
              <dd class="mt-1 text-sm font-bold">
                {{
                  customer.gender === 'female' ? 'ຍິງ' : customer.gender === 'male' ? 'ຊາຍ' : '—'
                }}
              </dd>
            </div>
            <div class="sm:col-span-2">
              <dt class="text-xs text-muted">ທີ່ຢູ່</dt>
              <dd class="mt-1 text-sm font-bold">{{ customer.address || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ເອກະສານຢືນຢັນ</dt>
              <dd class="mt-1 text-sm font-bold">{{ customer.idCardNumber || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ອາຊີບ</dt>
              <dd class="mt-1 text-sm font-bold">{{ customer.occupation || '—' }}</dd>
            </div>
          </dl>
        </BaseCard>

        <div class="space-y-6">
          <StatCard
            label="ປະກັນໄພທັງໝົດ"
            :value="format.number(customer.policiesCount)"
            icon="description"
            highlight
          />
          <BaseCard>
            <template #header>
              <h2 class="text-sm font-bold">ການດຳເນີນການ</h2>
            </template>
            <div class="space-y-2">
              <BaseButton
                block
                variant="secondary"
                icon="edit"
                @click="toast.info('ຟອມແກ້ໄຂຈະມາໃນໄວໆນີ້')"
                >ແກ້ໄຂຂໍ້ມູນ</BaseButton
              >
              <BaseButton
                block
                variant="secondary"
                icon="description"
                @click="navigateTo('/policies')"
                >ເບິ່ງປະກັນໄພ</BaseButton
              >
            </div>
          </BaseCard>
        </div>
      </div>
    </template>

    <EmptyState
      v-else
      icon="person_off"
      title="ບໍ່ພົບລູກຄ້າ"
      description="ລູກຄ້ານີ້ອາດຖືກລຶບ ຫຼື ບໍ່ມີໃນລະບົບ."
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { navigateTo, useRoute, useRouter } from '#app'
import { useCustomers } from '~/composables/api/useCustomers'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ລາຍລະອຽດລູກຄ້າ',
  permission: 'customer.view',
})

const route = useRoute()
const router = useRouter()
const format = useFormat()
const toast = useToast()
const { getById } = useCustomers({ immediate: false })

const customer = ref(null)
const pending = ref(true)
const error = ref('')

const load = async () => {
  pending.value = true
  error.value = ''
  try {
    customer.value = await getById(route.params.id)
  } catch (requestError) {
    error.value = requestError?.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້'
  } finally {
    pending.value = false
  }
}

onMounted(load)
</script>
