<script setup>
import { onMounted, reactive, ref } from 'vue'

useHead({ title: 'Audit log' })

const { request } = useApi()
const { dateTime } = useFormat()

const logs = ref([])
const meta = reactive({ total: 0, page: 1, pageSize: 30 })
const filters = reactive({ action: '', tenantId: '' })
const loading = ref(false)
const error = ref('')

const load = async (page = 1) => {
  loading.value = true
  error.value = ''
  try {
    const response = await request('/platform/audit-logs', {
      query: {
        page,
        pageSize: meta.pageSize,
        action: filters.action || undefined,
        tenantId: filters.tenantId || undefined,
      },
    })
    logs.value = response.data
    meta.total = response.meta.total
    meta.page = response.meta.page
    meta.pageSize = response.meta.pageSize
  } catch (requestError) {
    error.value = apiErrorMessage(requestError)
  } finally {
    loading.value = false
  }
}

const goTo = (page) => {
  if (page < 1 || page > Math.ceil(meta.total / meta.pageSize) || page === meta.page) return
  load(page)
}

onMounted(() => load())
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Audit Logs"
      description="ບັນທຶກປະຫວັດການກະທຳ ແລະ ການປ່ຽນແປງທັງໝົດຂອງ Platform Console"
      :breadcrumbs="[{ label: 'Audit Logs' }]"
    />

    <form class="flex flex-wrap items-center gap-3" @submit.prevent="load(1)">
      <input
        v-model="filters.action"
        class="sf-input max-w-xs"
        placeholder="Action ເຊັ່ນ tenant.create..."
      />
      <AppNumberInput
        id="audit-tenant-id"
        v-model="filters.tenantId"
        class="max-w-[10rem]"
        min="1"
        placeholder="Tenant ID..."
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
      <table class="sf-table">
        <thead>
          <tr>
            <th>ເວລາ</th>
            <th>Action</th>
            <th>Target</th>
            <th>Tenant</th>
            <th>Actor</th>
            <th>IP</th>
            <th>Meta</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="py-10 text-center text-slate-400">ກຳລັງໂຫຼດ...</td>
          </tr>
          <tr v-else-if="!logs.length">
            <td colspan="7" class="py-10 text-center text-slate-400">ຍັງບໍ່ມີ log</td>
          </tr>
          <tr v-for="log in logs" v-else :key="log.id">
            <td class="whitespace-nowrap text-slate-500">{{ dateTime(log.createdAt) }}</td>
            <td class="font-bold text-slate-800">{{ log.action }}</td>
            <td class="text-slate-600">{{ log.target || '—' }}</td>
            <td class="text-slate-600">{{ log.tenantId ?? '—' }}</td>
            <td class="text-slate-600">{{ log.actorEmail || '—' }}</td>
            <td class="text-slate-500">{{ log.ip || '—' }}</td>
            <td>
              <details v-if="log.meta">
                <summary class="cursor-pointer text-xs text-slate-500">ເບິ່ງ</summary>
                <pre class="mt-1 max-w-xs overflow-x-auto rounded bg-slate-900 p-2 text-[10px] text-slate-200">{{ JSON.stringify(log.meta, null, 2) }}</pre>
              </details>
              <span v-else class="text-slate-300">—</span>
            </td>
          </tr>
        </tbody>
      </table>
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
  </div>
</template>
