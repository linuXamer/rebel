import type { Ship } from '../types'

export const SHIPS: Record<string, Ship> = {
  scout: {
    id: 'scout-001',
    type: 'scout',
    name: 'Galaxie-Späher',
    description: 'Schnell und wendig. Perfekt für Aufklärung, aber nicht für schwere Lasten.',
    baseValue: 5000,
    maxHealth: 100,
    speed: 4,
    maneuverability: 5,
    weaponSlots: 2,
  },
  hauler: {
    id: 'hauler-001',
    type: 'hauler',
    name: 'Lastesel 3000',
    description: 'Langsam aber robust. Transportiert alles, was nicht bei drei auf den Bäumen ist.',
    baseValue: 8000,
    maxHealth: 150,
    speed: 2,
    maneuverability: 2,
    weaponSlots: 1,
  },
  fighter: {
    id: 'fighter-001',
    type: 'fighter',
    name: 'Rebellen-Jäger',
    description: 'Schnell, stark bewaffnet, aber etwas empfindlich. Nicht für Anfänger.',
    baseValue: 12000,
    maxHealth: 80,
    speed: 5,
    maneuverability: 4,
    weaponSlots: 4,
  },
}

export function getShip(type: string): Ship {
  return SHIPS[type] || SHIPS.scout
}

export function getRandomShip(): Ship {
  const types = Object.keys(SHIPS)
  return SHIPS[types[Math.floor(Math.random() * types.length)]]
}
