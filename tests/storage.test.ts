import { describe, it, expect, beforeEach } from 'vitest'
import {
  saveGame,
  loadGame,
  deleteGame,
  exportGame,
  importGame,
  resetGame,
  isGameSaved,
  DEFAULT_STATE
} from '../src/utils/storage'
import type { GameState } from '../src/types'

describe('Storage System', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  describe('saveGame', () => {
    it('should save game state to localStorage', () => {
      const state: GameState = { ...DEFAULT_STATE, credits: 10000 }
      saveGame(state)
      
      expect(isGameSaved()).toBe(true)
      
      const savedState = loadGame()
      expect(savedState).toBeDefined()
      expect(savedState?.credits).toBe(10000)
    })

    it('should handle save errors gracefully', () => {
      // Mock localStorage.setItem to throw error
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage full')
      })

      const state = { ...DEFAULT_STATE }
      saveGame(state)

      // Should not throw
      expect(true).toBe(true)

      // Restore
      localStorage.setItem = originalSetItem
    })
  })

  describe('loadGame', () => {
    it('should return null when no game is saved', () => {
      const state = loadGame()
      expect(state).toBeNull()
    })

    it('should load saved game state', () => {
      const state: GameState = {
        ...DEFAULT_STATE,
        credits: 15000,
        completedMissions: 5,
      }
      saveGame(state)

      const loadedState = loadGame()
      expect(loadedState).toBeDefined()
      expect(loadedState?.credits).toBe(15000)
      expect(loadedState?.completedMissions).toBe(5)
    })

    it('should handle corrupted data gracefully', () => {
      localStorage.setItem('rebelRepairSave', 'invalid json')
      
      const state = loadGame()
      expect(state).toBeNull()
    })

    it('should handle load errors gracefully', () => {
      // Mock localStorage.getItem to throw error
      const originalGetItem = localStorage.getItem
      localStorage.getItem = vi.fn().mockImplementation(() => {
        throw new Error('Read error')
      })

      const state = loadGame()
      expect(state).toBeNull()

      // Restore
      localStorage.getItem = originalGetItem
    })
  })

  describe('deleteGame', () => {
    it('should delete saved game', () => {
      const state = { ...DEFAULT_STATE }
      saveGame(state)
      
      expect(isGameSaved()).toBe(true)

      deleteGame()
      
      expect(isGameSaved()).toBe(false)
      expect(loadGame()).toBeNull()
    })
  })

  describe('exportGame', () => {
    it('should export game state as JSON string', () => {
      const state: GameState = { ...DEFAULT_STATE, credits: 20000 }
      saveGame(state)

      const json = exportGame()
      expect(json).toBeDefined()
      expect(json.length).toBeGreaterThan(0)

      const parsed = JSON.parse(json)
      expect(parsed.credits).toBe(20000)
    })

    it('should export default state when no game is saved', () => {
      const json = exportGame()
      expect(json).toBeDefined()

      const parsed = JSON.parse(json)
      expect(parsed.credits).toBe(DEFAULT_STATE.credits)
    })
  })

  describe('importGame', () => {
    it('should import valid game state', () => {
      const state: GameState = {
        ...DEFAULT_STATE,
        version: '1.0',
        credits: 25000,
        completedMissions: 10,
      }
      const json = JSON.stringify(state)

      const result = importGame(json)
      expect(result).toBeDefined()
      expect(result?.credits).toBe(25000)
      expect(result?.completedMissions).toBe(10)
      
      // Should also save to localStorage
      expect(isGameSaved()).toBe(true)
    })

    it('should return null for invalid JSON', () => {
      const result = importGame('invalid json')
      expect(result).toBeNull()
    })

    it('should return null for incomplete game state', () => {
      const json = JSON.stringify({ version: '1.0' })
      const result = importGame(json)
      expect(result).toBeNull()
    })

    it('should migrate old game state', () => {
      const oldState = {
        version: '0.9',
        credits: 30000,
        // Missing other fields
      }
      const json = JSON.stringify(oldState)

      const result = importGame(json)
      expect(result).toBeDefined()
      expect(result?.version).toBe('1.0')
      expect(result?.credits).toBe(30000)
    })

    it('should handle import errors gracefully', () => {
      // Mock JSON.parse to throw error
      const originalParse = JSON.parse
      JSON.parse = vi.fn().mockImplementation(() => {
        throw new Error('Parse error')
      })

      const result = importGame('{invalid}')
      expect(result).toBeNull()

      // Restore
      JSON.parse = originalParse
    })
  })

  describe('resetGame', () => {
    it('should reset to default state', () => {
      const state: GameState = { ...DEFAULT_STATE, credits: 50000 }
      saveGame(state)

      const result = resetGame()
      expect(result.credits).toBe(DEFAULT_STATE.credits)
      expect(result.completedMissions).toBe(0)
      
      // Should also save the reset state
      const loadedState = loadGame()
      expect(loadedState?.credits).toBe(DEFAULT_STATE.credits)
    })
  })

  describe('isGameSaved', () => {
    it('should return false when no game is saved', () => {
      expect(isGameSaved()).toBe(false)
    })

    it('should return true when game is saved', () => {
      saveGame(DEFAULT_STATE)
      expect(isGameSaved()).toBe(true)
    })
  })

  describe('Migration', () => {
    it('should migrate missing fields to default values', () => {
      const partialState = {
        version: '0.5',
        credits: 1000,
      }
      const json = JSON.stringify(partialState)

      const result = importGame(json)
      expect(result).toBeDefined()
      expect(result?.version).toBe('1.0')
      expect(result?.credits).toBe(1000)
      expect(result?.completedMissions).toBe(DEFAULT_STATE.completedMissions)
      expect(result?.totalEarnings).toBe(DEFAULT_STATE.totalEarnings)
    })

    it('should preserve existing fields during migration', () => {
      const stateWithData = {
        version: '0.8',
        credits: 15000,
        completedMissions: 5,
        totalEarnings: 50000,
        spareParts: { 'part-1': 10, 'part-2': 5 },
      }
      const json = JSON.stringify(stateWithData)

      const result = importGame(json)
      expect(result).toBeDefined()
      expect(result?.credits).toBe(15000)
      expect(result?.completedMissions).toBe(5)
      expect(result?.totalEarnings).toBe(50000)
      expect(result?.spareParts).toEqual(stateWithData.spareParts)
    })

    it('should merge settings during migration', () => {
      const stateWithSettings = {
        version: '0.7',
        credits: 10000,
        settings: {
          soundEnabled: false,
          musicEnabled: true,
        },
      }
      const json = JSON.stringify(stateWithSettings)

      const result = importGame(json)
      expect(result).toBeDefined()
      expect(result?.settings.soundEnabled).toBe(false)
      expect(result?.settings.musicEnabled).toBe(true)
      expect(result?.settings.touchControls).toBe(DEFAULT_STATE.settings.touchControls)
    })
  })
})
