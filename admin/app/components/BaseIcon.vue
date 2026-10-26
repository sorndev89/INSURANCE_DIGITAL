<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: [String, Number], default: 18 },
})
</script>

<template>
  <svg
    class="inline-block shrink-0 fill-none stroke-current"
    :style="{ width: `${size}px`, height: `${size}px` }"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- Dashboard -->
    <template v-if="name === 'dashboard'">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </template>

    <!-- Tenants / Building -->
    <template v-else-if="name === 'tenants' || name === 'building'">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v8h4" />
      <path d="M18 9h2a2 2 0 0 1 2 2v11h-4" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </template>

    <!-- Plans / Credit Card -->
    <template v-else-if="name === 'plans' || name === 'credit-card'">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </template>

    <!-- Domains / Globe -->
    <template v-else-if="name === 'domains' || name === 'globe'">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </template>

    <!-- Audit / Clipboard -->
    <template v-else-if="name === 'audit' || name === 'clipboard'">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M9 14h6" />
      <path d="M9 18h6" />
      <path d="M9 10h2" />
    </template>

    <!-- Health / Activity -->
    <template v-else-if="name === 'health' || name === 'activity'">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </template>

    <!-- Search -->
    <template v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </template>

    <!-- Sun -->
    <template v-else-if="name === 'sun'">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </template>

    <!-- Moon -->
    <template v-else-if="name === 'moon'">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </template>

    <!-- Impersonate / User Check -->
    <template v-else-if="name === 'impersonate' || name === 'user-check'">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </template>

    <!-- Copy -->
    <template v-else-if="name === 'copy'">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </template>

    <!-- External Link -->
    <template v-else-if="name === 'external-link'">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </template>

    <!-- Logout -->
    <template v-else-if="name === 'logout'">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </template>

    <!-- Menu -->
    <template v-else-if="name === 'menu'">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </template>

    <!-- Close -->
    <template v-else-if="name === 'close'">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </template>

    <!-- Check -->
    <template v-else-if="name === 'check'">
      <polyline points="20 6 9 17 4 12" />
    </template>

    <!-- Alert -->
    <template v-else-if="name === 'alert'">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </template>

    <!-- Arrow / Chevron -->
    <template v-else-if="name === 'chevron-right' || name === 'chevron_right'">
      <polyline points="9 18 15 12 9 6" />
    </template>

    <template v-else-if="name === 'chevron-left' || name === 'chevron_left'">
      <polyline points="15 18 9 12 15 6" />
    </template>

    <template v-else-if="name === 'shield'">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </template>

    <template v-else-if="name === 'menu_open'">
      <line x1="3" y1="12" x2="15" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="18" y2="18" />
      <polyline points="12 9 15 12 12 15" />
    </template>

    <!-- Fallback circle -->
    <template v-else>
      <circle cx="12" cy="12" r="10" />
    </template>
  </svg>
</template>
