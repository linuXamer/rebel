import type { GameState, Mission, FaultType, GameSettings } from '../types'
import { DEFAULT_STATE, saveGame, loadGame, exportGame, importGame, resetGame } from '../utils/storage'
import { generateMission } from '../data/missions'
import { getPart, getCorrectPartForFault } from '../data/parts'

export class GameStateManager {
  private state: GameState
  private listeners: ((state: GameState) => void)[] = []

  constructor() {
    const savedState = loadGame()
    this.state = savedState || { ...DEFAULT_STATE }
  }

  // State-Accessor
  getState(): GameState {
    return { ...this.state }
  }

  getSettings(): GameSettings {
    return { ...this.state.settings }
  }

  getCurrentMission(): Mission | undefined {
    return this.state.currentMission
  }

  getAvailableMissions(): Mission[] {
    return this.state.missions.filter(m => m.status === 'pending')
  }

  getCredits(): number {
    return this.state.credits
  }

  // State-Mutationen
  private setState(newState: Partial<GameState>): void {
    this.state = { ...this.state, ...newState }
    saveGame(this.state)
    this.notifyListeners()
  }

  // Listener
  subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state))
  }

  // Mission-Aktionen
  startMission(missionId: string): boolean {
    const mission = this.state.missions.find(m => m.id === missionId && m.status === 'pending')
    if (!mission) return false

    mission.status = 'diagnosing'
    this.setState({
      currentMission: mission,
      missions: this.state.missions.map(m => m.id === missionId ? mission : m),
    })
    return true
  }

  setDiagnosis(faultType: FaultType): boolean {
    const mission = this.state.currentMission
    if (!mission || mission.status !== 'diagnosing') return false

    mission.diagnosis = faultType
    mission.status = 'repairing'
    
    this.setState({
      currentMission: mission,
      missions: this.state.missions.map(m => m.id === mission.id ? mission : m),
    })
    return true
  }

  selectPart(partId: string): boolean {
    const mission = this.state.currentMission
    if (!mission || mission.status !== 'repairing') return false

    const part = getPart(partId)
    if (!part) return false

    // Prüfen ob das Teil zum diagnostizierten Fehler passt
    if (mission.diagnosis !== part.type) {
      return false // Falsches Teil ausgewählt
    }

    // Prüfen ob genug Credits
    if (this.state.credits < part.cost) {
      return false
    }

    // Prüfen ob genug Lagerbestand
    if ((this.state.spareParts[partId] || 0) < 1) {
      return false
    }

    mission.selectedPart = partId
    mission.status = 'testing'

    // Kosten abziehen
    this.setState({
      currentMission: mission,
      missions: this.state.missions.map(m => m.id === mission.id ? mission : m),
      credits: this.state.credits - part.cost,
      spareParts: {
        ...this.state.spareParts,
        [partId]: (this.state.spareParts[partId] || 0) - 1,
      },
    })
    return true
  }

  completeTestFlight(score: number): boolean {
    const mission = this.state.currentMission
    if (!mission || mission.status !== 'testing') return false

    mission.testFlightScore = score
    mission.status = 'completed'
    mission.completedAt = Date.now()

    // Prüfen ob die Reparatur korrekt war
    const correctPart = getCorrectPartForFault(mission.fault.type)
    const isCorrectRepair = mission.selectedPart === correctPart?.id || 
                           (mission.diagnosis === mission.fault.type && mission.selectedPart)

    // Belohnung berechnen
    let reward = mission.reward
    
    // Bonus für korrekte Diagnose und Reparatur
    if (isCorrectRepair) {
      reward = Math.floor(reward * (1 + score * 0.01)) // Bis zu 100% Bonus
    } else {
      reward = Math.floor(reward * 0.5) // 50% Strafe für falsche Reparatur
    }

    // Statistik aktualisieren
    this.setState({
      currentMission: mission,
      missions: this.state.missions.map(m => m.id === mission.id ? mission : m),
      credits: this.state.credits + reward,
      completedMissions: this.state.completedMissions + 1,
      totalEarnings: this.state.totalEarnings + reward,
      totalRepairs: isCorrectRepair ? this.state.totalRepairs + 1 : this.state.totalRepairs,
    })

    // Neue Mission generieren
    this.generateNewMission()

    return true
  }

  failTestFlight(): boolean {
    const mission = this.state.currentMission
    if (!mission || mission.status !== 'testing') return false

    mission.status = 'failed'
    mission.completedAt = Date.now()

    this.setState({
      currentMission: mission,
      missions: this.state.missions.map(m => m.id === mission.id ? mission : m),
    })

    // Keine Belohnung, aber auch keine Strafkosten
    // Neue Mission generieren
    this.generateNewMission()

    return true
  }

  cancelMission(): boolean {
    const mission = this.state.currentMission
    if (!mission) return false

    mission.status = 'pending'
    
    this.setState({
      currentMission: undefined,
      missions: this.state.missions.map(m => m.id === mission.id ? mission : m),
    })
    return true
  }

  // Mission-Generierung
  private generateNewMission(): void {
    const newMission = generateMission(`mission-${Date.now()}`)
    this.setState({
      missions: [...this.state.missions, newMission],
    })
  }

  // Settings
  updateSettings(settings: Partial<GameSettings>): void {
    this.setState({
      settings: { ...this.state.settings, ...settings },
    })
  }

  // Spielstand-Management
  saveGame(): void {
    saveGame(this.state)
  }

  resetGame(): GameState {
    this.state = resetGame()
    this.notifyListeners()
    return this.state
  }

  exportGame(): string {
    return exportGame()
  }

  importGame(jsonString: string): boolean {
    const importedState = importGame(jsonString)
    if (!importedState) return false
    
    this.state = importedState
    this.notifyListeners()
    return true
  }

  // Utility-Methoden
  getMissionById(id: string): Mission | undefined {
    return this.state.missions.find(m => m.id === id) || this.state.currentMission?.id === id ? this.state.currentMission : undefined
  }

  hasCurrentMission(): boolean {
    return !!this.state.currentMission
  }

  getSpareParts(): Record<string, number> {
    return { ...this.state.spareParts }
  }

  getPartStock(partId: string): number {
    return this.state.spareParts[partId] || 0
  }

  // Statistik
  getStats() {
    return {
      completedMissions: this.state.completedMissions,
      totalEarnings: this.state.totalEarnings,
      totalRepairs: this.state.totalRepairs,
      currentCredits: this.state.credits,
    }
  }
}

// Singleton-Instanz
export const gameStateManager = new GameStateManager()
