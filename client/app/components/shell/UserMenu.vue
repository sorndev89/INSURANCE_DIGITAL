<template>
  <BaseDropdown
    align="end"
    width="md"
    label="ເມນູຜູ້ໃຊ້"
    trigger-class="gap-2 rounded-xl p-1.5 hover:bg-surface-muted"
  >
    <template #trigger>
      <BaseAvatar :src="auth.user?.avatar" :name="auth.displayName" size="sm" />
      <span class="hidden text-left sm:block">
        <span class="block max-w-36 truncate text-xs font-bold text-foreground">{{
          auth.displayName
        }}</span>
        <span class="block text-xs text-muted">{{ auth.roleLabel }}</span>
      </span>
      <BaseIcon name="expand_more" size="sm" class="text-muted" />
    </template>

    <template #menu="{ close }">
      <div class="border-b border-line px-2 py-2">
        <p class="text-xs text-muted">ເຂົ້າໃຊ້ເປັນ</p>
        <p class="truncate text-sm font-bold">{{ auth.user?.email || 'admin@saiyfon.com' }}</p>
      </div>
      <NuxtLink
        to="/profile"
        role="menuitem"
        class="mt-1 flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-surface-muted"
        @click="close()"
      >
        <BaseIcon name="person" size="sm" class="text-muted" />
        ຂໍ້ມູນສ່ວນຕົວ
      </NuxtLink>
      <NuxtLink
        to="/profile"
        role="menuitem"
        class="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-surface-muted"
        @click="close()"
      >
        <BaseIcon name="settings" size="sm" class="text-muted" />
        ຕັ້ງຄ່າການໃຊ້ງານ
      </NuxtLink>
      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm font-bold text-foreground transition-colors hover:bg-surface-muted"
        @click="ui.toggleTheme()"
      >
        <BaseIcon :name="ui.isDark ? 'light_mode' : 'dark_mode'" size="sm" class="text-muted" />
        {{ ui.isDark ? 'Light mode' : 'Dark mode' }}
      </button>
      <div class="my-1 border-t border-line" />
      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm font-bold text-danger transition-colors hover:bg-danger/10"
        @click="handleLogout(close)"
      >
        <BaseIcon name="logout" size="sm" />
        ອອກຈາກລະບົບ
      </button>
    </template>
  </BaseDropdown>
</template>

<script setup>
const auth = useAuthStore()
const ui = useUiStore()

const handleLogout = (close) => {
  close()
  auth.logout()
  navigateTo('/login')
}
</script>
