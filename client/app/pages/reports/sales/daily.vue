<template>
  <SalesReportView
    title="ລາຍງານຍອດຂາຍລາຍມື້"
    description="ຍອດຂາຍລວມຕາມມື້"
    granularity="daily"
    group-by="total"
  />
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  title: 'ລາຍງານຍອດຂາຍລາຍມື້',
  permission: 'report.view',
})
</script>
