<script setup>
import { computed, onMounted, reactive, ref } from 'vue'

useHead({ title: 'Tenant detail' })

const route = useRoute()
const { platform } = usePlatformConfig()
const { request } = useApi()
const { date, dateTime, number } = useFormat()

const tenantId = computed(() => Number(route.params.id))
const tenant = ref(null)
const usage = ref(null)
const plans = ref([])
const loading = ref(false)
const error = ref('')
const notice = ref('')

const users = ref([])
const usersMeta = reactive({ total: 0, page: 1, pageSize: 20 })
const usersSearch = ref('')
const usersLoading = ref(false)
const usersError = ref('')

const saving = ref(false)
const edit = reactive({
  name: '',
  planId: '',
  brandName: '',
  primaryColor: '#10b981',
  currencySymbol: 'kip',
  currencyPosition: 'prefix',
})
const loadedBrandName = ref('')

const domainInput = ref('')
const addingDomain = ref(false)
const domainError = ref('')
const domainErrorDetails = ref(null)
const verifyingId = ref(null)

const impersonation = ref(null)
const impersonating = ref(false)

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await request(`/platform/tenants/${tenantId.value}`)
    tenant.value = response.data
    edit.name = response.data.name
    edit.planId = response.data.planId ?? ''
    edit.brandName = response.data.settings?.brand?.name || ''
    edit.primaryColor = response.data.settings?.brand?.primaryColor || '#10b981'
    edit.currencySymbol = response.data.settings?.currencyDisplay?.symbol || 'kip'
    edit.currencyPosition = response.data.settings?.currencyDisplay?.position || 'prefix'
    loadedBrandName.value = edit.brandName
  } catch (requestError) {
    error.value = apiErrorMessage(requestError)
  } finally {
    loading.value = false
  }
}

const loadUsage = async () => {
  try {
    const response = await request(`/platform/tenants/${tenantId.value}/usage`)
    usage.value = response.data
  } catch {
    usage.value = null
  }
}

const loadUsers = async (page = 1) => {
  usersLoading.value = true
  usersError.value = ''
  try {
    const response = await request(`/platform/tenants/${tenantId.value}/users`, {
      query: {
        page,
        pageSize: usersMeta.pageSize,
        search: usersSearch.value.trim() || undefined,
      },
    })
    users.value = response.data
    usersMeta.total = response.meta.total
    usersMeta.page = response.meta.page
    usersMeta.pageSize = response.meta.pageSize
  } catch (requestError) {
    users.value = []
    usersError.value = apiErrorMessage(requestError)
  } finally {
    usersLoading.value = false
  }
}

const goUsersPage = (page) => {
  const pages = Math.ceil(usersMeta.total / usersMeta.pageSize)
  if (page < 1 || page > pages || page === usersMeta.page) return
  loadUsers(page)
}

const loadPlans = async () => {
  try {
    const response = await request('/platform/plans')
    plans.value = response.data
  } catch {
    plans.value = []
  }
}

const flash = (message) => {
  notice.value = message
  setTimeout(() => {
    if (notice.value === message) notice.value = ''
  }, 3000)
}

const save = async () => {
  saving.value = true
  error.value = ''
  try {
    const brandName = edit.brandName.trim()
    const brand = { primaryColor: edit.primaryColor }
    if (brandName !== loadedBrandName.value.trim()) brand.name = brandName

    await request(`/platform/tenants/${tenantId.value}`, {
      method: 'PATCH',
      body: {
        name: edit.name.trim(),
        planId: edit.planId === '' ? null : Number(edit.planId),
        settings: {
          brand,
          currencyDisplay: {
            symbol: edit.currencySymbol,
            position: edit.currencyPosition,
          },
        },
      },
    })
    await load()
    flash('ບັນທຶກແລ້ວ')
  } catch (requestError) {
    error.value = apiErrorMessage(requestError)
  } finally {
    saving.value = false
  }
}

const setStatus = async (action) => {
  const label = action === 'suspend' ? 'ປິດໃຊ້ງານ' : 'ເປີດໃຊ້ງານ'
  if (!window.confirm(`ຢືນຢັນ${label} tenant ນີ້?`)) return
  error.value = ''
  try {
    await request(`/platform/tenants/${tenantId.value}/${action}`, { method: 'POST' })
    await load()
    flash(`${label}ແລ້ວ`)
  } catch (requestError) {
    error.value = apiErrorMessage(requestError)
  }
}

const removeTenant = async () => {
  if (!window.confirm('ລຶບ tenant ນີ້? ຂໍ້ມູນຈະຖືກເກັບໄວ້ ແຕ່ slug ແລະ domain ຈະຖືກປ່ອຍໃຫ້ໃຊ້ໃໝ່ໄດ້.')) return
  try {
    await request(`/platform/tenants/${tenantId.value}`, { method: 'DELETE' })
    await navigateTo('/tenants')
  } catch (requestError) {
    error.value = apiErrorMessage(requestError)
  }
}

const addDomain = async () => {
  addingDomain.value = true
  domainError.value = ''
  domainErrorDetails.value = null
  try {
    const response = await request(`/platform/tenants/${tenantId.value}/domains`, {
      method: 'POST',
      body: { hostname: domainInput.value.trim() },
    })
    domainInput.value = ''
    domainErrorDetails.value = response.data.dns
    flash('ເພີ່ມ domain ແລ້ວ — ກະລຸນາຕັ້ງ DNS ແລ້ວ verify')
    await load()
  } catch (requestError) {
    domainError.value = apiErrorMessage(requestError)
  } finally {
    addingDomain.value = false
  }
}

const runVerify = async (domain, { force = false } = {}) => {
  verifyingId.value = domain.id
  domainError.value = ''
  domainErrorDetails.value = null
  try {
    await request(`/platform/tenants/${tenantId.value}/domains/${domain.id}/verify`, {
      method: 'POST',
      query: force ? { force: 'true' } : undefined,
    })
    await load()
    flash(force ? 'Force verify ສຳເລັດ' : 'Verify domain ສຳເລັດ')
  } catch (requestError) {
    domainError.value = apiErrorMessage(requestError)
    domainErrorDetails.value = requestError?.data?.error?.details || domain.dns || null
  } finally {
    verifyingId.value = null
  }
}

const verifyDomain = (domain) => runVerify(domain, { force: import.meta.dev })

const forceVerifyDomain = async (domain) => {
  const typed = window.prompt(
    `Force verify ${domain.hostname}?\n\nລະບົບຈະຂ້າມການກວດ DNS TXT. ໃຊ້ສະເພາະເມື່ອແນ່ໃຈວ່າ domain ນີ້ເປັນຂອງ tenant ແລະ ຊີ້ມາຫາ server ນີ້. ການກະທຳຈະຖືກບັນທຶກ audit.\n\nພິມ ${domain.hostname} ເພື່ອຢືນຢັນ:`,
  )
  if ((typed || '').trim().toLowerCase() !== domain.hostname.toLowerCase()) return
  await runVerify(domain, { force: true })
}

const removeDomain = async (domain) => {
  if (!window.confirm(`ລຶບ domain ${domain.hostname}?`)) return
  try {
    await request(`/platform/tenants/${tenantId.value}/domains/${domain.id}`, {
      method: 'DELETE',
    })
    await load()
    flash('ລຶບ domain ແລ້ວ')
  } catch (requestError) {
    domainError.value = apiErrorMessage(requestError)
  }
}

const impersonate = async () => {
  impersonating.value = true
  error.value = ''
  try {
    const response = await request(`/platform/tenants/${tenantId.value}/impersonate`, {
      method: 'POST',
      body: {},
    })
    impersonation.value = response.data
  } catch (requestError) {
    error.value = apiErrorMessage(requestError)
  } finally {
    impersonating.value = false
  }
}

const launchTenantApp = () => {
  if (!impersonation.value?.token) return
  const targetHost = window.location.hostname === 'localhost'
    ? `http://localhost:3000?impersonate_token=${impersonation.value.token}`
    : `https://${tenant.value?.primaryHostname || `${tenant.value?.slug}.${platform.value.rootDomain}`}?impersonate_token=${impersonation.value.token}`
  window.open(targetHost, '_blank')
}

onMounted(async () => {
  await Promise.all([load(), loadUsage(), loadPlans(), loadUsers()])
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :title="tenant?.name || 'Tenant'"
      :description="tenant ? `Slug: ${tenant.slug} · ID: ${tenant.id}` : 'ກຳລັງໂຫຼດ...'"
      :breadcrumbs="[{ label: 'Tenants', to: '/tenants' }, { label: tenant?.name || 'Detail' }]"
    >
      <template #actions>
        <NuxtLink to="/tenants" class="sf-btn sf-btn-secondary">← ກັບ</NuxtLink>
        <StatusBadge v-if="tenant" :status="tenant.status" />
      </template>
    </PageHeader>

    <p
      v-if="error"
      class="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-bold text-rose-600 dark:text-rose-400"
    >
      {{ error }}
    </p>
    <p
      v-if="notice"
      class="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"
    >
      {{ notice }}
    </p>

    <div v-if="loading && !tenant" class="sf-card p-10 text-center text-slate-400">
      ກຳລັງໂຫຼດ...
    </div>

    <div v-else-if="tenant" class="grid gap-5 lg:grid-cols-3">
      <div class="space-y-5 lg:col-span-2">
        <section class="sf-card p-5">
          <h2 class="text-sm font-bold text-slate-900">ຂໍ້ມູນທົ່ວໄປ</h2>
          <p class="mt-1 text-xs text-slate-500">ຊື່, plan ແລະ branding ຂອງ tenant</p>

          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label class="sf-label" for="edit-name">ຊື່ອົງກອນ</label>
              <input id="edit-name" v-model="edit.name" class="sf-input" />
            </div>
            <div>
              <label class="sf-label" for="edit-plan">Plan</label>
              <select id="edit-plan" v-model="edit.planId" class="sf-input">
                <option value="">— ບໍ່ມີ plan —</option>
                <option v-for="plan in plans" :key="plan.id" :value="plan.id">
                  {{ plan.name }}{{ plan.active ? '' : ' (inactive)' }}
                </option>
              </select>
            </div>
            <div>
              <label class="sf-label" for="edit-brand">Brand name</label>
              <input id="edit-brand" v-model="edit.brandName" class="sf-input" />
            </div>
            <div>
              <label class="sf-label" for="edit-color">Primary color</label>
              <div class="flex items-center gap-2">
                <input
                  id="edit-color"
                  v-model="edit.primaryColor"
                  type="color"
                  class="h-9 w-12 cursor-pointer rounded border border-slate-300"
                />
                <input v-model="edit.primaryColor" class="sf-input" />
              </div>
            </div>
            <div>
              <label class="sf-label" for="edit-currency-symbol">Currency symbol</label>
              <select id="edit-currency-symbol" v-model="edit.currencySymbol" class="sf-input">
                <option value="kip">₭ (Kip)</option>
                <option value="lak">LAK</option>
              </select>
            </div>
            <div>
              <label class="sf-label" for="edit-currency-position">Symbol position</label>
              <select id="edit-currency-position" v-model="edit.currencyPosition" class="sf-input">
                <option value="prefix">ທາງໜ້າ (₭ 12,850,000)</option>
                <option value="suffix">ທາງຫຼັງ (12,850,000 ₭)</option>
              </select>
            </div>
          </div>

          <div class="mt-4 flex justify-end">
            <button type="button" class="sf-btn sf-btn-primary" :disabled="saving" @click="save">
              {{ saving ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກ' }}
            </button>
          </div>
        </section>

        <section class="sf-card p-5">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 class="text-sm font-bold text-slate-900">ຜູ້ໃຊ້ (Users)</h2>
              <p class="mt-1 text-xs text-slate-500">ລາຍຊື່ຜູ້ໃຊ້ທັງໝົດໃນ tenant ນີ້</p>
            </div>
            <span class="text-xs text-slate-500">ທັງໝົດ {{ usersMeta.total }}</span>
          </div>

          <form class="mt-4 flex flex-wrap items-center gap-2" @submit.prevent="loadUsers(1)">
            <input
              v-model="usersSearch"
              class="sf-input max-w-xs"
              type="search"
              placeholder="ຄົ້ນຫາຊື່ ຫຼື ອີເມວ..."
            />
            <button type="submit" class="sf-btn sf-btn-secondary">ຄົ້ນຫາ</button>
          </form>

          <p
            v-if="usersError"
            class="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700"
          >
            {{ usersError }}
          </p>

          <div class="mt-3 overflow-x-auto">
            <table class="sf-table">
              <thead>
                <tr>
                  <th>ຜູ້ໃຊ້</th>
                  <th>ອີເມວ</th>
                  <th>ບົດບາດ</th>
                  <th>ສະຖານະ</th>
                  <th>ສ້າງເມື່ອ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="usersLoading">
                  <td colspan="5" class="py-8 text-center text-slate-400">ກຳລັງໂຫຼດ...</td>
                </tr>
                <tr v-else-if="!users.length">
                  <td colspan="5" class="py-8 text-center text-slate-400">ຍັງບໍ່ມີຜູ້ໃຊ້</td>
                </tr>
                <template v-else>
                  <tr v-for="user in users" :key="user.id">
                    <td class="font-bold text-slate-800">{{ user.username }}</td>
                    <td class="text-xs text-slate-600">{{ user.email }}</td>
                    <td>
                      <span
                        class="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-600"
                      >
                        {{ user.role }}
                      </span>
                    </td>
                    <td><StatusBadge :status="user.status" /></td>
                    <td class="text-xs text-slate-500">{{ date(user.createdAt) }}</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <div
            v-if="usersMeta.total > usersMeta.pageSize"
            class="mt-4 flex items-center justify-between"
          >
            <button
              type="button"
              class="sf-btn sf-btn-secondary"
              :disabled="usersMeta.page <= 1"
              @click="goUsersPage(usersMeta.page - 1)"
            >
              ກ່ອນໜ້າ
            </button>
            <span class="text-xs text-slate-500">ໜ້າ {{ usersMeta.page }}</span>
            <button
              type="button"
              class="sf-btn sf-btn-secondary"
              :disabled="usersMeta.page >= Math.ceil(usersMeta.total / usersMeta.pageSize)"
              @click="goUsersPage(usersMeta.page + 1)"
            >
              ຕໍ່ໄປ
            </button>
          </div>
        </section>

        <section class="sf-card p-5">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 class="text-sm font-bold text-slate-900">Domains</h2>
              <p class="mt-1 text-xs text-slate-500">Primary subdomain ແລະ custom domain</p>
            </div>
          </div>

          <ul class="mt-4 divide-y divide-slate-100">
            <li v-for="domain in tenant.domains" :key="domain.id" class="py-3">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="min-w-0">
                  <p class="truncate text-sm font-bold text-slate-900">{{ domain.hostname }}</p>
                  <p class="text-[11px] text-slate-500">
                    {{ domain.type }} · {{ domain.isPrimary ? 'primary' : 'custom' }} · SSL:
                    {{ domain.sslStatus }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <StatusBadge
                    :status="domain.verifiedAt ? 'verified' : 'pending'"
                    :label="domain.verifiedAt ? 'verified' : 'pending'"
                  />
                  <button
                    v-if="domain.type === 'custom' && !domain.verifiedAt"
                    type="button"
                    class="sf-btn sf-btn-secondary"
                    :disabled="verifyingId === domain.id"
                    @click="verifyDomain(domain)"
                  >
                    {{ verifyingId === domain.id ? 'ກຳລັງກວດ...' : 'Verify' }}
                  </button>
                  <button
                    v-if="domain.type === 'custom' && !domain.verifiedAt"
                    type="button"
                    class="sf-btn sf-btn-danger"
                    :disabled="verifyingId === domain.id"
                    @click="forceVerifyDomain(domain)"
                  >
                    Force verify
                  </button>
                  <button
                    v-if="!domain.isPrimary"
                    type="button"
                    class="sf-btn sf-btn-danger"
                    @click="removeDomain(domain)"
                  >
                    ລຶບ
                  </button>
                </div>
              </div>

              <div
                v-if="domain.type === 'custom' && !domain.verifiedAt && domain.dns"
                class="mt-2 space-y-1 rounded-lg bg-slate-50 p-3"
              >
                <p class="text-[11px] font-bold text-slate-500">CNAME</p>
                <code class="sf-code">{{ domain.dns.cname.name }} → {{ domain.dns.cname.value }}</code>
                <p class="pt-1 text-[11px] font-bold text-slate-500">TXT</p>
                <code class="sf-code">{{ domain.dns.verification.name }}</code>
                <code class="sf-code mt-1">{{ domain.dns.verification.value }}</code>
              </div>
            </li>
          </ul>

          <form class="mt-4 flex flex-wrap items-end gap-2" @submit.prevent="addDomain">
            <div class="min-w-0 flex-1">
              <label class="sf-label" for="new-domain">ເພີ່ມ custom domain</label>
              <input
                id="new-domain"
                v-model="domainInput"
                class="sf-input"
                placeholder="insurance.acme.com"
                required
              />
            </div>
            <button type="submit" class="sf-btn sf-btn-secondary" :disabled="addingDomain">
              {{ addingDomain ? 'ກຳລັງເພີ່ມ...' : 'ເພີ່ມ' }}
            </button>
          </form>

          <div
            v-if="domainError"
            class="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700"
          >
            {{ domainError }}
            <div v-if="domainErrorDetails" class="mt-2 font-normal">
              <code class="sf-code">{{ domainErrorDetails.verification?.name }}</code>
              <code class="sf-code mt-1">{{ domainErrorDetails.verification?.value }}</code>
            </div>
          </div>
        </section>

        <section class="sf-card border-red-200 p-5">
          <h2 class="text-sm font-bold text-red-700">Danger zone</h2>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <button
              v-if="tenant.status !== 'suspended'"
              type="button"
              class="sf-btn sf-btn-danger"
              @click="setStatus('suspend')"
            >
              ປິດໃຊ້ງານ tenant
            </button>
            <button
              v-else
              type="button"
              class="sf-btn sf-btn-secondary"
              @click="setStatus('activate')"
            >
              ເປີດໃຊ້ງານຄືນ
            </button>
            <button type="button" class="sf-btn sf-btn-danger" @click="removeTenant">
              ລຶບ tenant
            </button>
          </div>
        </section>
      </div>

      <div class="space-y-5">
        <section class="sf-card p-5">
          <h2 class="text-sm font-bold text-slate-900">Usage</h2>
          <div class="mt-3 space-y-2 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Users</span>
              <span class="font-bold">{{ number(usage?.users ?? 0) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Customers</span>
              <span class="font-bold">{{ number(usage?.customers ?? 0) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Policies</span>
              <span class="font-bold">{{ number(usage?.policies ?? 0) }}</span>
            </div>
          </div>
          <p v-if="tenant.planId" class="mt-3 text-[11px] text-slate-500">
            Plan: {{ plans.find((plan) => plan.id === tenant.planId)?.name || '—' }}
          </p>
        </section>

        <section class="sf-card p-5">
          <h2 class="text-sm font-bold text-slate-900">Impersonate</h2>
          <p class="mt-1 text-xs text-slate-500">
            ອອກ token ຂອງ tenant admin ເພື່ອກວດສອບບັນຫາ. ທຸກຄັ້ງຈະຖືກບັນທຶກ audit.
          </p>
          <button
            type="button"
            class="sf-btn sf-btn-secondary mt-3 w-full"
            :disabled="impersonating"
            @click="impersonate"
          >
            {{ impersonating ? 'ກຳລັງສ້າງ token...' : 'ສ້າງ tenant token' }}
          </button>

          <div v-if="impersonation" class="mt-3 space-y-2">
            <p class="text-[11px] text-slate-500">
              {{ impersonation.user.email }} · role {{ impersonation.user.role }}
            </p>
            <textarea
              readonly
              class="sf-input h-24 font-mono text-[11px]"
              :value="impersonation.token"
            />
            <div class="flex items-center gap-2">
              <CopyButton :value="impersonation.token" label="ສຳເນົາ token" />
              <button
                type="button"
                class="sf-btn sf-btn-primary flex-1 text-xs"
                @click="launchTenantApp"
              >
                ເຂົ້າສູ່ລະບົບ Tenant ↗
              </button>
            </div>
          </div>
        </section>

        <section class="sf-card p-5">
          <h2 class="text-sm font-bold text-slate-900">Metadata</h2>
          <dl class="mt-3 space-y-2 text-xs">
            <div class="flex justify-between gap-3">
              <dt class="text-slate-500">ID</dt>
              <dd class="font-bold">{{ tenant.id }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-slate-500">Slug</dt>
              <dd class="font-bold">{{ tenant.slug }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-slate-500">Created</dt>
              <dd class="font-bold">{{ date(tenant.createdAt) }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-slate-500">Updated</dt>
              <dd class="font-bold">{{ dateTime(tenant.updatedAt) }}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  </div>
</template>
