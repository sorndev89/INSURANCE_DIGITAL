<template>
  <SalesReportView
    title="ລາຍງານຍອດຂາຍລາຍປີ ແຍກຢູ່ເຊີ"
    description="ຍອດຂາຍລາຍປີແຍກຕາມຕົວແທນ"
    granularity="annual"
    group-by="user"
  />
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  title: 'ລາຍງານຍອດຂາຍລາຍປີ ແຍກຢູ່ເຊີ',
  permission: 'report.view',
})
</script>
