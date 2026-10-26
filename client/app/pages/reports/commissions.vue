<template>
  <ReportPage
    title="ລາຍງານຄອມມິດຊັ່ນ"
    description="ຄອມມິດຊັ່ນລໍຖ້າຈ່າຍ, ຈ່າຍແລ້ວ ແລະ ລາຍລະອຽດຕາມຕົວແທນ."
    report-type="commissions"
  >
    <template #default="{ range }">
      <CommissionsReport :range="range" />
    </template>
  </ReportPage>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  title: 'ລາຍງານຄອມມິດຊັ່ນ',
  permission: 'report.view',
})
</script>
