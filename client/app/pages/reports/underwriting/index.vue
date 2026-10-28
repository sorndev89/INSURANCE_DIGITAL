<script setup>
definePageMeta({
  redirect: (route) => {
    const mapping = {
      dateRange: 'date-range',
      company: 'company',
      expiration: 'expiration',
      agentExpiry: 'expiration-by-agent',
    }
    const target = mapping[String(route.query.tab)] || 'date-range'
    const query = { ...route.query }
    delete query.tab
    return { path: `/reports/underwriting/${target}`, query }
  },
})
</script>

<template>
  <div />
</template>
