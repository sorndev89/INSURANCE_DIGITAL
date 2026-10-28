<template>
  <SalesReportView
    title="ລາຍງານຍອດຂາຍລາຍເດືອນ"
    description="ຍອດຂາຍລວມຕາມເດືອນ"
    granularity="monthly"
    group-by="total"
  />
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  title: 'ລາຍງານຍອດຂາຍລາຍເດືອນ',
  permission: 'report.view',
})
</script>
