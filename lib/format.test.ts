import { describe, it, expect } from 'vitest'
import { formatRupiah, generateOrderCode } from './format'

describe('formatRupiah', () => {
  it('formats with dot thousand separators and Rp prefix', () => {
    expect(formatRupiah(31071)).toBe('Rp 31.071')
  })
  it('formats small numbers without separators', () => {
    expect(formatRupiah(500)).toBe('Rp 500')
  })
  it('formats large numbers with multiple separators', () => {
    expect(formatRupiah(1250000)).toBe('Rp 1.250.000')
  })
})

describe('generateOrderCode', () => {
  it('starts with GCR and is 11 chars long', () => {
    const code = generateOrderCode()
    expect(code.startsWith('GCR')).toBe(true)
    expect(code.length).toBe(11)
  })
  it('generates unique codes across calls', () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateOrderCode()))
    expect(codes.size).toBe(50)
  })
})
