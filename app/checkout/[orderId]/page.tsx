'use client'

import { useParams } from 'next/navigation'
import { useTransactions } from '@/context/TransactionContext'
import { PaymentMethodPicker } from '@/components/checkout/PaymentMethodPicker'
import { PaymentInstructions } from '@/components/checkout/PaymentInstructions'
import type { PaymentMethod } from '@/lib/types'

export default function CheckoutPage() {
  const params = useParams<{ orderId: string }>()
  const { getOrderByCode, setPaymentMethod, simulatePaymentSuccess } = useTransactions()
  const order = getOrderByCode(params.orderId)

  if (!order) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center text-gray-400">
        Pesanan tidak ditemukan.
      </main>
    )
  }

  function handlePick(method: PaymentMethod) {
    setPaymentMethod(order!.code, method)
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-xl font-semibold">Checkout</h1>
      <p className="mt-1 text-sm text-gray-400">
        {order.gameName} — {order.item.name}
      </p>
      <div className="mt-6">
        {!order.paymentMethod ? (
          <PaymentMethodPicker onPick={handlePick} />
        ) : (
          <PaymentInstructions order={order} onSimulate={() => simulatePaymentSuccess(order.code)} />
        )}
      </div>
    </main>
  )
}
