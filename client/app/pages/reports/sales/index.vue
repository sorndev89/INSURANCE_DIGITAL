<script setup>
definePageMeta({
  redirect: (route) => {
    const allowed = ['daily', 'monthly', 'quarterly', 'annual']
    const granularity = allowed.includes(String(route.query.granularity))
      ? String(route.query.granularity)
      : 'monthly'
    const byUser = route.query.groupBy === 'user'
    const query = { ...route.query }
    delete query.granularity
    delete query.groupBy
    return {
      path: `/reports/sales/${granularity}${byUser ? '-by-user' : ''}`,
      query,
    }
  },
})
</script>

<template>
  <div />
</template>
