import type { Game, PriceVariant, Order } from '@/lib/types'

export const games: Game[] = [
  {
    slug: 'mobile-legends', name: 'Mobile Legends', icon: 'gamepad-2',
    requiresServer: true, rating: 5.0, ratingCount: 18452, hasFullCatalog: true,
  },
  {
    slug: 'free-fire', name: 'Free Fire', icon: 'flame',
    requiresServer: false, rating: 5.0, ratingCount: 22110, hasFullCatalog: true,
  },
  {
    slug: 'pubg-mobile', name: 'PUBG Mobile', icon: 'crosshair',
    requiresServer: false, rating: 4.9, ratingCount: 9032, hasFullCatalog: false,
  },
  {
    slug: 'valorant', name: 'Valorant', icon: 'target',
    requiresServer: false, rating: 4.9, ratingCount: 5218, hasFullCatalog: false,
  },
]

export const priceVariants: PriceVariant[] = [
  // Mobile Legends — Special Items
  { id: 'ml-weekly', gameSlug: 'mobile-legends', group: 'Special Items', name: 'Weekly Diamond Pass', price: 31071 },
  { id: 'ml-twilight', gameSlug: 'mobile-legends', group: 'Special Items', name: 'Twilight Pass', price: 149000 },
  // Mobile Legends — Top Up Instan
  { id: 'ml-86', gameSlug: 'mobile-legends', group: 'Top Up Instan', name: '86 Diamonds', price: 22500 },
  { id: 'ml-172', gameSlug: 'mobile-legends', group: 'Top Up Instan', name: '172 Diamonds', price: 45000 },
  { id: 'ml-257', gameSlug: 'mobile-legends', group: 'Top Up Instan', name: '257 Diamonds', price: 67000 },
  { id: 'ml-344', gameSlug: 'mobile-legends', group: 'Top Up Instan', name: '344 Diamonds', price: 89000 },
  { id: 'ml-706', gameSlug: 'mobile-legends', group: 'Top Up Instan', name: '706 Diamonds', price: 179000 },
  { id: 'ml-2195', gameSlug: 'mobile-legends', group: 'Top Up Instan', name: '2195 Diamonds', price: 519000 },

  // Free Fire — Special Items
  { id: 'ff-membership', gameSlug: 'free-fire', group: 'Special Items', name: 'Member Mingguan', price: 29000 },
  { id: 'ff-levelup', gameSlug: 'free-fire', group: 'Special Items', name: 'Level Up Pass', price: 39000 },
  // Free Fire — Top Up Instan
  { id: 'ff-50', gameSlug: 'free-fire', group: 'Top Up Instan', name: '50 Diamonds', price: 8500 },
  { id: 'ff-100', gameSlug: 'free-fire', group: 'Top Up Instan', name: '100 Diamonds', price: 15500 },
  { id: 'ff-240', gameSlug: 'free-fire', group: 'Top Up Instan', name: '240 Diamonds', price: 35000 },
  { id: 'ff-355', gameSlug: 'free-fire', group: 'Top Up Instan', name: '355 Diamonds', price: 50000 },
  { id: 'ff-720', gameSlug: 'free-fire', group: 'Top Up Instan', name: '720 Diamonds', price: 99000 },
  { id: 'ff-1450', gameSlug: 'free-fire', group: 'Top Up Instan', name: '1450 Diamonds', price: 199000 },
]

export function getGameBySlug(slug: string): Game | undefined {
  return games.find((g) => g.slug === slug)
}

export function getPriceVariantsForGame(slug: string): PriceVariant[] {
  return priceVariants.filter((p) => p.gameSlug === slug)
}

export const seedOrders: Order[] = [
  {
    code: 'GCRDEMO0001',
    gameSlug: 'mobile-legends', gameName: 'Mobile Legends',
    accountId: '123456789', server: '2001',
    item: { name: '172 Diamonds', price: 45000 },
    paymentMethod: 'QRIS', status: 'Menunggu Pembayaran',
    createdAt: '2026-09-10T09:15:00.000Z',
  },
  {
    code: 'GCRDEMO0002',
    gameSlug: 'free-fire', gameName: 'Free Fire',
    accountId: '987654321',
    item: { name: '240 Diamonds', price: 35000 },
    paymentMethod: 'Virtual Account', status: 'Diproses',
    createdAt: '2026-09-10T14:40:00.000Z',
  },
  {
    code: 'GCRDEMO0003',
    gameSlug: 'mobile-legends', gameName: 'Mobile Legends',
    accountId: '555222999', server: '3112',
    item: { name: 'Weekly Diamond Pass', price: 31071 },
    paymentMethod: 'QRIS', status: 'Berhasil',
    createdAt: '2026-09-09T18:05:00.000Z',
  },
]
