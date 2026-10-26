<script setup>
import { onMounted, reactive, ref } from 'vue'

useHead({ title: 'Plans' })

const { request } = useApi()
const { number, currency } = useFormat()

const plans = ref([])
const loading = ref(false)
const error = ref('')
const showCreate = ref(false)
const creating = ref(false)
const createError = ref('')

const form = reactive({
  code: '',
  name: '',
  description: '',
  price: '0',
  maxUsers: '5',
  maxPolicies: '500',
  features: 'policies,customers,reports',
})

const planPrice = (plan) => {
  if (plan.currency && plan.currency !== 'LAK') {
    return `${number(plan.price)} ${plan.currency}`
  }
  return currency(plan.price)
}

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await request('/platform/plans')
    plans.value = response.data
  } catch (requestError) {
    error.value = apiErrorMessage(requestError)
  } finally {
    loading.value = false
  }
}

const createPlan = async () => {
  creating.value = true
  createError.value = ''
  try {
    await request('/platform/plans', {
      method: 'POST',
      body: {
        code: form.code.trim().toLowerCase(),
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price || 0),
        limits: {
          maxUsers: Number(form.maxUsers || 0),
          maxPolicies: Number(form.maxPolicies || 0),
        },
        features: form.features
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      },
    })
    showCreate.value = false
    Object.assign(form, {
      code: '',
      name: '',
      description: '',
      price: '0',
      maxUsers: '5',
      maxPolicies: '500',
      features: 'policies,customers,reports',
    })
    await load()
  } catch (requestError) {
    createError.value = apiErrorMessage(requestError)
  } finally {
    creating.value = false
  }
}

const toggleActive = async (plan) => {
  try {
    await request(`/platform/plans/${plan.id}`, {
      method: 'PATCH',
      body: { active: !plan.active },
    })
    await load()
  } catch (requestError) {
    error.value = apiErrorMessage(requestError)
  }
}

onMounted(load)
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="ແຜນການໃຊ້ງານ (Plans)"
      description="ແຜນຄຸນນະພາບ, ລາຄາ ແລະ ຂີດຈຳກັດການໃຊ້ງານຂອງແຕ່ລະ Tenant"
      :breadcrumbs="[{ label: 'Plans' }]"
    >
      <template #actions>
        <button type="button" class="sf-btn sf-btn-primary" @click="showCreate = true">
          + ສ້າງ Plan ໃໝ່
        </button>
      </template>
    </PageHeader>

    <p
      v-if="error"
      class="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-bold text-rose-600 dark:text-rose-400"
    >
      {{ error }}
    </p>

    <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <div v-if="loading" class="text-sm text-muted">ກຳລັງໂຫຼດ...</div>
      <article
        v-for="plan in plans"
        v-else
        :key="plan.id"
        class="sf-card flex flex-col p-5 transition hover:border-primary/40 hover:shadow-md"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-base font-extrabold text-foreground">{{ plan.name }}</p>
            <p class="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">{{ plan.code }}</p>
          </div>
          <StatusBadge
            :status="plan.active ? 'active' : 'suspended'"
          />
        </div>

        <p class="mt-2 min-h-10 text-xs text-muted">{{ plan.description || '—' }}</p>

        <p class="mt-3 text-xl font-black text-foreground">
          {{ planPrice(plan) }}
          <span class="text-xs font-normal text-muted">/ ເດືອນ</span>
        </p>

        <dl class="mt-3 space-y-1.5 text-xs text-muted border-t border-line/60 pt-3">
          <div class="flex justify-between">
            <dt>Max Users</dt>
            <dd class="font-bold text-foreground">{{ plan.limits?.maxUsers || 'ບໍ່ຈຳກັດ' }}</dd>
          </div>
          <div class="flex justify-between">
            <dt>Max Policies</dt>
            <dd class="font-bold text-foreground">{{ plan.limits?.maxPolicies || 'ບໍ່ຈຳກັດ' }}</dd>
          </div>
        </dl>

        <div class="mt-3 flex flex-wrap gap-1.5">
          <span
            v-for="feature in plan.features || []"
            :key="feature"
            class="rounded-md bg-surface-muted border border-line px-2 py-0.5 text-[11px] font-mono text-muted"
          >
            {{ feature === '*' ? 'ທຸກ Feature' : feature }}
          </span>
        </div>

        <div class="mt-auto pt-4">
          <button type="button" class="sf-btn sf-btn-secondary w-full" @click="toggleActive(plan)">
            {{ plan.active ? 'ປິດໃຊ້ plan' : 'ເປີດໃຊ້ plan' }}
          </button>
        </div>
      </article>
    </div>

    <AppModal v-model="showCreate" title="ສ້າງ Plan ໃໝ່">
      <form class="space-y-4" @submit.prevent="createPlan">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="sf-label" for="plan-code">Code</label>
            <input id="plan-code" v-model="form.code" class="sf-input" required placeholder="growth" />
          </div>
          <div>
            <label class="sf-label" for="plan-name">Name</label>
            <input id="plan-name" v-model="form.name" class="sf-input" required />
          </div>
          <div class="sm:col-span-2">
            <label class="sf-label" for="plan-desc">Description</label>
            <input id="plan-desc" v-model="form.description" class="sf-input" />
          </div>
          <div>
            <label class="sf-label" for="plan-price">Price (LAK)</label>
            <AppNumberInput id="plan-price" v-model="form.price" min="0" allow-decimal />
          </div>
          <div>
            <label class="sf-label" for="plan-features">Features (comma separated)</label>
            <input id="plan-features" v-model="form.features" class="sf-input" />
          </div>
          <div>
            <label class="sf-label" for="plan-users">Max users (0 = unlimited)</label>
            <AppNumberInput id="plan-users" v-model="form.maxUsers" min="0" />
          </div>
          <div>
            <label class="sf-label" for="plan-policies">Max policies (0 = unlimited)</label>
            <AppNumberInput id="plan-policies" v-model="form.maxPolicies" min="0" />
          </div>
        </div>

        <p
          v-if="createError"
          class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700"
        >
          {{ createError }}
        </p>

        <div class="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" class="sf-btn sf-btn-secondary" @click="showCreate = false">
            ຍົກເລີກ
          </button>
          <button type="submit" class="sf-btn sf-btn-primary" :disabled="creating">
            {{ creating ? 'ກຳລັງສ້າງ...' : 'ສ້າງ Plan' }}
          </button>
        </div>
      </form>
    </AppModal>
  </div>
</template>
