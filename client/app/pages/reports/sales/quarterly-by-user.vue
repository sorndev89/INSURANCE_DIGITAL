<template>
  <SalesReportView
    title="ລາຍງານຍອດຂາຍໄຕມາດ ແຍກຢູ່ເຊີ"
    description="ຍອດຂາຍໄຕມາດແຍກຕາມຕົວແທນ"
    granularity="quarterly"
    group-by="user"
  />
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  title: 'ລາຍງານຍອດຂາຍໄຕມາດ ແຍກຢູ່ເຊີ',
  permission: 'report.view',
})
</script>
