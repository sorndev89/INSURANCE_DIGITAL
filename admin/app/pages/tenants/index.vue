<script setup>
import { computed, onMounted, reactive, ref } from 'vue'

useHead({ title: 'Tenants' })

const config = useRuntimeConfig()
const { request } = useApi()
const { date } = useFormat()

const tenants = ref([])
const plans = ref([])
const meta = reactive({ total: 0, page: 1, pageSize: 20 })
const search = ref('')
const loading = ref(false)
const error = ref('')

const showCreate = ref(false)
const creating = ref(false)
const createError = ref('')
const created = ref(null)

const form = reactive({
  name: '',
  slug: '',
  planCode: 'pro',
  customDomain: '',
  adminUsername: '',
  adminEmail: '',
  adminPassword: '',
  brandName: '',
  primaryColor: '#10b981',
})

const activePlans = computed(() => plans.value.filter((plan) => plan.active))
const defaultHost = computed(() =>
  form.slug ? `${form.slug}.${config.public.rootDomain}` : `slug.${config.public.rootDomain}`,
)

const load = async (page = 1) => {
  loading.value = true
  error.value = ''
  try {
    const response = await request('/platform/tenants', {
      query: { page, pageSize: meta.pageSize, search: search.value || undefined },
    })
    tenants.value = response.data
    meta.total = response.meta.total
    meta.page = response.meta.page
    meta.pageSize = response.meta.pageSize
  } catch (requestError) {
    error.value = apiErrorMessage(requestError)
  } finally {
    loading.value = false
  }
}

const loadPlans = async () => {
  try {
    const response = await request('/platform/plans')
    plans.value = response.data
  } catch {
    plans.value = []
  }
}

const resetForm = () => {
  Object.assign(form, {
    name: '',
    slug: '',
    planCode: 'pro',
    customDomain: '',
    adminUsername: '',
    adminEmail: '',
    adminPassword: '',
    brandName: '',
    primaryColor: '#10b981',
  })
  createError.value = ''
  created.value = null
}

const openCreate = () => {
  resetForm()
  showCreate.value = true
}

const createTenant = async () => {
  creating.value = true
  createError.value = ''
  try {
    const response = await request('/platform/tenants', {
      method: 'POST',
      body: {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
        planCode: form.planCode || undefined,
        customDomain: form.customDomain.trim() || undefined,
        brand: {
          name: form.brandName.trim() || form.name.trim(),
          primaryColor: form.primaryColor,
        },
        admin: {
          username: form.adminUsername.trim() || undefined,
          email: form.adminEmail.trim(),
          password: form.adminPassword,
        },
      },
    })
    created.value = response.data
    await load(1)
    await loadPlans()
  } catch (requestError) {
    createError.value = apiErrorMessage(requestError)
  } finally {
    creating.value = false
  }
}

const goTo = (page) => {
  if (page < 1 || page > Math.ceil(meta.total / meta.pageSize) || page === meta.page) return
  load(page)
}

onMounted(async () => {
  await Promise.all([load(), loadPlans()])
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="ອົງກອນ (Tenants)"
      description="ຈັດການອົງກອນທັງໝົດໃນ SaaS, custom domain, ສະຖານະ ແລະ ແຜນການໃຊ້ງານ"
      :breadcrumbs="[{ label: 'Tenants' }]"
    >
      <template #actions>
        <button type="button" class="sf-btn sf-btn-primary" @click="openCreate">
          + ສ້າງ Tenant ໃໝ່
        </button>
      </template>
    </PageHeader>

    <form class="flex flex-wrap items-center gap-3" @submit.prevent="load(1)">
      <input
        v-model="search"
        class="sf-input max-w-sm"
        type="search"
        placeholder="ຄົ້ນຫາຊື່ ຫຼື slug..."
      />
      <button type="submit" class="sf-btn sf-btn-secondary">ຄົ້ນຫາ</button>
      <span class="text-xs text-muted">ທັງໝົດ {{ meta.total }} ລາຍການ</span>
    </form>

    <p
      v-if="error"
      class="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-bold text-rose-600 dark:text-rose-400"
    >
      {{ error }}
    </p>

    <div class="sf-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="sf-table">
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Primary Domain</th>
              <th>Plan</th>
              <th>Status</th>
              <th>ສ້າງເມື່ອ</th>
              <th class="text-right">ການຈັດການ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="py-12 text-center text-muted">ກຳລັງໂຫຼດ...</td>
            </tr>
            <tr v-else-if="!tenants.length">
              <td colspan="6" class="py-12 text-center text-muted">
                ຍັງບໍ່ມີ tenant. ກົດ “ສ້າງ Tenant” ເພື່ອເລີ່ມ.
              </td>
            </tr>
            <template v-else>
              <tr v-for="tenant in tenants" :key="tenant.id">
                <td>
                  <NuxtLink :to="`/tenants/${tenant.id}`" class="font-extrabold text-foreground hover:text-primary transition-colors">
                    {{ tenant.name }}
                  </NuxtLink>
                  <p class="text-[11px] font-mono text-muted">{{ tenant.slug }}</p>
                </td>
                <td class="font-mono text-xs text-muted">
                  {{ tenant.primaryHostname || `${tenant.slug}.${config.public.rootDomain}` }}
                </td>
                <td>
                  <span class="rounded-md bg-surface-muted px-2 py-0.5 text-xs font-bold text-foreground">
                    {{ tenant.planName || '—' }}
                  </span>
                </td>
                <td><StatusBadge :status="tenant.status" /></td>
                <td class="text-xs text-muted">{{ date(tenant.createdAt) }}</td>
                <td class="text-right space-x-2">
                  <NuxtLink :to="`/tenants/${tenant.id}`" class="sf-btn sf-btn-secondary py-1 px-3 text-xs">
                    ຈັດການ
                  </NuxtLink>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <button
        type="button"
        class="sf-btn sf-btn-secondary"
        :disabled="meta.page <= 1"
        @click="goTo(meta.page - 1)"
      >
        ກ່ອນໜ້າ
      </button>
      <span class="text-xs text-slate-500">ໜ້າ {{ meta.page }}</span>
      <button
        type="button"
        class="sf-btn sf-btn-secondary"
        :disabled="meta.page >= Math.ceil(meta.total / meta.pageSize)"
        @click="goTo(meta.page + 1)"
      >
        ຕໍ່ໄປ
      </button>
    </div>

    <AppModal
      v-model="showCreate"
      title="ສ້າງ Tenant ໃໝ່"
      subtitle="ລະບົບຈະສ້າງ subdomain, admin user ແລະ ເຊື່ອມ plan ໃຫ້ອັດຕະໂນມັດ"
      wide
      @update:model-value="!$event && resetForm()"
    >
      <div v-if="created" class="space-y-4">
        <div class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p class="text-sm font-bold text-emerald-800">ສ້າງສຳເລັດ</p>
          <p class="mt-1 text-xs text-emerald-700">
            {{ created.name }} ({{ created.slug }}) ພ້ອມໃຊ້ງານແລ້ວ.
          </p>
        </div>

        <div>
          <p class="sf-label">Primary domain</p>
          <div class="flex items-center gap-2">
            <code class="sf-code flex-1">{{ created.domains.primary.hostname }}</code>
            <CopyButton :value="created.domains.primary.hostname" />
          </div>
        </div>

        <div v-if="created.domains.custom">
          <p class="sf-label">Custom domain — ຕ້ອງຕັ້ງ DNS ກ່ອນ verify</p>
          <div class="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div>
              <p class="text-[11px] font-bold text-slate-500">CNAME</p>
              <code class="sf-code">{{ created.domains.custom.dns.cname.name }} → {{ created.domains.custom.dns.cname.value }}</code>
            </div>
            <div>
              <p class="text-[11px] font-bold text-slate-500">TXT verification</p>
              <code class="sf-code">{{ created.domains.custom.dns.verification.name }}</code>
              <code class="sf-code mt-1">{{ created.domains.custom.dns.verification.value }}</code>
            </div>
          </div>
          <p class="mt-2 text-[11px] text-slate-500">
            ຫຼັງ DNS propagate ແລ້ວ ໄປທີ່ໜ້າ tenant ເພື່ອກົດ “Verify”.
          </p>
        </div>

        <div>
          <p class="sf-label">Tenant admin</p>
          <p class="text-xs text-slate-600">{{ form.adminEmail }}</p>
        </div>
      </div>

      <form v-else class="space-y-4" @submit.prevent="createTenant">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="sf-label" for="tenant-name">ຊື່ອົງກອນ</label>
            <input id="tenant-name" v-model="form.name" class="sf-input" required />
          </div>
          <div>
            <label class="sf-label" for="tenant-slug">Slug</label>
            <input
              id="tenant-slug"
              v-model="form.slug"
              class="sf-input"
              required
              pattern="[a-z0-9]([a-z0-9\-]*[a-z0-9])?"
              placeholder="acme"
            />
            <p class="mt-1 text-[11px] text-slate-500">{{ defaultHost }}</p>
          </div>
          <div>
            <label class="sf-label" for="tenant-plan">Plan</label>
            <select id="tenant-plan" v-model="form.planCode" class="sf-input">
              <option v-for="plan in activePlans" :key="plan.code" :value="plan.code">
                {{ plan.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="sf-label" for="tenant-domain">Custom domain (ບໍ່ບັງຄັບ)</label>
            <input
              id="tenant-domain"
              v-model="form.customDomain"
              class="sf-input"
              placeholder="insurance.acme.com"
            />
          </div>
          <div>
            <label class="sf-label" for="admin-username">Admin username</label>
            <input id="admin-username" v-model="form.adminUsername" class="sf-input" placeholder="acmeadmin" />
          </div>
          <div>
            <label class="sf-label" for="admin-email">Admin email</label>
            <input
              id="admin-email"
              v-model="form.adminEmail"
              class="sf-input"
              type="email"
              required
              placeholder="admin@acme.com"
            />
          </div>
          <div>
            <label class="sf-label" for="admin-password">Admin password</label>
            <input
              id="admin-password"
              v-model="form.adminPassword"
              class="sf-input"
              type="password"
              required
              minlength="8"
              autocomplete="new-password"
            />
          </div>
          <div>
            <label class="sf-label" for="brand-name">Brand name</label>
            <input id="brand-name" v-model="form.brandName" class="sf-input" placeholder="ຄ່າເລີ່ມຕົ້ນ = ຊື່ອົງກອນ" />
          </div>
          <div>
            <label class="sf-label" for="brand-color">Primary color</label>
            <div class="flex items-center gap-2">
              <input id="brand-color" v-model="form.primaryColor" type="color" class="h-9 w-12 cursor-pointer rounded border border-slate-300" />
              <input v-model="form.primaryColor" class="sf-input" />
            </div>
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
            {{ creating ? 'ກຳລັງສ້າງ...' : 'ສ້າງ Tenant' }}
          </button>
        </div>
      </form>

      <template v-if="created" #footer>
        <button type="button" class="sf-btn sf-btn-secondary" @click="resetForm">
          ສ້າງຕື່ມ
        </button>
        <button type="button" class="sf-btn sf-btn-primary" @click="showCreate = false">
          ປິດ
        </button>
      </template>
    </AppModal>
  </div>
</template>
