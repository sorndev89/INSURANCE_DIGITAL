<template>
  <SalesReportView
    title="ລາຍງານຍອດຂາຍລາຍເດືອນ ແຍກຢູ່ເຊີ"
    description="ຍອດຂາຍລາຍເດືອນແຍກຕາມຕົວແທນ"
    granularity="monthly"
    group-by="user"
  />
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  title: 'ລາຍງານຍອດຂາຍລາຍເດືອນ ແຍກຢູ່ເຊີ',
  permission: 'report.view',
})
</script>
