<template>
  <ReportPage
    title="ລາຍງານທີມ"
    description="ສະມາຊິກ, ຍອດຂາຍ ແລະ ການບັນລຸເປົ້າໝາຍຂອງແຕ່ລະທີມ."
    report-type="teams"
  >
    <template #default="{ range }">
      <TeamsReport :range="range" />
    </template>
  </ReportPage>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  title: 'ລາຍງານທີມ',
  permission: 'report.view',
})
</script>
