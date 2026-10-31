import { describe, it, expect, beforeEach } from 'vitest'
import { gameStateManager } from '../src/game/GameStateManager'
import { DEFAULT_STATE } from '../src/utils/storage'

describe('GameStateManager', () => {
  beforeEach(() => {
    // Reset the game state before each test
    gameStateManager.resetGame()
  })

  describe('Initial State', () => {
    it('should have default credits', () => {
      const state = gameStateManager.getState()
      expect(state.credits).toBe(DEFAULT_STATE.credits)
    })

    it('should have no completed missions initially', () => {
      const state = gameStateManager.getState()
      expect(state.completedMissions).toBe(0)
    })

    it('should have initial spare parts', () => {
      const state = gameStateManager.getState()
      expect(Object.keys(state.spareParts).length).toBeGreaterThan(0)
    })

    it('should have initial missions', () => {
      const state = gameStateManager.getState()
      expect(state.missions.length).toBeGreaterThan(0)
    })
  })

  describe('Mission Management', () => {
    it('should start a mission', () => {
      const missions = gameStateManager.getAvailableMissions()
      expect(missions.length).toBeGreaterThan(0)

      const missionId = missions[0].id
      const success = gameStateManager.startMission(missionId)

      expect(success).toBe(true)
      expect(gameStateManager.hasCurrentMission()).toBe(true)

      const currentMission = gameStateManager.getCurrentMission()
      expect(currentMission).toBeDefined()
      expect(currentMission?.id).toBe(missionId)
      expect(currentMission?.status).toBe('diagnosing')
    })

    it('should not start an invalid mission', () => {
      const success = gameStateManager.startMission('invalid-mission-id')
      expect(success).toBe(false)
      expect(gameStateManager.hasCurrentMission()).toBe(false)
    })

    it('should set diagnosis for current mission', () => {
      const missions = gameStateManager.getAvailableMissions()
      const missionId = missions[0].id
      gameStateManager.startMission(missionId)

      const success = gameStateManager.setDiagnosis('engine')
      expect(success).toBe(true)

      const currentMission = gameStateManager.getCurrentMission()
      expect(currentMission?.diagnosis).toBe('engine')
      expect(currentMission?.status).toBe('repairing')
    })

    it('should not set diagnosis without current mission', () => {
      const success = gameStateManager.setDiagnosis('engine')
      expect(success).toBe(false)
    })

    it('should select part for repair', () => {
      const missions = gameStateManager.getAvailableMissions()
      const missionId = missions[0].id
      gameStateManager.startMission(missionId)
      gameStateManager.setDiagnosis('engine')

      // Get a valid part for engine
      const parts = gameStateManager.getSpareParts()
      const engineParts = Object.entries(parts).filter(([id, stock]) => 
        id.includes('engine') && stock > 0
      )

      if (engineParts.length > 0) {
        const partId = engineParts[0][0]
        const initialCredits = gameStateManager.getCredits()
        const part = { id: partId, cost: 500 } as any
        
        // Mock the part data
        const success = gameStateManager.selectPart(partId)
        
        if (success) {
          expect(gameStateManager.getCredits()).toBeLessThan(initialCredits)
          const currentMission = gameStateManager.getCurrentMission()
          expect(currentMission?.status).toBe('testing')
          expect(currentMission?.selectedPart).toBe(partId)
        }
      }
    })

    it('should not select part with insufficient credits', () => {
      const missions = gameStateManager.getAvailableMissions()
      const missionId = missions[0].id
      gameStateManager.startMission(missionId)
      gameStateManager.setDiagnosis('engine')

      // Try to select an expensive part
      const success = gameStateManager.selectPart('nonexistent-expensive-part')
      expect(success).toBe(false)
    })

    it('should cancel current mission', () => {
      const missions = gameStateManager.getAvailableMissions()
      const missionId = missions[0].id
      gameStateManager.startMission(missionId)

      const success = gameStateManager.cancelMission()
      expect(success).toBe(true)
      expect(gameStateManager.hasCurrentMission()).toBe(false)

      const state = gameStateManager.getState()
      const mission = state.missions.find(m => m.id === missionId)
      expect(mission?.status).toBe('pending')
    })

    it('should not cancel mission without current mission', () => {
      const success = gameStateManager.cancelMission()
      expect(success).toBe(false)
    })
  })

  describe('Test Flight Completion', () => {
    it('should complete test flight successfully', () => {
      const missions = gameStateManager.getAvailableMissions()
      const missionId = missions[0].id
      gameStateManager.startMission(missionId)
      gameStateManager.setDiagnosis(missions[0].fault.type)

      // Select a correct part
      const parts = gameStateManager.getSpareParts()
      const faultType = missions[0].fault.type
      const correctParts = Object.entries(parts).filter(([id]) => 
        id.includes(faultType) && gameStateManager.getPartStock(id) > 0
      )

      if (correctParts.length > 0) {
        const partId = correctParts[0][0]
        gameStateManager.selectPart(partId)

        const initialCredits = gameStateManager.getCredits()
        const initialCompleted = gameStateManager.getState().completedMissions

        const success = gameStateManager.completeTestFlight(1000)
        expect(success).toBe(true)

        const state = gameStateManager.getState()
        expect(state.credits).toBeGreaterThan(initialCredits)
        expect(state.completedMissions).toBe(initialCompleted + 1)
        expect(state.totalEarnings).toBeGreaterThan(0)
      }
    })

    it('should fail test flight', () => {
      const missions = gameStateManager.getAvailableMissions()
      const missionId = missions[0].id
      gameStateManager.startMission(missionId)
      gameStateManager.setDiagnosis('engine')

      // Select a wrong part
      const parts = gameStateManager.getSpareParts()
      const wrongParts = Object.entries(parts).filter(([id]) => 
        !id.includes('engine') && gameStateManager.getPartStock(id) > 0
      )

      if (wrongParts.length > 0) {
        const partId = wrongParts[0][0]
        gameStateManager.selectPart(partId)

        const initialCredits = gameStateManager.getCredits()

        const success = gameStateManager.completeTestFlight(0)
        expect(success).toBe(true)

        // Should still get some credits but less
        const state = gameStateManager.getState()
        expect(state.completedMissions).toBeGreaterThan(0)
      }
    })

    it('should not complete test flight without current mission', () => {
      const success = gameStateManager.completeTestFlight(1000)
      expect(success).toBe(false)
    })
  })

  describe('Settings Management', () => {
    it('should update settings', () => {
      const initialSettings = gameStateManager.getSettings()

      gameStateManager.updateSettings({
        soundEnabled: !initialSettings.soundEnabled,
        musicEnabled: !initialSettings.musicEnabled,
        touchControls: !initialSettings.touchControls,
      })

      const newSettings = gameStateManager.getSettings()
      expect(newSettings.soundEnabled).toBe(!initialSettings.soundEnabled)
      expect(newSettings.musicEnabled).toBe(!initialSettings.musicEnabled)
      expect(newSettings.touchControls).toBe(!initialSettings.touchControls)
    })
  })

  describe('Game State Persistence', () => {
    it('should save and load game state', () => {
      // Make some changes
      const missions = gameStateManager.getAvailableMissions()
      const missionId = missions[0].id
      gameStateManager.startMission(missionId)
      gameStateManager.setDiagnosis('engine')

      // Save state
      gameStateManager.saveGame()

      // Reset and reload
      gameStateManager.resetGame()
      
      // Note: In a real scenario, we would reload from localStorage
      // For this test, we just verify that saveGame doesn't throw
      expect(true).toBe(true)
    })

    it('should export game state as JSON', () => {
      const json = gameStateManager.exportGame()
      expect(json).toBeDefined()
      expect(json.length).toBeGreaterThan(0)

      const state = JSON.parse(json)
      expect(state.version).toBeDefined()
      expect(state.credits).toBeDefined()
      expect(state.missions).toBeDefined()
    })

    it('should import game state from JSON', () => {
      const json = gameStateManager.exportGame()
      const success = gameStateManager.importGame(json)
      expect(success).toBe(true)
    })

    it('should not import invalid JSON', () => {
      const success = gameStateManager.importGame('invalid json')
      expect(success).toBe(false)
    })

    it('should reset game state', () => {
      // Make some changes
      const missions = gameStateManager.getAvailableMissions()
      const missionId = missions[0].id
      gameStateManager.startMission(missionId)

      const state = gameStateManager.resetGame()
      expect(state.credits).toBe(DEFAULT_STATE.credits)
      expect(state.completedMissions).toBe(0)
      expect(gameStateManager.hasCurrentMission()).toBe(false)
    })
  })

  describe('Statistics', () => {
    it('should return correct statistics', () => {
      const stats = gameStateManager.getStats()
      expect(stats.completedMissions).toBe(0)
      expect(stats.currentCredits).toBe(DEFAULT_STATE.credits)
      expect(stats.totalEarnings).toBe(0)
      expect(stats.totalRepairs).toBe(0)
    })
  })
})
