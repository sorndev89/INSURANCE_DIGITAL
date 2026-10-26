<template>
  <ReportPage
    title="ລາຍງານລູກຄ້າ"
    description="ຈຳນວນລູກຄ້າ, ລູກຄ້າໃໝ່ ແລະ ລູກຄ້າຍອດສູງ."
    report-type="customers"
  >
    <template #default="{ range }">
      <CustomersReport :range="range" />
    </template>
  </ReportPage>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  title: 'ລາຍງານລູກຄ້າ',
  permission: 'report.view',
})
</script>
