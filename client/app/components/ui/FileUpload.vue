<template>
  <FormField :for="inputId" :label="label" :hint="hint" :error="errorMessage">
    <input
      :id="inputId"
      ref="inputRef"
      type="file"
      class="sr-only"
      :accept="accept"
      @change="handleInput"
    />

    <div
      v-if="!file"
      class="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-8 text-center transition-colors"
      :class="
        dragActive
          ? 'border-primary bg-primary/5'
          : 'border-line bg-surface-muted hover:border-primary'
      "
      role="button"
      tabindex="0"
      :aria-label="label || 'ເລືອກໄຟລ໌'"
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
      @keydown.space.prevent="openPicker"
      @dragenter.prevent="dragActive = true"
      @dragover.prevent="dragActive = true"
      @dragleave.prevent="dragActive = false"
      @drop.prevent="handleDrop"
    >
      <span
        class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary-text"
      >
        <BaseIcon name="upload_file" size="lg" />
      </span>
      <p class="mt-3 text-sm font-bold text-foreground">ລາກໄຟລ໌ມາວາງ ຫຼື ກົດເພື່ອເລືອກ</p>
      <p class="mt-1 text-xs text-muted">{{ acceptLabel }} · ສູງສຸດ {{ maxSizeMB }} MB</p>
    </div>

    <div v-else class="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
      <img
        v-if="isImage"
        :src="previewUrl"
        :alt="file.name"
        class="h-16 w-16 rounded-lg object-cover"
      />
      <span
        v-else
        class="flex h-16 w-16 items-center justify-center rounded-lg bg-surface-muted text-muted"
      >
        <BaseIcon name="description" size="lg" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-bold text-foreground">{{ file.name }}</p>
        <p class="mt-0.5 text-xs text-muted">
          {{ uploading ? 'ກຳລັງອັບໂຫຼດ...' : formatSize(file.size) }}
        </p>
      </div>
      <BaseButton
        variant="ghost"
        size="sm"
        icon-only
        label="ລຶບໄຟລ໌"
        icon="delete"
        @click="removeFile"
      />
    </div>
  </FormField>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Object, default: null },
  id: { type: String, default: '' },
  label: { type: String, default: 'ເອກະສານ' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  accept: { type: String, default: 'image/*,application/pdf' },
  maxSizeMB: { type: Number, default: 5 },
  autoUpload: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'uploaded'])
const { upload } = useFileUpload()
const inputRef = ref(null)
const dragActive = ref(false)
const uploading = ref(false)
const localError = ref('')
const previewUrl = ref('')
const file = computed(() => props.modelValue || null)
const inputId = computed(() => props.id || `file-${useId()}`)
const errorMessage = computed(() => localError.value || props.error)
const isImage = computed(() => Boolean(file.value?.type?.startsWith('image/')))
const acceptLabel = computed(() => (props.accept.includes('pdf') ? 'ຮູບພາບ ຫຼື PDF' : 'ຮູບພາບ'))

const setPreview = (nextFile) => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = nextFile ? URL.createObjectURL(nextFile) : ''
}

watch(
  () => props.modelValue,
  (nextFile) => {
    setPreview(nextFile)
  },
  { immediate: true },
)

const openPicker = () => inputRef.value?.click()

const validate = (nextFile) => {
  if (!nextFile) return 'ກະລຸນາເລືອກໄຟລ໌'
  if (nextFile.size > props.maxSizeMB * 1024 * 1024) {
    return `ໄຟລ໌ໃຫຍ່ເກີນ ${props.maxSizeMB} MB`
  }
  const accepted = props.accept.split(',').map((item) => item.trim())
  const matches = accepted.some((item) => {
    if (item.endsWith('/*')) return nextFile.type.startsWith(item.replace('/*', '/'))
    return nextFile.type === item
  })
  return matches ? '' : 'ປະເພດໄຟລ໌ບໍ່ຖືກຕ້ອງ'
}

const applyFile = async (nextFile) => {
  const message = validate(nextFile)
  localError.value = message
  if (message) return
  emit('update:modelValue', nextFile)
  emit('uploaded', null)
  if (!props.autoUpload) return

  uploading.value = true
  try {
    const result = await upload(nextFile)
    emit('uploaded', result)
  } catch (uploadError) {
    localError.value = uploadError?.message || 'ອັບໂຫຼດໄຟລ໌ບໍ່ສຳເລັດ'
  } finally {
    uploading.value = false
  }
}

const handleInput = (event) => {
  void applyFile(event.target.files?.[0])
  event.target.value = ''
}

const handleDrop = (event) => {
  dragActive.value = false
  void applyFile(event.dataTransfer?.files?.[0])
}

const removeFile = () => {
  localError.value = ''
  emit('update:modelValue', null)
  emit('uploaded', null)
}

const formatSize = (bytes) => {
  if (!bytes) return '0 KB'
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>
