import type { Game } from './types'

export function isAccountValid(game: Game, accountId: string, server: string): boolean {
  if (accountId.trim().length === 0) return false
  if (game.requiresServer && server.trim().length === 0) return false
  return true
}
