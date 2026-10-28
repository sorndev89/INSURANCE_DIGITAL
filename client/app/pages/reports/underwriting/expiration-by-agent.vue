<template>
  <UnderwritingReportView
    title="ລາຍງານໝົດອາຍຸແຍກຕາມຕົວແທນ"
    description="ສັນຍາໃກ້ໝົດອາຍຸສະເພາະຕົວແທນທີ່ເລືອກ"
    mode="agentExpiry"
  />
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  title: 'ລາຍງານໝົດອາຍຸແຍກຕາມຕົວແທນ',
  permission: 'report.view',
})
</script>
