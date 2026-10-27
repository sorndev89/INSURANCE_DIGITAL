<template>
  <div class="space-y-6">
    <PageHeader
      title="ຈັດການ ສິດ ບົດບາດ"
      description="ສ້າງ ແລະ ຈັດການບົດບາດ, ກຳນົດສິດການເຂົ້າເຖິງຂອງແຕ່ລະບົດບາດ."
    />

    <BaseTabs v-model="activeTab" :items="tabs" />

    <div v-if="loading" class="space-y-4">
      <BaseSkeleton height="xl" />
      <BaseSkeleton height="xl" />
      <BaseSkeleton height="xl" />
    </div>
    <ErrorState v-else-if="loadError" :message="loadError" @retry="load" />

    <template v-else>
      <section v-if="activeTab === 'roles'" class="space-y-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="w-full sm:w-80">
            <SearchInput v-model="roleQuery" label="ຄົ້ນຫາບົດບາດ" placeholder="ຊື່ ຫຼື key..." />
          </div>
          <BaseButton icon="add" @click="openCreate">ສ້າງບົດບາດ</BaseButton>
        </div>

        <BaseCard flush>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[720px] text-sm">
              <thead class="border-b border-line bg-surface-muted/60 text-left text-xs text-muted">
                <tr>
                  <th class="px-4 py-3 font-bold">ບົດບາດ</th>
                  <th class="px-4 py-3 font-bold">ປະເພດ</th>
                  <th class="px-4 py-3 font-bold">ສິດ</th>
                  <th class="px-4 py-3 font-bold">ຜູ້ໃຊ້</th>
                  <th class="px-4 py-3 font-bold">ໜ້າເລີ່ມຕົ້ນ</th>
                  <th class="px-4 py-3 text-right font-bold">ຈັດການ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line">
                <tr v-for="role in filteredRoles" :key="role.id" class="hover:bg-surface-muted/40">
                  <td class="px-4 py-3">
                    <p class="font-bold">{{ role.name }}</p>
                    <p class="mt-0.5 font-mono text-xs text-muted">{{ role.key }}</p>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex flex-wrap items-center gap-1.5">
                      <BaseBadge :tone="role.isSystem ? 'info' : 'neutral'">
                        {{ role.isSystem ? 'System' : 'Custom' }}
                      </BaseBadge>
                      <BaseBadge v-if="role.isAdmin" tone="success">Admin</BaseBadge>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <span v-if="role.isAdmin" class="font-bold text-primary-text">ທັງໝົດ</span>
                    <span v-else class="tabular-nums">{{ role.permissions.length }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <NuxtLink
                      v-if="role.userCount > 0"
                      :to="{ path: '/users', query: { role: role.key } }"
                      class="font-bold text-primary-text hover:underline"
                    >
                      {{ role.userCount }}
                    </NuxtLink>
                    <span v-else class="text-muted">0</span>
                  </td>
                  <td class="px-4 py-3 text-muted">{{ landingLabel(role.landingPath) }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-1">
                      <BaseButton
                        variant="ghost"
                        size="sm"
                        icon-only
                        label="ແກ້ໄຂ"
                        icon="edit"
                        @click="openEdit(role)"
                      />
                      <BaseButton
                        v-if="!role.isSystem"
                        variant="ghost"
                        size="sm"
                        icon-only
                        label="ລຶບ"
                        icon="delete"
                        @click="removeRole(role)"
                      />
                    </div>
                  </td>
                </tr>
                <tr v-if="!filteredRoles.length">
                  <td colspan="6" class="px-4 py-10 text-center text-sm text-muted">
                    ບໍ່ພົບບົດບາດ
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </BaseCard>
      </section>

      <section v-else class="grid gap-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <BaseCard padding="sm" class="lg:sticky lg:top-4 lg:max-h-[calc(100dvh-9rem)]">
          <SearchInput
            v-model="permissionQuery"
            label="ຄົ້ນຫາສິດ"
            placeholder="ຊື່ ສິດ ຫຼື key..."
          />
          <div class="mt-3 space-y-4 overflow-y-auto pr-1 lg:max-h-[calc(100dvh-14rem)]">
            <div v-for="group in filteredGroups" :key="group.key">
              <p class="px-2 text-xs font-bold uppercase tracking-wider text-muted">
                {{ group.title }}
              </p>
              <div class="mt-1.5 space-y-1">
                <button
                  v-for="permission in group.permissions"
                  :key="permission.key"
                  type="button"
                  class="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors"
                  :class="
                    activePermissionKey === permission.key
                      ? 'bg-primary/10 text-primary-text'
                      : 'text-foreground hover:bg-surface-muted'
                  "
                  @click="activePermissionKey = permission.key"
                >
                  <span class="min-w-0 flex-1">
                    <span class="block truncate text-sm font-bold">{{ permission.label }}</span>
                    <span class="mt-0.5 block truncate font-mono text-[11px] text-muted">
                      {{ permission.key }}
                    </span>
                  </span>
                  <BaseBadge tone="neutral">{{ rolePermissionCount(permission.key) }}</BaseBadge>
                </button>
              </div>
            </div>
            <p v-if="!filteredGroups.length" class="px-2 py-6 text-center text-xs text-muted">
              ບໍ່ພົບສິດ
            </p>
          </div>
        </BaseCard>

        <BaseCard v-if="selectedPermission" padding="lg">
          <div class="rounded-xl border border-line bg-surface-muted/40 p-4">
            <p class="text-xs font-bold uppercase tracking-wider text-muted">
              {{ selectedGroup?.title }}
            </p>
            <h2 class="mt-1 text-lg font-bold">{{ selectedPermission.label }}</h2>
            <p class="mt-1 font-mono text-xs text-muted">{{ selectedPermission.key }}</p>
          </div>

          <div class="mt-4">
            <h3 class="px-1 text-sm font-bold">ບົດບາດທີ່ມີສິດນີ້</h3>
            <div class="mt-2 divide-y divide-line rounded-xl border border-line">
              <div v-for="role in roles" :key="role.id" class="px-4 py-3">
                <BaseSwitch
                  :model-value="role.isAdmin || role.permissions.includes(selectedPermission.key)"
                  :label="role.name"
                  :description="role.key"
                  :disabled="role.isAdmin || isSavingRole(role.id)"
                  @update:model-value="toggleRolePermission(role, $event)"
                />
              </div>
            </div>
          </div>
        </BaseCard>
        <BaseCard v-else padding="lg">
          <p class="text-sm text-muted">ເລືອກສິດທາງຊ້າຍເພື່ອເບິ່ງ ແລະ ກຳນົດບົດບາດ.</p>
        </BaseCard>
      </section>
    </template>

    <BaseModal v-model="formOpen" :title="isEditing ? 'ແກ້ໄຂບົດບາດ' : 'ສ້າງບົດບາດໃໝ່'" size="lg">
      <div v-if="isAdminRole" class="rounded-xl border border-line bg-surface-muted/40 p-4">
        <p class="text-sm font-bold">{{ editingRole?.name }} (admin)</p>
        <p class="mt-1 text-xs text-muted">
          ບົດບາດນີ້ມີສິດເຕັມໃນລະບົບ ແລະ ບໍ່ສາມາດແກ້ໄຂ ຫຼື ລຶບໄດ້.
        </p>
      </div>
      <div v-else class="space-y-5">
        <div class="grid gap-4 sm:grid-cols-2">
          <BaseInput
            v-model="form.name"
            label="ຊື່ບົດບາດ"
            required
            maxlength="100"
            :disabled="isSystemRole"
            :error="formErrors.name"
          />
          <BaseInput
            v-model="form.key"
            label="Key"
            maxlength="50"
            :disabled="isSystemRole || isEditing"
            placeholder="ວ່າງ = ສ້າງອັດຕະໂນມັດ"
            hint="ຕົວພິມນ້ອຍ, ຕົວເລກ, - ແລະ _"
            :error="formErrors.key"
          />
        </div>
        <BaseTextarea
          v-model="form.description"
          label="ຄຳອະທິບາຍ"
          :rows="2"
          maxlength="255"
          :disabled="isSystemRole"
        />
        <BaseSelect
          v-model="form.landingPath"
          label="ໜ້າເລີ່ມຕົ້ນ"
          :options="landingOptions"
          :disabled="isSystemRole"
        />

        <div class="space-y-4">
          <section v-for="group in catalogGroups" :key="group.key">
            <div class="mb-2 flex items-center justify-between gap-3">
              <h3 class="text-sm font-bold">{{ group.title }}</h3>
              <button
                type="button"
                class="text-xs font-bold text-primary-text hover:underline"
                @click="toggleFormGroup(group)"
              >
                {{ isFormGroupEnabled(group) ? 'ປິດທັງໝົດ' : 'ເປີດທັງໝົດ' }}
              </button>
            </div>
            <div class="divide-y divide-line rounded-xl border border-line">
              <div
                v-for="permission in group.permissions"
                :key="permission.key"
                class="px-3.5 py-3"
              >
                <BaseSwitch
                  :model-value="form.permissions.includes(permission.key)"
                  :label="permission.label"
                  :description="permission.key"
                  @update:model-value="toggleFormPermission(permission.key, $event)"
                />
              </div>
            </div>
          </section>

          <section class="rounded-xl border border-dashed border-line bg-surface-muted/40 p-4">
            <h3 class="text-sm font-bold">ສິດລະບົບ (ສະເພາະ admin)</h3>
            <p class="mt-1 text-xs text-muted">
              ບໍ່ສາມາດມອບໃຫ້ບົດບາດອື່ນໄດ້ ເພື່ອປ້ອງກັນການຍົກສິດ.
            </p>
            <div class="mt-3 flex flex-wrap gap-2">
              <BaseBadge
                v-for="permission in systemPermissions"
                :key="permission.key"
                tone="neutral"
              >
                {{ permission.label }}
              </BaseBadge>
            </div>
          </section>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton variant="secondary" @click="formOpen = false">ຍົກເລີກ</BaseButton>
          <BaseButton
            v-if="!isAdminRole"
            icon="save"
            :loading="saving"
            :disabled="saving"
            @click="saveRole"
          >
            ບັນທຶກ
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoles } from '~/composables/api/useRoles'
import { useConfirm } from '~/composables/useConfirm'
import { useToast } from '~/composables/useToast'
import { messageFrom } from '~/utils/apiError'

definePageMeta({
  layout: 'admin',
  title: 'ຈັດການ ສິດ ບົດບາດ',
  permission: 'role.manage',
})

const { list, catalog, create, update, remove } = useRoles()
const { confirm } = useConfirm()
const toast = useToast()

const roles = ref([])
const catalogData = ref(null)
const loading = ref(true)
const loadError = ref('')
const saving = ref(false)
const activeTab = ref('roles')
const roleQuery = ref('')
const permissionQuery = ref('')
const activePermissionKey = ref('')
const savingRoleIds = ref([])

const formOpen = ref(false)
const editingRole = ref(null)
const form = reactive({
  name: '',
  key: '',
  description: '',
  landingPath: '/dashboard',
  permissions: [],
})
const formErrors = reactive({ name: '', key: '' })

const isEditing = computed(() => Boolean(editingRole.value))
const isSystemRole = computed(() => Boolean(editingRole.value?.isSystem))
const isAdminRole = computed(() => Boolean(editingRole.value?.isAdmin))

const catalogGroups = computed(() => catalogData.value?.groups || [])
const systemPermissions = computed(() => catalogData.value?.system?.permissions || [])
const landingOptions = computed(() => catalogData.value?.landingPaths || [])
const allPermissions = computed(() => catalogGroups.value.flatMap((group) => group.permissions))

const tabs = computed(() => [
  { key: 'roles', label: 'ບົດບາດ', count: roles.value.length },
  { key: 'permissions', label: 'ສິດ', count: allPermissions.value.length },
])

const filteredRoles = computed(() => {
  const query = roleQuery.value.trim().toLowerCase()
  if (!query) return roles.value
  return roles.value.filter(
    (role) => role.name.toLowerCase().includes(query) || role.key.toLowerCase().includes(query),
  )
})

const filteredGroups = computed(() => {
  const query = permissionQuery.value.trim().toLowerCase()
  if (!query) return catalogGroups.value
  return catalogGroups.value
    .map((group) => ({
      ...group,
      permissions: group.permissions.filter(
        (permission) =>
          permission.label.toLowerCase().includes(query) ||
          permission.key.toLowerCase().includes(query),
      ),
    }))
    .filter((group) => group.permissions.length > 0)
})

const selectedPermission = computed(() =>
  allPermissions.value.find((permission) => permission.key === activePermissionKey.value),
)
const selectedGroup = computed(() =>
  catalogGroups.value.find((group) =>
    group.permissions.some((permission) => permission.key === activePermissionKey.value),
  ),
)

const landingLabel = (value) =>
  landingOptions.value.find((option) => option.value === value)?.label || value

const rolePermissionCount = (permissionKey) =>
  roles.value.filter((role) => role.isAdmin || role.permissions.includes(permissionKey)).length

const isSavingRole = (id) => savingRoleIds.value.includes(id)

const markSavingRole = (id, active) => {
  savingRoleIds.value = active
    ? [...new Set([...savingRoleIds.value, id])]
    : savingRoleIds.value.filter((value) => value !== id)
}

const load = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const [roleList, catalogResponse] = await Promise.all([list(), catalog()])
    roles.value = roleList
    catalogData.value = catalogResponse
    if (!allPermissions.value.some((permission) => permission.key === activePermissionKey.value)) {
      activePermissionKey.value = allPermissions.value[0]?.key || ''
    }
  } catch (error) {
    loadError.value = messageFrom(error, 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນບົດບາດໄດ້')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.assign(form, {
    name: '',
    key: '',
    description: '',
    landingPath: '/dashboard',
    permissions: ['dashboard.view', 'profile.view'],
  })
  formErrors.name = ''
  formErrors.key = ''
}

const openCreate = () => {
  editingRole.value = null
  resetForm()
  formOpen.value = true
}

const openEdit = (role) => {
  editingRole.value = role
  Object.assign(form, {
    name: role.name,
    key: role.key,
    description: role.description || '',
    landingPath: role.landingPath || '/dashboard',
    permissions: [...role.permissions],
  })
  formErrors.name = ''
  formErrors.key = ''
  formOpen.value = true
}

const toggleFormPermission = (key, enabled) => {
  form.permissions = enabled
    ? [...new Set([...form.permissions, key])]
    : form.permissions.filter((permission) => permission !== key)
}

const isFormGroupEnabled = (group) =>
  group.permissions.every((permission) => form.permissions.includes(permission.key))

const toggleFormGroup = (group) => {
  const keys = group.permissions.map((permission) => permission.key)
  if (isFormGroupEnabled(group)) {
    form.permissions = form.permissions.filter((key) => !keys.includes(key))
    return
  }
  form.permissions = [...new Set([...form.permissions, ...keys])]
}

const validateForm = () => {
  formErrors.name = form.name.trim().length < 2 ? 'ກະລຸນາປ້ອນຊື່ຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ' : ''
  const key = form.key.trim()
  formErrors.key =
    key && !/^[a-z][a-z0-9_-]{1,49}$/.test(key) ? 'Key ຕ້ອງເລີ່ມດ້ວຍຕົວພິມນ້ອຍ ແລະ ມີ 2-50 ຕົວ' : ''
  return !formErrors.name && !formErrors.key
}

const saveRole = async () => {
  if (!validateForm()) return

  saving.value = true
  try {
    if (isSystemRole.value) {
      await update(editingRole.value.id, { permissions: [...form.permissions] })
    } else {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        landingPath: form.landingPath,
        permissions: [...form.permissions],
      }
      if (!isEditing.value && form.key.trim()) payload.key = form.key.trim()
      if (isEditing.value) {
        await update(editingRole.value.id, payload)
      } else {
        await create(payload)
      }
    }
    toast.success(isEditing.value ? 'ອັບເດດບົດບາດແລ້ວ' : 'ສ້າງບົດບາດແລ້ວ')
    formOpen.value = false
    await load()
  } catch (error) {
    toast.error(messageFrom(error, 'ບໍ່ສາມາດບັນທຶກບົດບາດໄດ້'))
  } finally {
    saving.value = false
  }
}

const removeRole = async (role) => {
  if (role.userCount > 0) {
    toast.warning(`ບົດບາດນີ້ມີຜູ້ໃຊ້ ${role.userCount} ຄົນ. ກະລຸນາຍ້າຍຜູ້ໃຊ້ກ່ອນລຶບ.`)
    return
  }

  const accepted = await confirm({
    title: 'ລຶບບົດບາດ',
    message: `ລຶບບົດບາດ ${role.name}? ການກະທຳນີ້ບໍ່ສາມາດກູ້ຄືນໄດ້.`,
    confirmLabel: 'ລຶບ',
    tone: 'danger',
  })
  if (!accepted) return

  try {
    await remove(role.id)
    toast.success('ລຶບບົດບາດແລ້ວ')
    await load()
  } catch (error) {
    toast.error(messageFrom(error, 'ບໍ່ສາມາດລຶບບົດບາດໄດ້'))
  }
}

const toggleRolePermission = async (role, enabled) => {
  if (role.isAdmin || !selectedPermission.value) return
  const permissionKey = selectedPermission.value.key
  const previous = [...role.permissions]
  const next = enabled
    ? [...new Set([...previous, permissionKey])]
    : previous.filter((permission) => permission !== permissionKey)

  role.permissions = next
  markSavingRole(role.id, true)

  try {
    const updated = await update(role.id, { permissions: next })
    if (updated) Object.assign(role, updated)
    toast.success('ອັບເດດສິດແລ້ວ')
  } catch (error) {
    role.permissions = previous
    toast.error(messageFrom(error, 'ບໍ່ສາມາດອັບເດດສິດໄດ້'))
  } finally {
    markSavingRole(role.id, false)
  }
}

onMounted(load)
</script>
