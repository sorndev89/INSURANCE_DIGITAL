<template>
  <SalesReportView
    title="ລາຍງານຍອດຂາຍໄຕມາດ"
    description="ຍອດຂາຍລວມຕາມໄຕມາດ"
    granularity="quarterly"
    group-by="total"
  />
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  title: 'ລາຍງານຍອດຂາຍໄຕມາດ',
  permission: 'report.view',
})
</script>
