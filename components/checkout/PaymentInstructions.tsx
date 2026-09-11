import type { Order } from '@/lib/types'
import { formatRupiah } from '@/lib/format'
import { StatusBadge } from '@/components/shared/StatusBadge'

type PaymentInstructionsProps = {
  order: Order
  onSimulate: () => void
}

export function PaymentInstructions({ order, onSimulate }: PaymentInstructionsProps) {
  const isDone = order.status === 'Berhasil'

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="text-xs text-gray-400">Kode Order</div>
        <div className="mt-1 font-mono text-lg tracking-wider">{order.code}</div>
      </div>

      {order.paymentMethod === 'QRIS' ? (
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-lg border-2 border-dashed border-border text-xs text-gray-500">
            QR CODE
          </div>
          <p className="mt-3 text-sm text-gray-400">
            Scan QRIS untuk membayar {formatRupiah(order.item.price)}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-xs text-gray-400">Bank Mock VA</div>
          <div className="mt-1 font-mono text-lg">8808{order.code.slice(-6)}</div>
          <p className="mt-3 text-sm text-gray-400">
            Total: {formatRupiah(order.item.price)}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
        <span className="text-sm text-gray-400">Status</span>
        <StatusBadge status={order.status} />
      </div>

      {isDone ? (
        <p className="rounded-xl border border-success/40 bg-success/10 p-4 text-sm text-success">
          Pembayaran berhasil! Item akan segera diproses.
        </p>
      ) : (
        <button
          type="button"
          onClick={onSimulate}
          className="w-full rounded-xl border-2 border-dashed border-warning/50 bg-warning/10 px-4 py-3 text-sm font-medium text-warning"
        >
          [DEV] Simulasikan Pembayaran Berhasil
        </button>
      )}
    </div>
  )
}
