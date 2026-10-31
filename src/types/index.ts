// Spiel-Typdefinitionen

export interface Vector2 {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Rectangle extends Vector2, Size {}

// Schiffstypen
export type ShipType = 'scout' | 'hauler' | 'fighter'

export interface Ship {
  id: string
  type: ShipType
  name: string
  description: string
  baseValue: number
  maxHealth: number
  speed: number
  maneuverability: number
  weaponSlots: number
}

// Fehlerarten
export type FaultType = 'engine' | 'weapons' | 'computer'

export interface Fault {
  id: string
  type: FaultType
  name: string
  description: string
  symptoms: string[]
  repairCost: number
  partName: string
  partCost: number
  difficulty: number // 1-3
}

// Ersatzteile
export interface SparePart {
  id: string
  name: string
  type: FaultType
  cost: number
  description: string
  stock: number
}

// Auftrag
export interface Mission {
  id: string
  ship: Ship
  fault: Fault
  reward: number
  status: 'pending' | 'diagnosing' | 'repairing' | 'testing' | 'completed' | 'failed'
  diagnosis?: FaultType
  selectedPart?: string
  testFlightScore?: number
  completedAt?: number
}

// Spielstand
export interface GameState {
  version: string
  credits: number
  completedMissions: number
  totalEarnings: number
  totalRepairs: number
  spareParts: Record<string, number> // partId -> quantity
  currentMission?: Mission
  missions: Mission[]
  unlockedShips: ShipType[]
  settings: GameSettings
}

export interface GameSettings {
  soundEnabled: boolean
  musicEnabled: boolean
  touchControls: boolean
}

// Testflug
export interface TestFlightResult {
  success: boolean
  score: number
  time: number
  hitsTaken: number
  targetsDestroyed: number
}

// UI States
export type GameScene = 
  | 'title'
  | 'workshop'
  | 'mission-select'
  | 'diagnosis'
  | 'repair'
  | 'test-flight'
  | 'mission-complete'
  | 'settings'
  | 'game-over'

// Diagnose-Hinweise
export interface DiagnosisHint {
  id: string
  text: string
  faultType: FaultType
  weight: number // 0-1, wie stark dieser Hinweis auf den Fehler hindeutet
}

// Touch Controls
export interface TouchControl {
  id: string
  x: number
  y: number
  radius: number
  label: string
  action: string
  active: boolean
}
