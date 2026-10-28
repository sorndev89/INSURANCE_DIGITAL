<template>
  <SalesReportView
    title="ລາຍງານຍອດຂາຍລາຍປີ"
    description="ຍອດຂາຍລວມຕາມປີ"
    granularity="annual"
    group-by="total"
  />
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  title: 'ລາຍງານຍອດຂາຍລາຍປີ',
  permission: 'report.view',
})
</script>
