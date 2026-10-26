const HEX_PATTERN = /^#?[0-9a-f]{6}$/i

export const normalizeHex = (value, fallback = '#047857') =>
  HEX_PATTERN.test(String(value || '')) ? `#${String(value).replace('#', '').toLowerCase()}` : fallback

export const hexToRgb = (hex) => {
  const normalized = normalizeHex(hex)
  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  }
}

export const rgbChannels = (hex) => {
  const { r, g, b } = hexToRgb(hex)
  return `${r} ${g} ${b}`
}

const mix = (hex, target, weight) => {
  const { r, g, b } = hexToRgb(hex)
  const channel = (from, to) => Math.round(from * (1 - weight) + to * weight)
  const toHex = (value) => value.toString(16).padStart(2, '0')
  return `#${toHex(channel(r, target.r))}${toHex(channel(g, target.g))}${toHex(channel(b, target.b))}`
}

export const shadeHex = (hex, weight = 0.2) =>
  mix(hex, { r: 0, g: 0, b: 0 }, Math.min(1, Math.max(0, weight)))

export const tintHex = (hex, weight = 0.9) =>
  mix(hex, { r: 255, g: 255, b: 255 }, Math.min(1, Math.max(0, weight)))
