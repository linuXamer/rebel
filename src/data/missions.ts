import { getRandomShip } from './ships'
import { getRandomFault } from './faults'
import type { Mission, Ship, Fault } from '../types'

export function generateMission(id: string): Mission {
  const ship: Ship = getRandomShip()
  const fault: Fault = getRandomFault()
  
  // Belohnung basierend auf Schiffswert und Fehler-Schwierigkeit
  const reward = Math.floor(ship.baseValue * 0.3 + fault.difficulty * 500 + Math.random() * 1000)
  
  return {
    id,
    ship,
    fault,
    reward,
    status: 'pending',
  }
}

export function generateInitialMissions(count: number = 3): Mission[] {
  const missions: Mission[] = []
  for (let i = 0; i < count; i++) {
    missions.push(generateMission(`mission-${Date.now()}-${i}`))
  }
  return missions
}
