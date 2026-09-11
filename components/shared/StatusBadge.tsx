import type { OrderStatus } from '@/lib/types'

const STYLES: Record<OrderStatus, string> = {
  'Menunggu Pembayaran': 'bg-warning/20 text-warning border-warning/40',
  'Diproses': 'bg-accent-to/20 text-blue-300 border-blue-400/40',
  'Berhasil': 'bg-success/20 text-success border-success/40',
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${STYLES[status]}`}>
      {status}
    </span>
  )
}
