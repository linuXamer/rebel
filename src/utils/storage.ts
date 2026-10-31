import type { GameState, GameSettings } from '../types'
import { getInitialInventory } from '../data/parts'
import { generateInitialMissions } from '../data/missions'

const STORAGE_KEY = 'rebelRepairSave'
const VERSION = '1.0'

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  touchControls: false,
}

export const DEFAULT_STATE: GameState = {
  version: VERSION,
  credits: 5000,
  completedMissions: 0,
  totalEarnings: 0,
  totalRepairs: 0,
  spareParts: getInitialInventory(),
  missions: generateInitialMissions(3),
  unlockedShips: ['scout', 'hauler', 'fighter'],
  settings: DEFAULT_SETTINGS,
}

export function saveGame(state: GameState): void {
  try {
    const serialized = JSON.stringify(state)
    localStorage.setItem(STORAGE_KEY, serialized)
  } catch (error) {
    console.error('Failed to save game:', error)
  }
}

export function loadGame(): GameState | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY)
    if (!serialized) return null
    
    const state: GameState = JSON.parse(serialized)
    
    // Version-Check und Migration
    if (state.version !== VERSION) {
      return migrateGame(state)
    }
    
    return state
  } catch (error) {
    console.error('Failed to load game:', error)
    return null
  }
}

export function deleteGame(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function exportGame(): string {
  const state = loadGame() || DEFAULT_STATE
  return JSON.stringify(state, null, 2)
}

export function importGame(jsonString: string): GameState | null {
  try {
    const state: GameState = JSON.parse(jsonString)
    
    // Validierung
    if (!state.version || !state.credits || !state.missions) {
      return null
    }
    
    // Migration falls nötig
    const migrated = migrateGame(state)
    
    // Speichern
    saveGame(migrated)
    
    return migrated
  } catch (error) {
    console.error('Failed to import game:', error)
    return null
  }
}

export function resetGame(): GameState {
  const newState = { ...DEFAULT_STATE }
  saveGame(newState)
  return newState
}

function migrateGame(oldState: Partial<GameState>): GameState {
  // Einfache Migration: Nimm die alten Werte und fülle mit Defaults auf
  const newState: GameState = { ...DEFAULT_STATE }
  
  if (oldState.credits !== undefined) {
    newState.credits = oldState.credits
  }
  
  if (oldState.completedMissions !== undefined) {
    newState.completedMissions = oldState.completedMissions
  }
  
  if (oldState.totalEarnings !== undefined) {
    newState.totalEarnings = oldState.totalEarnings
  }
  
  if (oldState.totalRepairs !== undefined) {
    newState.totalRepairs = oldState.totalRepairs
  }
  
  if (oldState.spareParts) {
    newState.spareParts = oldState.spareParts
  }
  
  if (oldState.missions) {
    newState.missions = oldState.missions
  }
  
  if (oldState.unlockedShips) {
    newState.unlockedShips = oldState.unlockedShips
  }
  
  if (oldState.settings) {
    newState.settings = { ...DEFAULT_SETTINGS, ...oldState.settings }
  }
  
  newState.version = VERSION
  
  return newState
}

export function isGameSaved(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null
}
