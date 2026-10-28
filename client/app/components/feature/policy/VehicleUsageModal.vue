<template>
  <BaseModal
    :model-value="modelValue"
    title="ລົດຮັບຈ້າງ ຫຼື ສ່ວນຕົວ?"
    size="md"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="space-y-4">
      <div class="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
        <span
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-text"
        >
          <BaseIcon :name="categoryMeta.icon" size="lg" />
        </span>
        <div>
          <p class="text-sm font-bold">ປະເພດລົດ: {{ categoryMeta.label }}</p>
          <p class="text-xs text-muted">
            ລາຄາເບ້ຍປະກັນແຕກຕ່າງກັນຕາມລັກສະນະການນຳໃຊ້
          </p>
        </div>
      </div>

      <div class="grid gap-3">
        <button
          v-for="option in VEHICLE_USAGE_OPTIONS"
          :key="option.value"
          type="button"
          class="flex items-start gap-3 rounded-xl border p-4 text-left transition-all"
          :class="
            selected === option.value
              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
              : 'border-line hover:border-primary/60'
          "
          :aria-pressed="selected === option.value"
          @click="selected = option.value"
        >
          <BaseIcon
            :name="selected === option.value ? 'check_circle' : 'radio_button_unchecked'"
            :class="selected === option.value ? 'text-primary-text' : 'text-muted'"
            size="lg"
          />
          <span class="min-w-0">
            <span class="block text-sm font-bold">{{ option.label }}</span>
            <span class="mt-1 block text-xs text-muted">{{ option.description }}</span>
            <span class="mt-2 inline-block text-xs font-bold text-primary-text">
              ປັບລາຄາ x{{ option.factor }}
            </span>
          </span>
        </button>
      </div>

      <p class="text-xs text-muted">
        ຕົວຢ່າງ: ລົດສ່ວນຕົວໃຊ້ເບ້ຍພື້ນຖານ, ລົດຮັບຈ້າງຈະຖືກປັບລາຄາຂຶ້ນ 25% ເພື່ອສະທ້ອນຄວາມສ່ຽງ.
      </p>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton variant="secondary" @click="$emit('update:modelValue', false)">ຍົກເລີກ</BaseButton>
        <BaseButton icon="check" @click="confirm">ຢືນຢັນການນຳໃຊ້</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { VEHICLE_USAGE_OPTIONS, VEHICLE_CATEGORIES } from '~/utils/constants'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  category: { type: String, default: 'sedan' },
  usage: { type: String, default: 'private' },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const selected = ref(props.usage)

watch(
  () => props.modelValue,
  (open) => {
    if (open) selected.value = props.usage || 'private'
  },
)

const categoryMeta = computed(
  () => VEHICLE_CATEGORIES.find((item) => item.value === props.category) || VEHICLE_CATEGORIES[0],
)

const confirm = () => {
  emit('confirm', selected.value)
  emit('update:modelValue', false)
}
</script>
