<template>
  <ReportPage
    title="ລາຍງານເຄມ"
    description="ສະຖານະເຄມ, ມູນຄ່າ, ອັດຕາເຄມ ແລະ ເຄມລ່າສຸດ."
    report-type="claims"
  >
    <template #default="{ range }">
      <ClaimsReport :range="range" />
    </template>
  </ReportPage>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  title: 'ລາຍງານເຄມ',
  permission: 'report.view',
})
</script>
