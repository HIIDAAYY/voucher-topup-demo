'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Order, PaymentMethod } from '@/lib/types'
import { seedOrders } from '@/data/seed'
import { generateOrderCode } from '@/lib/format'

const STORAGE_KEY = 'gacorstore_orders'

type CreateOrderInput = {
  gameSlug: string
  gameName: string
  accountId: string
  server?: string
  item: { name: string; price: number }
}

type TransactionContextValue = {
  orders: Order[]
  createOrder: (input: CreateOrderInput) => Order
  getOrderByCode: (code: string) => Order | undefined
  setPaymentMethod: (code: string, method: PaymentMethod) => void
  simulatePaymentSuccess: (code: string) => void
}

const TransactionContext = createContext<TransactionContextValue | null>(null)

function loadOrders(): Order[] {
  if (typeof window === 'undefined') return seedOrders
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedOrders))
    return seedOrders
  }
  try {
    return JSON.parse(raw) as Order[]
  } catch {
    return seedOrders
  }
}

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(seedOrders)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setOrders(loadOrders())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
    }
  }, [orders, hydrated])

  const createOrder = useCallback((input: CreateOrderInput): Order => {
    const order: Order = {
      code: generateOrderCode(),
      gameSlug: input.gameSlug,
      gameName: input.gameName,
      accountId: input.accountId,
      server: input.server,
      item: input.item,
      status: 'Menunggu Pembayaran',
      createdAt: new Date().toISOString(),
    }
    setOrders((prev) => [order, ...prev])
    return order
  }, [])

  const getOrderByCode = useCallback(
    (code: string) => orders.find((o) => o.code.toLowerCase() === code.trim().toLowerCase()),
    [orders],
  )

  const setPaymentMethod = useCallback((code: string, method: PaymentMethod) => {
    setOrders((prev) => prev.map((o) => (o.code === code ? { ...o, paymentMethod: method } : o)))
  }, [])

  const simulatePaymentSuccess = useCallback((code: string) => {
    setOrders((prev) => prev.map((o) => (o.code === code ? { ...o, status: 'Diproses' } : o)))
    setTimeout(() => {
      setOrders((prev) => prev.map((o) => (o.code === code ? { ...o, status: 'Berhasil' } : o)))
    }, 1500)
  }, [])

  return (
    <TransactionContext.Provider
      value={{ orders, createOrder, getOrderByCode, setPaymentMethod, simulatePaymentSuccess }}
    >
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions(): TransactionContextValue {
  const ctx = useContext(TransactionContext)
  if (!ctx) throw new Error('useTransactions must be used within TransactionProvider')
  return ctx
}
