export const AVATAR_MAX_INPUT_BYTES = 5 * 1024 * 1024
export const AVATAR_MAX_DATA_URL_LENGTH = 60000

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('read_failed'))
    reader.readAsDataURL(file)
  })

const loadImage = (source) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('decode_failed'))
    image.src = source
  })

const renderAvatar = (image, maxDimension, quality) => {
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) throw new Error('canvas_unsupported')

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.drawImage(image, 0, 0, width, height)

  return canvas.toDataURL('image/jpeg', quality)
}

export const fileToAvatarDataUrl = async (file) => {
  if (!file || !String(file.type || '').startsWith('image/')) {
    throw new Error('invalid_type')
  }
  if (file.size > AVATAR_MAX_INPUT_BYTES) {
    throw new Error('too_large')
  }

  const source = await readFileAsDataUrl(file)
  const image = await loadImage(source)

  const attempts = [
    [320, 0.82],
    [256, 0.78],
    [192, 0.72],
    [128, 0.66],
    [96, 0.6],
  ]

  for (const [maxDimension, quality] of attempts) {
    const dataUrl = renderAvatar(image, maxDimension, quality)
    if (dataUrl.length <= AVATAR_MAX_DATA_URL_LENGTH) return dataUrl
  }

  throw new Error('too_large')
}
