import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  MAX_UPLOAD_BYTES,
  attachmentName,
  buildUploadBody,
  isDownloadableAsset,
  readFileAsDataUrl,
  resolveAttachmentUrl,
} from '~/utils/uploads'
import { todayIso } from '~/utils/date'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('upload helpers', () => {
  it('recognizes download URLs and rejects legacy file names', () => {
    expect(isDownloadableAsset('/uploads/1/a.png')).toBe(true)
    expect(isDownloadableAsset('data:image/png;base64,abc')).toBe(true)
    expect(isDownloadableAsset('http://localhost/upload.png')).toBe(true)
    expect(isDownloadableAsset('https://cdn.example.com/upload.pdf')).toBe(true)
    expect(isDownloadableAsset('scan-001.pdf')).toBe(false)
    expect(isDownloadableAsset('')).toBe(false)
    expect(isDownloadableAsset(null)).toBe(false)
  })

  it('resolves tenant-relative upload URLs against the API origin', () => {
    expect(resolveAttachmentUrl('/uploads/1/a.png', 'http://localhost:5055/api')).toBe(
      'http://localhost:5055/api/uploads/1/a.png',
    )
    expect(resolveAttachmentUrl('/uploads/1/a.png', 'http://localhost:5055/api/')).toBe(
      'http://localhost:5055/api/uploads/1/a.png',
    )
    expect(resolveAttachmentUrl('https://cdn.example.com/a.png', 'http://x')).toBe(
      'https://cdn.example.com/a.png',
    )
    expect(resolveAttachmentUrl('scan.pdf', 'http://x')).toBe('')
  })

  it('derives a readable name from URLs and objects', () => {
    expect(attachmentName('/uploads/1/id-card.pdf')).toBe('id-card.pdf')
    expect(attachmentName('https://cdn.example.com/a.png?token=1')).toBe('a.png')
    expect(attachmentName('data:image/png;base64,abc')).toBe('ເອກະສານ')
    expect(attachmentName({ name: 'slip.jpg' })).toBe('slip.jpg')
    expect(attachmentName(null)).toBe('ເອກະສານ')
  })

  it('rejects files above the 5 MB limit before reading them', async () => {
    const file = { name: 'big.pdf', type: 'application/pdf', size: MAX_UPLOAD_BYTES + 1 }
    await expect(buildUploadBody(file)).rejects.toThrow('5 MB')
  })

  it('reads files into a base64 data URL payload', async () => {
    class MockFileReader {
      result = 'data:application/pdf;base64,ZmFrZQ=='
      onload = null
      onerror = null
      readAsDataURL() {
        this.onload?.()
      }
    }
    vi.stubGlobal('FileReader', MockFileReader)

    const file = { name: 'form.pdf', type: 'application/pdf', size: 4 }
    await expect(readFileAsDataUrl(file)).resolves.toContain('data:application/pdf')
    await expect(buildUploadBody(file)).resolves.toEqual({
      filename: 'form.pdf',
      mimeType: 'application/pdf',
      size: 4,
      data: 'data:application/pdf;base64,ZmFrZQ==',
    })
  })

  it('rejects when no file is provided', async () => {
    await expect(buildUploadBody(null)).rejects.toThrow('ເລືອກໄຟລ໌')
  })
})

describe('todayIso', () => {
  it('formats a local date without timezone drift', () => {
    expect(todayIso(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
    expect(todayIso(new Date(2026, 9, 26, 0, 1))).toBe('2026-10-26')
  })
})
