<template>
  <UnderwritingReportView
    title="ລາຍງານຕາມຊ່ວງວັນທີ"
    description="ລາຍງານປະກັນໄພຕາມຊ່ວງວັນທີທີ່ກຳນົດ"
    mode="dateRange"
  />
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  title: 'ລາຍງານຕາມຊ່ວງວັນທີ',
  permission: 'report.view',
})
</script>
