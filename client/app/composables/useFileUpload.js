import { ref } from 'vue'
import { useRuntimeConfig } from '#imports'
import { tenantPath } from '~/config/api'
import { buildUploadBody } from '~/utils/uploads'
import { useApiClient } from './api/useApiClient'
import { messageFrom } from '~/utils/apiError'

export const useFileUpload = () => {
  const config = useRuntimeConfig()
  const { apiFetch } = useApiClient()
  const uploading = ref(false)
  const error = ref('')

  const upload = async (file) => {
    if (!file) throw new Error('ກະລຸນາເລືອກໄຟລ໌')
    uploading.value = true
    error.value = ''
    try {
      const body = await buildUploadBody(file)
      if (config.public.useMock) {
        return {
          url: body.data,
          name: body.filename,
          mimeType: body.mimeType,
          size: body.size,
        }
      }
      const response = await apiFetch(tenantPath('/uploads'), {
        method: 'POST',
        body: {
          filename: body.filename,
          mimeType: body.mimeType,
          data: body.data,
        },
      })
      const data = response.data || {}
      return {
        url: data.url || '',
        name: data.name || body.filename,
        mimeType: data.mimeType || body.mimeType,
        size: data.size ?? body.size,
      }
    } catch (uploadError) {
      error.value = messageFrom(uploadError, 'ອັບໂຫຼດໄຟລ໌ບໍ່ສຳເລັດ')
      throw uploadError
    } finally {
      uploading.value = false
    }
  }

  return { upload, uploading, error }
}
