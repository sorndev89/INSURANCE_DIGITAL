<template>
  <ReportPage
    title="ລາຍງານສະເໜີລາຄາ"
    description="ສະຖານະໃບສະເໜີລາຄາ, ອັດຕາແປງເປັນສັນຍາ ແລະ ມູນຄ່າລໍຖ້າປິດ."
    report-type="quotations"
  >
    <template #default="{ range }">
      <QuotationsReport :range="range" />
    </template>
  </ReportPage>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  title: 'ລາຍງານສະເໜີລາຄາ',
  permission: 'report.view',
})
</script>
