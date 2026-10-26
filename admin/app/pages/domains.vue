<script setup>
import { computed, onMounted, ref } from 'vue'

useHead({ title: 'Custom Domains' })

const config = useRuntimeConfig()
const { request } = useApi()
const { date } = useFormat()

const loading = ref(true)
const tenants = ref([])
const search = ref('')

const load = async () => {
  loading.value = true
  try {
    const res = await request('/platform/tenants', { query: { pageSize: 50 } })
    tenants.value = res.data || []
  } finally {
    loading.value = false
  }
}

const domainsList = computed(() => {
  const list = []
  for (const t of tenants.value) {
    if (t.domains?.list) {
      for (const d of t.domains.list) {
        list.push({
          ...d,
          tenantId: t.id,
          tenantName: t.name,
          tenantSlug: t.slug,
        })
      }
    } else {
      // Fallback
      list.push({
        id: 0,
        hostname: t.primaryHostname || `${t.slug}.${config.public.rootDomain}`,
        isPrimary: true,
        verifiedAt: t.createdAt,
        sslStatus: 'active',
        tenantId: t.id,
        tenantName: t.name,
        tenantSlug: t.slug,
      })
    }
  }

  if (!search.value) return list
  const q = search.value.toLowerCase()
  return list.filter(
    (d) =>
      d.hostname.toLowerCase().includes(q) ||
      d.tenantName.toLowerCase().includes(q) ||
      d.tenantSlug.toLowerCase().includes(q),
  )
})

onMounted(() => {
  load()
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="ສູນກວດສອບ Custom Domains"
      description="ລວບລວມ ແລະ ຕິດຕາມສະຖານະ DNS, CNAME, TXT verification ແລະ ໃບຢັ້ງຢືນ SSL ຂອງທຸກອົງກອນ"
      :breadcrumbs="[{ label: 'Domains' }]"
    >
      <template #actions>
        <button type="button" class="sf-btn sf-btn-secondary" @click="load">
          ↻ ໂຫຼດໃໝ່
        </button>
      </template>
    </PageHeader>

    <div class="flex items-center gap-3">
      <input
        v-model="search"
        type="search"
        placeholder="ຄົ້ນຫາ Domain ຫຼື ຊື່ອົງກອນ..."
        class="sf-input max-w-sm"
      />
      <span class="text-xs text-muted">ທັງໝົດ {{ domainsList.length }} Domain</span>
    </div>

    <div class="sf-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="sf-table">
          <thead>
            <tr>
              <th>Domain Hostname</th>
              <th>ປະເພດ</th>
              <th>ອົງກອນ (Tenant)</th>
              <th>ສະຖານະ DNS</th>
              <th>SSL Status</th>
              <th>ຢັ້ງຢືນເມື່ອ</th>
              <th class="text-right">ການຈັດການ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="py-12 text-center text-muted">ກຳລັງໂຫຼດ...</td>
            </tr>
            <tr v-else-if="!domainsList.length">
              <td colspan="7" class="py-12 text-center text-muted">
                ບໍ່ພົບລາຍການ Domain
              </td>
            </tr>
            <template v-else>
              <tr v-for="dom in domainsList" :key="dom.id || dom.hostname">
                <td>
                  <span class="font-mono font-bold text-foreground">{{ dom.hostname }}</span>
                </td>
                <td>
                  <span
                    class="rounded-md px-2 py-0.5 text-xs font-bold"
                    :class="dom.isPrimary ? 'bg-primary/10 text-primary' : 'bg-surface-muted text-muted'"
                  >
                    {{ dom.isPrimary ? 'Primary Subdomain' : 'Custom Domain' }}
                  </span>
                </td>
                <td>
                  <NuxtLink
                    :to="`/tenants/${dom.tenantId}`"
                    class="font-bold text-foreground hover:text-primary transition-colors"
                  >
                    {{ dom.tenantName }}
                  </NuxtLink>
                  <p class="text-[11px] font-mono text-muted">{{ dom.tenantSlug }}</p>
                </td>
                <td>
                  <span
                    class="sf-badge"
                    :class="dom.verifiedAt ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'"
                  >
                    <span
                      class="h-1.5 w-1.5 rounded-full"
                      :class="dom.verifiedAt ? 'bg-emerald-500' : 'bg-amber-500'"
                    />
                    {{ dom.verifiedAt ? 'Verified' : 'Pending DNS' }}
                  </span>
                </td>
                <td>
                  <span
                    class="sf-badge"
                    :class="dom.sslStatus === 'active' || dom.verifiedAt ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-surface-muted text-muted'"
                  >
                    {{ dom.sslStatus || 'Active SSL' }}
                  </span>
                </td>
                <td class="text-xs text-muted">
                  {{ dom.verifiedAt ? date(dom.verifiedAt) : 'ຍັງບໍ່ທັນຢັ້ງຢືນ' }}
                </td>
                <td class="text-right">
                  <NuxtLink
                    :to="`/tenants/${dom.tenantId}`"
                    class="sf-btn sf-btn-secondary py-1 px-3 text-xs"
                  >
                    ຈັດການ
                  </NuxtLink>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
