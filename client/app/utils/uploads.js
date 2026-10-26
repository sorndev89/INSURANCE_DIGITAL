export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export const isDownloadableAsset = (value) => {
  if (typeof value !== 'string') return false
  const normalized = value.trim()
  if (!normalized) return false
  return (
    normalized.startsWith('/') ||
    normalized.startsWith('data:') ||
    normalized.startsWith('http:') ||
    normalized.startsWith('https:')
  )
}

export const resolveAttachmentUrl = (value, apiBase = '') => {
  if (!isDownloadableAsset(value)) return ''
  const normalized = value.trim()
  if (normalized.startsWith('/') && apiBase) {
    return `${String(apiBase).replace(/\/$/, '')}${normalized}`
  }
  return normalized
}

export const attachmentName = (value) => {
  if (value && typeof value === 'object') {
    return value.name || value.filename || value.url || 'ເອກະສານ'
  }
  if (typeof value !== 'string') return 'ເອກະສານ'
  if (value.startsWith('data:')) return 'ເອກະສານ'
  const clean = value.split('?')[0]
  const segment = clean.slice(clean.lastIndexOf('/') + 1)
  return decodeURIComponent(segment || value)
}

export const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('ກະລຸນາເລືອກໄຟລ໌'))
      return
    }
    if (typeof FileReader === 'undefined') {
      reject(new Error('ອຸປະກອນນີ້ບໍ່ຮອງຮັບການອັບໂຫຼດໄຟລ໌'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('ອ່ານໄຟລ໌ບໍ່ສຳເລັດ'))
    reader.readAsDataURL(file)
  })

export const buildUploadBody = async (file) => {
  if (!file) throw new Error('ກະລຸນາເລືອກໄຟລ໌')
  if (Number(file.size) > MAX_UPLOAD_BYTES) {
    throw new Error('ໄຟລ໌ໃຫຍ່ເກີນ 5 MB')
  }
  const data = await readFileAsDataUrl(file)
  return {
    filename: file.name || 'upload',
    mimeType: file.type || 'application/octet-stream',
    size: Number(file.size) || 0,
    data,
  }
}
