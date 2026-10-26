<template>
  <ReportPage
    title="ລາຍງານການເງິນ"
    description="ໃບແຈ້ງໜີ້, ການຮັບເງິນ, ອາຍຸໜີ້ ແລະ ອັດຕາເກັບເງິນ."
    report-type="finance"
  >
    <template #default="{ range }">
      <FinanceReport :range="range" />
    </template>
  </ReportPage>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  title: 'ລາຍງານການເງິນ',
  permission: 'report.view',
})
</script>
