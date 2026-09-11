import { describe, it, expect } from 'vitest'
import { isAccountValid } from './orderLogic'
import type { Game } from './types'

const mlbb: Game = {
  slug: 'mobile-legends', name: 'Mobile Legends', icon: 'gamepad-2',
  requiresServer: true, rating: 5, ratingCount: 1200, hasFullCatalog: true,
}
const ff: Game = {
  slug: 'free-fire', name: 'Free Fire', icon: 'flame',
  requiresServer: false, rating: 5, ratingCount: 900, hasFullCatalog: true,
}

describe('isAccountValid', () => {
  it('requires both id and server for a requiresServer game', () => {
    expect(isAccountValid(mlbb, '', '')).toBe(false)
    expect(isAccountValid(mlbb, '123456', '')).toBe(false)
    expect(isAccountValid(mlbb, '123456', '2001')).toBe(true)
  })
  it('requires only id for a non-server game', () => {
    expect(isAccountValid(ff, '', '')).toBe(false)
    expect(isAccountValid(ff, '123456789', '')).toBe(true)
  })
  it('treats whitespace-only id as invalid', () => {
    expect(isAccountValid(ff, '   ', '')).toBe(false)
  })
})
