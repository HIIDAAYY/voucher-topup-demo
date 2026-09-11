import type { PaymentMethod } from '@/lib/types'

type PaymentMethodPickerProps = {
  onPick: (method: PaymentMethod) => void
}

export function PaymentMethodPicker({ onPick }: PaymentMethodPickerProps) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-medium">Pilih Metode Pembayaran</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onPick('QRIS')}
          className="rounded-xl border border-border bg-surface p-4 text-left hover:border-accent-to"
        >
          <div className="font-medium">QRIS</div>
          <div className="mt-1 text-xs text-gray-400">Scan &amp; bayar via QRIS (mock)</div>
        </button>
        <button
          type="button"
          onClick={() => onPick('Virtual Account')}
          className="rounded-xl border border-border bg-surface p-4 text-left hover:border-accent-to"
        >
          <div className="font-medium">Virtual Account</div>
          <div className="mt-1 text-xs text-gray-400">Transfer via VA bank (mock)</div>
        </button>
      </div>
    </div>
  )
}
