export function formatRupiah(amount: number): string {
  const withDots = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `Rp ${withDots}`
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateOrderCode(): string {
  let suffix = ''
  for (let i = 0; i < 8; i++) {
    suffix += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return `GCR${suffix}`
}
