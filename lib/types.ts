export type Game = {
  slug: string
  name: string
  icon: string
  requiresServer: boolean
  rating: number
  ratingCount: number
  hasFullCatalog: boolean
}

export type PriceGroupName = 'Special Items' | 'Top Up Instan'

export type PriceVariant = {
  id: string
  gameSlug: string
  group: PriceGroupName
  name: string
  price: number
}

export type OrderStatus = 'Menunggu Pembayaran' | 'Diproses' | 'Berhasil'

export type PaymentMethod = 'QRIS' | 'Virtual Account'

export type Order = {
  code: string
  gameSlug: string
  gameName: string
  accountId: string
  server?: string
  item: { name: string; price: number }
  paymentMethod?: PaymentMethod
  status: OrderStatus
  createdAt: string
}
