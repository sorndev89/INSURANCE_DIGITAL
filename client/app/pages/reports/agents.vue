<template>
  <ReportPage
    title="ລາຍງານຕົວແທນ"
    description="ຍອດຂາຍ, ເປົ້າໝາຍ, ບັນລຸເປົ້າ ແລະ ຄອມມິດຊັ່ນ."
    report-type="agents"
  >
    <template #default="{ range }">
      <AgentsReport :range="range" />
    </template>
  </ReportPage>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  title: 'ລາຍງານຕົວແທນ',
  permission: 'report.view',
})
</script>
