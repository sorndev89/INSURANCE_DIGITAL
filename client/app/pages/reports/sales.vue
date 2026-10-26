<template>
  <ReportPage
    title="ລາຍງານຍອດຂາຍ"
    description="ເບ້ຍປະກັນ, ຍອດຂາຍຕາມເດືອນ, ຜະລິດຕະພັນ, ບໍລິສັດ ແລະ ຕົວແທນ."
    report-type="sales"
  >
    <template #default="{ range }">
      <SalesReport :range="range" />
    </template>
  </ReportPage>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  title: 'ລາຍງານຍອດຂາຍ',
  permission: 'report.view',
})
</script>
