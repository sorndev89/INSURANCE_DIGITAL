<template>
  <ReportPage
    title="ລາຍງານປະກັນໄພ"
    description="ສະຖານະສັນຍາ, ສັນຍາໃໝ່ ແລະ ປະກັນໄພໃກ້ໝົດອາຍຸ."
    report-type="policies"
  >
    <template #default="{ range }">
      <PoliciesReport :range="range" />
    </template>
  </ReportPage>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  title: 'ລາຍງານປະກັນໄພ',
  permission: 'report.view',
})
</script>
