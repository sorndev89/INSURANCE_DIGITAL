<template>
  <main class="min-h-dvh bg-background text-foreground">
    <div class="mx-auto max-w-7xl space-y-10 px-4 py-8 md:px-8">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-bold uppercase tracking-widest text-primary-text">Design system</p>
          <h1 class="mt-2 text-3xl font-bold">Component catalog</h1>
          <p class="mt-2 max-w-2xl text-sm text-muted">
            ທຸກ component ພ້ອມ state ຫຼັກ. ໃຊ້ໜ້ານີ້ເພື່ອກວດສາຍຕາ light/dark ແລະ keyboard.
          </p>
        </div>
        <div class="flex gap-2">
          <BaseButton variant="secondary" icon="palette" @click="navigateTo('/dev/tokens')">
            Tokens
          </BaseButton>
          <BaseButton variant="secondary" icon="light_mode" @click="ui.toggleTheme()">
            {{ ui.isDark ? 'Light mode' : 'Dark mode' }}
          </BaseButton>
        </div>
      </header>

      <section class="space-y-4">
        <h2 class="text-2xl font-bold">Buttons</h2>
        <div class="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-5">
          <BaseButton>Primary</BaseButton>
          <BaseButton variant="secondary">Secondary</BaseButton>
          <BaseButton variant="outline">Outline</BaseButton>
          <BaseButton variant="ghost">Ghost</BaseButton>
          <BaseButton variant="danger">Danger</BaseButton>
          <BaseButton loading>ກຳລັງໂຫຼດ</BaseButton>
          <BaseButton disabled>Disabled</BaseButton>
          <BaseButton icon-only label="ເພີ່ມ" icon="add" />
          <BaseButton size="sm" variant="secondary">Small</BaseButton>
          <BaseButton size="lg">Large</BaseButton>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-bold">Inputs</h2>
        <div class="grid gap-5 rounded-xl border border-line bg-surface p-5 md:grid-cols-2">
          <BaseInput v-model="form.name" label="ຊື່ ແລະ ນາມສະກຸນ" placeholder="ປ້ອນຊື່" required />
          <BaseInput
            v-model="form.email"
            type="email"
            label="ອີເມວ"
            placeholder="name@saiyfon.com"
            prefix-icon="mail"
            hint="ໃຊ້ສຳລັບຕິດຕໍ່"
          />
          <BaseInput
            v-model="form.password"
            type="password"
            label="ລະຫັດຜ່ານ"
            placeholder="••••••••"
            prefix-icon="lock"
          />
          <BaseInput
            v-model="form.phone"
            label="ເບີໂທ"
            placeholder="020 5555 1234"
            prefix-icon="phone"
            error="ເບີໂທບໍ່ຖືກຕ້ອງ"
          />
          <BaseSelect
            v-model="form.product"
            label="ປະເພດປະກັນໄພ"
            :options="productOptions"
            placeholder="ເລືອກ"
          />
          <BaseSelect v-model="form.status" label="ສະຖານະ" :options="statusOptions" />
          <BaseTextarea v-model="form.note" label="ໝາຍເຫດ" placeholder="ລາຍລະອຽດເພີ່ມເຕີມ" />
          <div class="space-y-3">
            <BaseCheckbox
              v-model="form.remember"
              label="ຈົດຈຳຂ້ອຍ"
              description="ເກັບ session ໄວ້ 30 ວັນ"
            />
            <BaseSwitch
              v-model="form.notify"
              label="ການແຈ້ງເຕີມ"
              description="ຮັບຂໍ້ຄວາມຈາກລະບົບ"
            />
            <div class="flex gap-4">
              <BaseRadio v-model="form.gender" value="male" name="gender" label="ຊາຍ" />
              <BaseRadio v-model="form.gender" value="female" name="gender" label="ຍິງ" />
            </div>
          </div>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-bold">Badges &amp; status</h2>
        <div class="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-5">
          <BaseBadge tone="primary">Primary</BaseBadge>
          <BaseBadge tone="success" dot>Success</BaseBadge>
          <BaseBadge tone="warning" dot>Warning</BaseBadge>
          <BaseBadge tone="danger" dot>Danger</BaseBadge>
          <BaseBadge tone="info" dot>Info</BaseBadge>
          <BaseBadge tone="neutral">Neutral</BaseBadge>
          <StatusBadge status="active" />
          <StatusBadge status="pending" />
          <StatusBadge status="expired" />
          <StatusBadge status="reviewing" />
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-bold">Cards &amp; stats</h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="ຍອດຂາຍເດືອນນີ້"
            :value="format.currency(450000000)"
            icon="payments"
            trend="+12%"
            hint="ທຽບກັບເດືອນກ່ອນ"
          />
          <StatCard
            label="ປະກັນໄພມີຜົນ"
            :value="format.number(1240)"
            icon="verified_user"
            trend="+5.2%"
          />
          <StatCard
            label="ເຄມລໍຖ້າ"
            :value="format.number(28)"
            icon="assignment"
            trend="ດ່ວນ"
            trend-tone="warning"
          />
          <StatCard label="ກຳລັງໂຫຼດ" value="" icon="hourglass" loading />
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <BaseCard>
            <template #header>
              <h3 class="text-sm font-bold">BaseCard header</h3>
            </template>
            <p class="text-sm text-muted">ເນື້ອຫາພາຍໃນ card ມາດຕະຖານ.</p>
            <template #footer>
              <div class="flex justify-end gap-2">
                <BaseButton variant="secondary" size="sm">ຍົກເລີກ</BaseButton>
                <BaseButton size="sm">ບັນທຶກ</BaseButton>
              </div>
            </template>
          </BaseCard>
          <BaseCard>
            <p class="text-sm font-bold">Empty state</p>
            <EmptyState
              icon="inbox"
              title="ຍັງບໍ່ມີຂໍ້ມູນ"
              description="ເມື່ອມີຂໍ້ມູນ ຈະສະແດງຢູ່ນີ້."
            />
          </BaseCard>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-bold">Navigation &amp; feedback</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-3 rounded-xl border border-line bg-surface p-5">
            <BaseTabs v-model="tab" :items="tabs" />
            <p class="text-sm text-muted">ແທັບທີ່ເລືອກ: {{ tab }}</p>
            <div class="flex flex-wrap gap-2">
              <BaseButton size="sm" variant="secondary" @click="toast.success('ບັນທຶກສຳເລັດ')">
                Toast success
              </BaseButton>
              <BaseButton size="sm" variant="secondary" @click="toast.error('ເກີດຂໍ້ຜິດພາດ')">
                Toast error
              </BaseButton>
              <BaseButton size="sm" variant="secondary" @click="confirmDelete">Confirm</BaseButton>
            </div>
          </div>
          <div class="space-y-3 rounded-xl border border-line bg-surface p-5">
            <div class="flex flex-wrap gap-2">
              <BaseButton variant="secondary" @click="modalOpen = true">ເປີດ Modal</BaseButton>
              <BaseButton variant="secondary" @click="drawerOpen = true">ເປີດ Drawer</BaseButton>
              <BaseDropdown label="ຕົວຢ່າງ Dropdown">
                <template #trigger>
                  <span class="px-2 text-sm font-bold">Dropdown</span>
                  <BaseIcon name="expand_more" size="sm" />
                </template>
                <template #menu="{ close }">
                  <button
                    type="button"
                    role="menuitem"
                    class="w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-surface-muted"
                    @click="close()"
                  >
                    ຕົວເລືອກ 1
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    class="w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-surface-muted"
                    @click="close()"
                  >
                    ຕົວເລືອກ 2
                  </button>
                </template>
              </BaseDropdown>
              <BaseTooltip label="ຄຳອະທິບາຍ">
                <BaseButton variant="ghost" icon-only label="ຂໍ້ມູນ" icon="info" />
              </BaseTooltip>
            </div>
            <Stepper :steps="stepperSteps" :current="step" />
            <div class="flex gap-2">
              <BaseButton size="sm" variant="secondary" @click="step = Math.max(0, step - 1)"
                >ກ່ອນ</BaseButton
              >
              <BaseButton size="sm" @click="step = Math.min(stepperSteps.length - 1, step + 1)"
                >ຕໍ່ໄປ</BaseButton
              >
            </div>
          </div>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-bold">Search, filters &amp; forms</h2>
        <div class="space-y-4 rounded-xl border border-line bg-surface p-5">
          <div class="grid gap-4 md:grid-cols-2">
            <SearchInput
              v-model="search"
              label="ຄົ້ນຫາ"
              placeholder="ຄົ້ນຫາຊື່..."
              @search="onSearch"
            />
            <DateRangePicker v-model:from="range.from" v-model:to="range.to" />
          </div>
          <FileUpload v-model="file" label="ເອກະສານຢືນຢັນ" hint="ຮອງຮັບຮູບພາບ ຫຼື PDF" />
          <FilterBar>
            <template #start>
              <BaseBadge tone="primary">ທັງໝົດ</BaseBadge>
              <BaseBadge tone="neutral">ມີຜົນ</BaseBadge>
              <BaseBadge tone="neutral">ໝົດອາຍຸ</BaseBadge>
            </template>
            <template #end>
              <BaseButton size="sm" variant="secondary" icon="filter_list">Filter</BaseButton>
            </template>
          </FilterBar>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-bold">DataTable</h2>
        <div class="flex flex-wrap gap-2">
          <BaseButton size="sm" variant="secondary" @click="tableLoading = !tableLoading"
            >Toggle loading</BaseButton
          >
          <BaseButton size="sm" variant="secondary" @click="tableError = !tableError"
            >Toggle error</BaseButton
          >
          <BaseButton
            size="sm"
            variant="secondary"
            @click="tableRows = tableRows.length ? [] : policies"
            >Toggle empty</BaseButton
          >
        </div>
        <DataTable
          v-model:page="tablePage"
          :columns="columns"
          :rows="tableRows"
          :loading="tableLoading"
          :error="tableError ? 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້' : null"
          :selected="selected"
          :total="tableRows.length"
          :page-size="5"
          selectable
          @update:selected="selected = $event"
          @retry="tableError = false"
        >
          <template #cell-policyNumber="{ row }">
            <span class="font-bold text-primary-text">{{ row.policyNumber }}</span>
          </template>
          <template #cell-premium="{ value }">
            <span class="font-bold tabular-nums">{{ format.currency(value) }}</span>
          </template>
          <template #cell-status="{ value }">
            <StatusBadge :status="value" />
          </template>
          <template #actions="{ row }">
            <BaseButton
              size="sm"
              variant="ghost"
              icon-only
              label="ເບິ່ງ"
              icon="visibility"
              @click="toast.info(`ເບິ່ງ ${row.policyNumber}`)"
            />
          </template>
        </DataTable>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-bold">States</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-line bg-surface">
            <EmptyState
              title="ບໍ່ມີປະກັນໄພ"
              description="ເລີ່ມສ້າງປະກັນໄພໃໝ່ເພື່ອເຫັນຂໍ້ມູນຢູ່ນີ້."
            >
              <BaseButton icon="add">ສ້າງໃໝ່</BaseButton>
            </EmptyState>
          </div>
          <div class="rounded-xl border border-line bg-surface">
            <ErrorState message="ກະລຸນາກວດເບິ່ງການເຊື່ອມຕໍ່" @retry="toast.info('ລອງໃໝ່')" />
          </div>
        </div>
      </section>
    </div>

    <BaseModal v-model="modalOpen" title="ຕົວຢ່າງ Modal">
      <p class="text-sm text-muted">ນີ້ແມ່ນເນື້ອຫາໃນ modal. ກົດ Esc ຫຼື ປຸ່ມປິດເພື່ອອອກ.</p>
      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton variant="secondary" @click="modalOpen = false">ປິດ</BaseButton>
          <BaseButton @click="modalOpen = false">ຕົກລົງ</BaseButton>
        </div>
      </template>
    </BaseModal>

    <BaseDrawer v-model="drawerOpen" title="ຕົວຢ່າງ Drawer" placement="bottom">
      <div class="space-y-3 p-5">
        <p class="text-sm text-muted">Drawer ສຳລັບ filter ໃນມືຖື.</p>
        <BaseSelect v-model="form.product" label="ປະເພດ" :options="productOptions" />
        <BaseButton block @click="drawerOpen = false">ນຳໃຊ້</BaseButton>
      </div>
    </BaseDrawer>
  </main>
</template>

<script setup>
import { PRODUCT_TYPES } from '~/utils/constants'

const ui = useUiStore()
const format = useFormat()
const toast = useToast()
const { confirm } = useConfirm()

const form = reactive({
  name: '',
  email: '',
  password: '',
  phone: '',
  product: '',
  status: 'active',
  note: '',
  remember: false,
  notify: true,
  gender: 'male',
})

const productOptions = PRODUCT_TYPES
const statusOptions = [
  { value: 'active', label: 'ມີຜົນ' },
  { value: 'pending', label: 'ລໍຖ້າ' },
  { value: 'expired', label: 'ໝົດອາຍຸ' },
]

const tab = ref('all')
const tabs = [
  { key: 'all', label: 'ທັງໝົດ', count: 1245 },
  { key: 'active', label: 'ມີຜົນ', count: 1100 },
  { key: 'expiring', label: 'ໃກ້ໝົດອາຍຸ', count: 45 },
]

const stepperSteps = [
  { label: 'ຂໍ້ມູນລູກຄ້າ', description: 'ເລືອກ ຫຼື ເພີ່ມລູກຄ້າ' },
  { label: 'ຂໍ້ມູນລົດ', description: 'ລາຍລະອຽດລົດ' },
  { label: 'ແຜນປະກັນ', description: 'ເລືອກແຜນ' },
  { label: 'ຢືນຢັນ', description: 'ກວດສອບ' },
]
const step = ref(0)

const search = ref('')
const range = reactive({ from: '', to: '' })
const file = ref(null)
const modalOpen = ref(false)
const drawerOpen = ref(false)

const policies = [
  {
    id: 1,
    policyNumber: 'P-2026-001234',
    customer: 'ສົມສັກ ບຸນທະວີ',
    type: 'ລົດຍົນ',
    premium: 1500000,
    status: 'active',
  },
  {
    id: 2,
    policyNumber: 'P-2026-001235',
    customer: 'ນິດຊາ ວົງສາ',
    type: 'ສຸຂະພາບ',
    premium: 3200000,
    status: 'pending',
  },
  {
    id: 3,
    policyNumber: 'P-2026-001236',
    customer: 'ການ ພົມມະສານ',
    type: 'ອັກຄີໄພ',
    premium: 5000000,
    status: 'active',
  },
  {
    id: 4,
    policyNumber: 'P-2025-009876',
    customer: 'ຈິນດາ ທຳມະວົງ',
    type: 'ລົດຍົນ',
    premium: 1200000,
    status: 'expired',
  },
  {
    id: 5,
    policyNumber: 'P-2026-001240',
    customer: 'ວິໄລ ແກ້ວມະນີ',
    type: 'ອຸບັດຕິເຫດ',
    premium: 500000,
    status: 'active',
  },
]

const columns = [
  { key: 'policyNumber', label: 'ເລກປະກັນໄພ', sortable: true },
  { key: 'customer', label: 'ຜູ້ເອົາປະກັນ' },
  { key: 'type', label: 'ປະເພດ', hideOn: ['mobile'] },
  { key: 'premium', label: 'ເບ້ຍປະກັນ', align: 'right', sortable: true },
  { key: 'status', label: 'ສະຖານະ', align: 'center' },
]

const tableRows = ref([...policies])
const tableLoading = ref(false)
const tableError = ref(false)
const tablePage = ref(1)
const selected = ref([])

const onSearch = (value) => {
  tableRows.value = policies.filter((policy) => policy.customer.includes(value))
}

const confirmDelete = async () => {
  const accepted = await confirm({
    title: 'ລຶບຂໍ້ມູນ',
    message: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ?',
    confirmLabel: 'ລຶບ',
    tone: 'danger',
  })
  if (accepted) toast.success('ລຶບສຳເລັດ')
}

definePageMeta({
  layout: 'blank',
  middleware: 'dev-only',
  title: 'Component catalog',
})
</script>
