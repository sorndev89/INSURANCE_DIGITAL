<template>
  <ReportPage
    title="ສະຫຼຸບຜົນປະກອບການ"
    description="KPI ຫຼັກ, ຍອດຂາຍ 12 ເດືອນ, ສັດສ່ວນຜະລິດຕະພັນ."
    report-type="summary"
  >
    <template #default="{ range }">
      <SummaryReport :range="range" />
    </template>
  </ReportPage>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  title: 'ສະຫຼຸບຜົນປະກອບການ',
  permission: 'report.view',
})
</script>
