<template>
  <div class="space-y-6">
    <PageHeader
      title="ເຮັດປະກັນໄພໃໝ່"
      description="ປ້ອນຂໍ້ມູນຜູ້ເອົາປະກັນ, ລົດ, ແລະ ແຜນປະກັນໄພ ເພື່ອເຮັດປະກັນໄພ."
    />
    <PolicyWizard />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  title: 'ເຮັດປະກັນໄພໃໝ່',
  permission: 'policy.create',
})
</script>
