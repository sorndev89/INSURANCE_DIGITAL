<template>
  <SalesReportView
    title="ລາຍງານຍອດຂາຍລາຍມື້ ແຍກຢູ່ເຊີ"
    description="ຍອດຂາຍລາຍມື້ແຍກຕາມຕົວແທນ"
    granularity="daily"
    group-by="user"
  />
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  title: 'ລາຍງານຍອດຂາຍລາຍມື້ ແຍກຢູ່ເຊີ',
  permission: 'report.view',
})
</script>
