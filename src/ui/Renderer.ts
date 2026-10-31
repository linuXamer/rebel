import * as PIXI from 'pixi.js'
import type { GameScene } from '../types'
import { gameStateManager } from '../game/GameStateManager'
import { TestFlight, TEST_FLIGHT_DURATION } from '../game/TestFlight'
import { getHintsForFault } from '../data/faults'
import { getPartsByType } from '../data/parts'

export class Renderer {
  private app: PIXI.Application | null = null
  private scenes: Record<GameScene, PIXI.Container> = {} as any
  private currentScene: GameScene = 'title'
  private testFlight: TestFlight | null = null
  private animationFrameId: number = 0
  private lastTime: number = 0

  constructor(canvas: HTMLCanvasElement) {
    console.log('🎨 Initializing Renderer with PIXI.js v7 API...')
    this.initApplication(canvas)
  }

  private initApplication(canvas: HTMLCanvasElement): void {
    try {
      console.log('🔄 Creating PIXI.Application...')
      
      // PIXI.js v7 API (Constructor)
      this.app = new PIXI.Application({
        view: canvas,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x0A0A1A,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        antialias: true,
      })

      console.log('✅ PIXI Application initialized with:', this.app.renderer.type)

      // Set up resize handler
      window.addEventListener('resize', this.handleResize.bind(this))

      // Initialize all scenes
      this.initScenes()

      // Show first scene
      this.showScene('title')

      // Subscribe to game state changes
      gameStateManager.subscribe(this.handleGameStateChange.bind(this))

      // Start game loop
      this.startGameLoop()

    } catch (error) {
      console.error('❌ PIXI Initialization error:', error)
      this.showFallbackMessage(canvas)
    }
  }

  private showFallbackMessage(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#0A0A1A'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#00FF88'
      ctx.font = '24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('WebGL/Canvas nicht verfügbar', canvas.width / 2, canvas.height / 2 - 20)
      ctx.fillStyle = '#CCCCCC'
      ctx.font = '16px Arial'
      ctx.fillText('Bitte verwende einen modernen Browser oder aktiviere WebGL', canvas.width / 2, canvas.height / 2 + 20)
    }
  }

  private initScenes(): void {
    console.log('📂 Initializing scenes...')
    
    // Create all scene containers
    const sceneNames: GameScene[] = [
      'title', 'workshop', 'mission-select', 'diagnosis', 
      'repair', 'test-flight', 'mission-complete', 'settings', 'game-over'
    ]

    sceneNames.forEach(scene => {
      this.scenes[scene] = new PIXI.Container()
      this.scenes[scene].visible = false
      this.app!.stage.addChild(this.scenes[scene])
    })

    // Initialize individual scenes
    this.initTitleScene()
    this.initWorkshopScene()
    this.initMissionSelectScene()
    this.initDiagnosisScene()
    this.initRepairScene()
    this.initTestFlightScene()
    this.initMissionCompleteScene()
    this.initSettingsScene()
    this.initGameOverScene()
    
    console.log('✅ All scenes initialized')
  }

  private startGameLoop(): void {
    const gameLoop = (time: number) => {
      const deltaTime = time - this.lastTime
      this.lastTime = time

      // Update test flight
      if (this.currentScene === 'test-flight' && this.testFlight) {
        this.testFlight.update(deltaTime)
        this.renderTestFlight()
      }

      this.animationFrameId = requestAnimationFrame(gameLoop)
    }

    this.animationFrameId = requestAnimationFrame(gameLoop)
  }

  private handleResize(): void {
    const width = window.innerWidth
    const height = window.innerHeight

    if (!this.app) return

    this.app.renderer.resize(width, height)

    // Reposition all scenes
    Object.values(this.scenes).forEach(scene => {
      scene.position.set(width / 2, height / 2)
    })

    // Update test flight canvas
    if (this.currentScene === 'test-flight' && this.testFlight) {
      this.testFlight.destroy()
      this.showScene('test-flight')
    }
  }

  // ============ SCENE INITIALIZATION ============

  private initTitleScene(): void {
    const scene = this.scenes.title

    // Background
    const bg = new PIXI.Graphics()
    bg.beginFill(0x0A0A1A)
    bg.drawRect(-window.innerWidth/2, -window.innerHeight/2, window.innerWidth, window.innerHeight)
    bg.endFill()
    scene.addChild(bg)

    // Starfield background
    this.createStarfield(scene, 100, 0.1)

    // Title
    const title = new PIXI.Text('REBEL REPAIR', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 48,
      fill: 0x00FF88,
      align: 'center',
      fontWeight: 'bold',
      stroke: 0x004422,
      strokeThickness: 2,
    })
    title.anchor.set(0.5)
    title.position.set(0, -100)
    scene.addChild(title)

    // Subtitle
    const subtitle = new PIXI.Text('Weltraum-Reparatur am Rande der Galaxis', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 18,
      fill: 0x888888,
      align: 'center'
    })
    subtitle.anchor.set(0.5)
    subtitle.position.set(0, -40)
    scene.addChild(subtitle)

    // Start Button
    const startButton = this.createButton('NEUES SPIEL', 0x00AA44, 0x00FF88, () => {
      this.showScene('workshop')
    })
    startButton.position.set(0, 20)
    scene.addChild(startButton)

    // Load Button
    const loadButton = this.createButton('SPIEL LADEN', 0x0066AA, 0x00AFFF, () => {
      const state = gameStateManager.getState()
      if (state.completedMissions > 0 || state.credits !== 5000) {
        this.showScene('workshop')
      } else {
        const message = new PIXI.Text('Kein Spielstand gefunden', {
          fontFamily: 'Arial',
          fontSize: 16,
          fill: 0xFF4444
        })
        message.anchor.set(0.5)
        message.position.set(0, 100)
        scene.addChild(message)
        setTimeout(() => scene.removeChild(message), 2000)
      }
    })
    loadButton.position.set(0, 80)
    scene.addChild(loadButton)

    // Settings Button
    const settingsButton = this.createButton('EINSTELLUNGEN', 0x666666, 0x888888, () => {
      this.showScene('settings')
    })
    settingsButton.position.set(0, 140)
    scene.addChild(settingsButton)
  }

  private initWorkshopScene(): void {
    const scene = this.scenes.workshop

    // Background
    const bg = new PIXI.Graphics()
    bg.beginFill(0x1A1A2A)
    bg.drawRect(-window.innerWidth/2, -window.innerHeight/2, window.innerWidth, window.innerHeight)
    bg.endFill()
    scene.addChild(bg)

    // Workshop Background
    this.createWorkshopBackground(scene)

    // Title
    const title = new PIXI.Text('WERKSTATT', {
      fontFamily: 'Arial',
      fontSize: 32,
      fill: 0x00FF88,
      align: 'center'
    })
    title.anchor.set(0.5)
    title.position.set(0, -window.innerHeight/2 + 40)
    scene.addChild(title)

    // Stats
    const statsContainer = new PIXI.Container()
    statsContainer.position.set(-window.innerWidth/2 + 20, -window.innerHeight/2 + 80)
    scene.addChild(statsContainer)

    const stats = gameStateManager.getStats()
    const statsText = new PIXI.Text(`\nCredits: ${stats.currentCredits}\nAbgeschlossene Aufträge: ${stats.completedMissions}\nGesamtverdient: ${stats.totalEarnings} Credits\nReparaturen: ${stats.totalRepairs}`, {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xCCCCCC
    })
    statsContainer.addChild(statsText)

    // Missions Container
    const missionContainer = new PIXI.Container()
    missionContainer.position.set(0, -50)
    scene.addChild(missionContainer)

    const missionTitle = new PIXI.Text('AKTUELLE AUFTRÄGE', {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0x00FF88,
      align: 'center'
    })
    missionTitle.anchor.set(0.5)
    missionTitle.position.set(0, -150)
    missionContainer.addChild(missionTitle)

    // Display missions
    this.updateMissionDisplay(missionContainer)

    // Back Button
    const backButton = this.createButton('ZURÜCK', 0x666666, 0x888888, () => {
      this.showScene('title')
    })
    backButton.position.set(0, window.innerHeight/2 - 50)
    scene.addChild(backButton)
  }

  private initMissionSelectScene(): void {
    const scene = this.scenes['mission-select']

    // Background
    const bg = new PIXI.Graphics()
    bg.beginFill(0x1A1A2A)
    bg.drawRect(-window.innerWidth/2, -window.innerHeight/2, window.innerWidth, window.innerHeight)
    bg.endFill()
    scene.addChild(bg)

    // Title
    const title = new PIXI.Text('AUFTRAG AUSWÄHLEN', {
      fontFamily: 'Arial',
      fontSize: 28,
      fill: 0x00FF88,
      align: 'center'
    })
    title.anchor.set(0.5)
    title.position.set(0, -100)
    scene.addChild(title)

    // Missions
    const missions = gameStateManager.getAvailableMissions()
    const container = new PIXI.Container()
    container.position.set(0, -20)
    scene.addChild(container)

    missions.forEach((mission, index) => {
      const y = index * 120
      const button = this.createButton(
        `${mission.ship.name} - ${mission.fault.name} (${mission.reward} Credits)`,
        0x0066AA,
        0x00AFFF,
        () => {
          gameStateManager.startMission(mission.id)
          this.showScene('diagnosis')
        }
      )
      button.position.set(0, y)
      container.addChild(button)
    })

    // Back Button
    const backButton = this.createButton('ZURÜCK', 0x666666, 0x888888, () => {
      this.showScene('workshop')
    })
    backButton.position.set(0, window.innerHeight/2 - 50)
    scene.addChild(backButton)
  }

  private initDiagnosisScene(): void {
    const scene = this.scenes.diagnosis

    // Background
    const bg = new PIXI.Graphics()
    bg.beginFill(0x1A1A2A)
    bg.drawRect(-window.innerWidth/2, -window.innerHeight/2, window.innerWidth, window.innerHeight)
    bg.endFill()
    scene.addChild(bg)

    const mission = gameStateManager.getCurrentMission()
    if (!mission) return

    // Title
    const title = new PIXI.Text(`DIAGNOSE: ${mission.ship.name}`, {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0x00FF88,
      align: 'center'
    })
    title.anchor.set(0.5)
    title.position.set(0, -150)
    scene.addChild(title)

    // Symptoms
    const symptomsTitle = new PIXI.Text('Kunde berichtet:', {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0xCCCCCC,
      align: 'center'
    })
    symptomsTitle.anchor.set(0.5)
    symptomsTitle.position.set(0, -100)
    scene.addChild(symptomsTitle)

    mission.fault.symptoms.forEach((symptom, index) => {
      const text = new PIXI.Text(`• ${symptom}`, {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xAAAAAA
      })
      text.anchor.set(0.5)
      text.position.set(0, -60 + index * 25)
      scene.addChild(text)
    })

    // Hints
    const hints = getHintsForFault(mission.fault.type, 4)
    const hintsTitle = new PIXI.Text('Untersuchungshinweise:', {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0x00FF88,
      align: 'center'
    })
    hintsTitle.anchor.set(0.5)
    hintsTitle.position.set(0, 20)
    scene.addChild(hintsTitle)

    hints.forEach((hint, index) => {
      const text = new PIXI.Text(`• ${hint.text}`, {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: hint.faultType === mission.fault.type ? 0x00FF88 : 0xAAAAAA
      })
      text.anchor.set(0.5)
      text.position.set(0, 50 + index * 25)
      scene.addChild(text)
    })

    // Diagnosis Options
    const optionsTitle = new PIXI.Text('Was ist das Problem?', {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0x00FF88,
      align: 'center'
    })
    optionsTitle.anchor.set(0.5)
    optionsTitle.position.set(0, 150)
    scene.addChild(optionsTitle)

    const options = [
      { type: 'engine' as const, label: 'Antrieb' },
      { type: 'weapons' as const, label: 'Waffen' },
      { type: 'computer' as const, label: 'Bordcomputer' },
    ]

    options.forEach((option, index) => {
      const y = 190 + index * 50
      const button = this.createButton(
        option.label,
        0x0066AA,
        0x00AFFF,
        () => {
          gameStateManager.setDiagnosis(option.type)
          this.showScene('repair')
        }
      )
      button.position.set(0, y)
      scene.addChild(button)
    })

    // Back Button
    const backButton = this.createButton('ABBRECHEN', 0x666666, 0x888888, () => {
      gameStateManager.cancelMission()
      this.showScene('mission-select')
    })
    backButton.position.set(0, window.innerHeight/2 - 50)
    scene.addChild(backButton)
  }

  private initRepairScene(): void {
    const scene = this.scenes.repair

    // Background
    const bg = new PIXI.Graphics()
    bg.beginFill(0x1A1A2A)
    bg.drawRect(-window.innerWidth/2, -window.innerHeight/2, window.innerWidth, window.innerHeight)
    bg.endFill()
    scene.addChild(bg)

    const mission = gameStateManager.getCurrentMission()
    if (!mission || !mission.diagnosis) return

    // Title
    const title = new PIXI.Text(`REPARATUR: ${mission.ship.name} - ${mission.fault.name}`, {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0x00FF88,
      align: 'center'
    })
    title.anchor.set(0.5)
    title.position.set(0, -150)
    scene.addChild(title)

    // Diagnosis
    const diagnosisText = new PIXI.Text(`Diagnose: ${mission.diagnosis === 'engine' ? 'Antrieb' : mission.diagnosis === 'weapons' ? 'Waffen' : 'Bordcomputer'}`, {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0x00FF88,
      align: 'center'
    })
    diagnosisText.anchor.set(0.5)
    diagnosisText.position.set(0, -110)
    scene.addChild(diagnosisText)

    // Parts
    const parts = getPartsByType(mission.diagnosis)
    const partsTitle = new PIXI.Text('Verfügbare Ersatzteile:', {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0x00FF88,
      align: 'center'
    })
    partsTitle.anchor.set(0.5)
    partsTitle.position.set(0, -60)
    scene.addChild(partsTitle)

    parts.forEach((part, index) => {
      const y = -20 + index * 60
      const stock = gameStateManager.getPartStock(part.id)
      const credits = gameStateManager.getCredits()
      const canAfford = credits >= part.cost && stock > 0

      const button = this.createButton(
        `${part.name} - ${part.cost} Credits (Lager: ${stock})`,
        canAfford ? 0x008844 : 0x663333,
        canAfford ? 0x00CC66 : 0x884444,
        canAfford ? () => {
          const success = gameStateManager.selectPart(part.id)
          if (success) {
            this.showScene('test-flight')
          }
        } : () => {},
        !canAfford
      )
      button.position.set(0, y)
      scene.addChild(button)

      const descText = new PIXI.Text(part.description, {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0x888888,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 300
      })
      descText.anchor.set(0.5)
      descText.position.set(0, y + 30)
      scene.addChild(descText)
    })

    // Back Button
    const backButton = this.createButton('ZURÜCK', 0x666666, 0x888888, () => {
      gameStateManager.cancelMission()
      this.showScene('diagnosis')
    })
    backButton.position.set(0, window.innerHeight/2 - 50)
    scene.addChild(backButton)
  }

  private initTestFlightScene(): void {
    const scene = this.scenes['test-flight']

    // Background
    const bg = new PIXI.Graphics()
    bg.beginFill(0x000000)
    bg.drawRect(-window.innerWidth/2, -window.innerHeight/2, window.innerWidth, window.innerHeight)
    bg.endFill()
    scene.addChild(bg)

    // Starfield
    this.createStarfield(scene, 200, 0.5)

    // Initialize test flight
    this.initTestFlight()

    // HUD
    const hud = new PIXI.Container()
    hud.position.set(-window.innerWidth/2 + 20, -window.innerHeight/2 + 20)
    scene.addChild(hud)

    // Time display
    const timeText = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0x00FF88
    })
    hud.addChild(timeText)

    // Score display
    const scoreText = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0x00FF88
    })
    scoreText.position.set(0, 30)
    hud.addChild(scoreText)

    // Health display
    const healthText = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xFF4444
    })
    healthText.position.set(0, 60)
    hud.addChild(healthText)

    // Touch Controls
    this.createTouchControls(scene)

    // HUD Update
    const updateHUD = () => {
      if (this.testFlight) {
        const state = this.testFlight.getState()
        const remainingTime = Math.max(0, Math.ceil((TEST_FLIGHT_DURATION - state.time) / 1000))
        timeText.text = `Zeit: ${remainingTime}s`
        scoreText.text = `Punkte: ${state.score}`
        healthText.text = `Hülle: ${state.player.health || 0}`
      }
    }
    setInterval(updateHUD, 100)
  }

  private initTestFlight(): void {
    const mission = gameStateManager.getCurrentMission()
    if (!mission) return

    if (!this.app) return

    const canvas = this.app.view as HTMLCanvasElement
    this.testFlight = new TestFlight(canvas, (result) => {
      if (result.success) {
        gameStateManager.completeTestFlight(result.score)
      } else {
        gameStateManager.failTestFlight()
      }
      this.testFlight = null
      this.showScene('mission-complete')
    })
  }

  private renderTestFlight(): void {
    if (!this.testFlight) return

    const scene = this.scenes['test-flight']
    const state = this.testFlight.getState()

    // Clear previous frame
    const existingGraphics = scene.getChildByName('test-flight-graphics') as PIXI.Graphics
    if (existingGraphics) {
      scene.removeChild(existingGraphics)
    }

    const g = new PIXI.Graphics()
    g.name = 'test-flight-graphics'

    // Draw player
    const player = state.player
    g.beginFill(0x00FF88)
    g.drawRect(
      player.x - scene.position.x - player.width / 2,
      player.y - scene.position.y - player.height / 2,
      player.width,
      player.height
    )
    g.endFill()

    // Draw entities
    state.entities.forEach(entity => {
      if (entity.type === 'obstacle') {
        g.beginFill(0x666666)
      } else if (entity.type === 'enemy') {
        g.beginFill(0xFF4444)
      } else if (entity.type === 'collectible') {
        g.beginFill(0xFFFF00)
      }
      g.drawRect(
        entity.x - scene.position.x - entity.width / 2,
        entity.y - scene.position.y - entity.height / 2,
        entity.width,
        entity.height
      )
      g.endFill()
    })

    // Draw projectiles
    state.projectiles.forEach(projectile => {
      g.beginFill(0x00AFFF)
      g.drawRect(
        projectile.x - scene.position.x - projectile.width / 2,
        projectile.y - scene.position.y - projectile.height / 2,
        projectile.width,
        projectile.height
      )
      g.endFill()
    })

    scene.addChild(g)
  }

  private createTouchControls(scene: PIXI.Container): void {
    const width = window.innerWidth
    const height = window.innerHeight

    // Movement area (left side)
    const moveArea = new PIXI.Graphics()
    moveArea.beginFill(0x000000, 0.3)
    moveArea.drawRect(-width/2, height/2 - 150, 150, 150)
    moveArea.endFill()
    scene.addChild(moveArea)

    const moveLabel = new PIXI.Text('BEWEGEN', {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0xFFFFFF
    })
    moveLabel.position.set(-width/2 + 75, height/2 - 140)
    scene.addChild(moveLabel)

    // Fire button (right side)
    const fireButton = new PIXI.Graphics()
    fireButton.beginFill(0xFF0000, 0.5)
    fireButton.drawCircle(width/2 - 50, height/2 - 50, 30)
    fireButton.endFill()
    scene.addChild(fireButton)

    const fireLabel = new PIXI.Text('SCHIEßEN', {
      fontFamily: 'Arial',
      fontSize: 10,
      fill: 0xFFFFFF
    })
    fireLabel.anchor.set(0.5)
    fireLabel.position.set(width/2 - 50, height/2 - 50)
    scene.addChild(fireLabel)
  }

  private initMissionCompleteScene(): void {
    const scene = this.scenes['mission-complete']

    // Background
    const bg = new PIXI.Graphics()
    bg.beginFill(0x1A1A2A)
    bg.drawRect(-window.innerWidth/2, -window.innerHeight/2, window.innerWidth, window.innerHeight)
    bg.endFill()
    scene.addChild(bg)

    const mission = gameStateManager.getCurrentMission()
    if (!mission) return

    // Title
    let titleText = 'MISSION ERFOLGREICH!'
    let titleColor = 0x00FF88

    if (mission.status === 'failed') {
      titleText = 'MISSION FEHLGESCHLAGEN'
      titleColor = 0xFF4444
    }

    const title = new PIXI.Text(titleText, {
      fontFamily: 'Arial',
      fontSize: 32,
      fill: titleColor,
      align: 'center'
    })
    title.anchor.set(0.5)
    title.position.set(0, -100)
    scene.addChild(title)

    // Mission Info
    const missionInfo = new PIXI.Text(`\nSchiff: ${mission.ship.name}\nProblem: ${mission.fault.name}\nBelohnung: ${mission.reward} Credits\n`, {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xCCCCCC,
      align: 'center'
    })
    missionInfo.anchor.set(0.5)
    missionInfo.position.set(0, -20)
    scene.addChild(missionInfo)

    // Test Flight Result
    if (mission.testFlightScore !== undefined) {
      const resultText = new PIXI.Text(`\nTestflug-Punkte: ${mission.testFlightScore}\n`, {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0x00FF88,
        align: 'center'
      })
      resultText.anchor.set(0.5)
      resultText.position.set(0, 40)
      scene.addChild(resultText)
    }

    // Credits
    const credits = gameStateManager.getCredits()
    const creditsText = new PIXI.Text(`Aktuelle Credits: ${credits}`, {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0xFFFF00,
      align: 'center'
    })
    creditsText.anchor.set(0.5)
    creditsText.position.set(0, 100)
    scene.addChild(creditsText)

    // Next Button
    const nextButton = this.createButton('WEITER', 0x00AA44, 0x00FF88, () => {
      gameStateManager.cancelMission()
      this.showScene('mission-select')
    })
    nextButton.position.set(0, 160)
    scene.addChild(nextButton)

    // Back Button
    const backButton = this.createButton('ZUR WERKSTATT', 0x666666, 0x888888, () => {
      gameStateManager.cancelMission()
      this.showScene('workshop')
    })
    backButton.position.set(0, 220)
    scene.addChild(backButton)
  }

  private initSettingsScene(): void {
    const scene = this.scenes.settings

    // Background
    const bg = new PIXI.Graphics()
    bg.beginFill(0x1A1A2A)
    bg.drawRect(-window.innerWidth/2, -window.innerHeight/2, window.innerWidth, window.innerHeight)
    bg.endFill()
    scene.addChild(bg)

    // Title
    const title = new PIXI.Text('EINSTELLUNGEN', {
      fontFamily: 'Arial',
      fontSize: 28,
      fill: 0x00FF88,
      align: 'center'
    })
    title.anchor.set(0.5)
    title.position.set(0, -100)
    scene.addChild(title)

    // Settings
    const settings = gameStateManager.getSettings()

    // Sound
    const soundButton = this.createToggleButton(
      'SOUND',
      settings.soundEnabled,
      0x00AA44,
      0x00FF88,
      (enabled) => {
        gameStateManager.updateSettings({ soundEnabled: enabled })
      }
    )
    soundButton.position.set(0, -40)
    scene.addChild(soundButton)

    // Music
    const musicButton = this.createToggleButton(
      'MUSIK',
      settings.musicEnabled,
      0x00AA44,
      0x00FF88,
      (enabled) => {
        gameStateManager.updateSettings({ musicEnabled: enabled })
      }
    )
    musicButton.position.set(0, 10)
    scene.addChild(musicButton)

    // Touch Controls
    const touchButton = this.createToggleButton(
      'TOUCH-STEUERUNG',
      settings.touchControls,
      0x00AA44,
      0x00FF88,
      (enabled) => {
        gameStateManager.updateSettings({ touchControls: enabled })
      }
    )
    touchButton.position.set(0, 60)
    scene.addChild(touchButton)

    // Save Game
    const saveButton = this.createButton('SPIELSTAND EXPORTIEREN', 0x0066AA, 0x00AFFF, () => {
      const json = gameStateManager.exportGame()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rebel-repair-save-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    })
    saveButton.position.set(0, 140)
    scene.addChild(saveButton)

    // Import Game
    const importButton = this.createButton('SPIELSTAND IMPORTIEREN', 0x0066AA, 0x00AFFF, () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const json = event.target?.result as string
            gameStateManager.importGame(json)
          }
          reader.readAsText(file)
        }
      }
      input.click()
    })
    importButton.position.set(0, 200)
    scene.addChild(importButton)

    // Reset Game
    const resetButton = this.createButton('SPIEL NEU STARTEN', 0xFF4444, 0xFF6666, () => {
      if (confirm('Möchtest du wirklich ein neues Spiel starten? Alle Fortschritte gehen verloren!')) {
        gameStateManager.resetGame()
        this.showScene('title')
      }
    })
    resetButton.position.set(0, 260)
    scene.addChild(resetButton)

    // Back Button
    const backButton = this.createButton('ZURÜCK', 0x666666, 0x888888, () => {
      this.showScene('title')
    })
    backButton.position.set(0, window.innerHeight/2 - 50)
    scene.addChild(backButton)
  }

  private initGameOverScene(): void {
    const scene = this.scenes['game-over']

    // Background
    const bg = new PIXI.Graphics()
    bg.beginFill(0x1A0A0A)
    bg.drawRect(-window.innerWidth/2, -window.innerHeight/2, window.innerWidth, window.innerHeight)
    bg.endFill()
    scene.addChild(bg)

    // Title
    const title = new PIXI.Text('GAME OVER', {
      fontFamily: 'Arial',
      fontSize: 48,
      fill: 0xFF4444,
      align: 'center'
    })
    title.anchor.set(0.5)
    title.position.set(0, -50)
    scene.addChild(title)

    // Back Button
    const backButton = this.createButton('ZURÜCK ZUM TITEL', 0x666666, 0x888888, () => {
      gameStateManager.resetGame()
      this.showScene('title')
    })
    backButton.position.set(0, 50)
    scene.addChild(backButton)
  }

  // ============ HELPER METHODS ============

  private createButton(
    text: string,
    bgColor: number,
    hoverColor: number,
    onClick: () => void,
    disabled: boolean = false
  ): PIXI.Container {
    const container = new PIXI.Container()

    const bg = new PIXI.Graphics()
    bg.beginFill(bgColor)
    bg.drawRoundedRect(-100, -25, 200, 50, 5)
    bg.endFill()
    container.addChild(bg)

    const textObj = new PIXI.Text(text, {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xFFFFFF,
      align: 'center'
    })
    textObj.anchor.set(0.5)
    container.addChild(textObj)

    if (!disabled) {
      container.interactive = true
      container.cursor = 'pointer'

      container.on('pointerover', () => {
        bg.clear()
        bg.beginFill(hoverColor)
        bg.drawRoundedRect(-100, -25, 200, 50, 5)
        bg.endFill()
      })

      container.on('pointerout', () => {
        bg.clear()
        bg.beginFill(bgColor)
        bg.drawRoundedRect(-100, -25, 200, 50, 5)
        bg.endFill()
      })

      container.on('pointerdown', () => {
        onClick()
      })
    } else {
      container.alpha = 0.5
    }

    return container
  }

  private createToggleButton(
    text: string,
    initialValue: boolean,
    bgColor: number,
    hoverColor: number,
    onChange: (enabled: boolean) => void
  ): PIXI.Container {
    const container = new PIXI.Container()

    const bg = new PIXI.Graphics()
    bg.beginFill(bgColor)
    bg.drawRoundedRect(-150, -25, 300, 50, 5)
    bg.endFill()
    container.addChild(bg)

    const textObj = new PIXI.Text(text, {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xFFFFFF,
      align: 'left'
    })
    textObj.position.set(-130, -12)
    container.addChild(textObj)

    // Toggle switch
    const toggle = new PIXI.Graphics()
    toggle.beginFill(initialValue ? 0x00FF88 : 0x666666)
    toggle.drawCircle(100, 0, 20)
    toggle.endFill()
    container.addChild(toggle)

    const toggleText = new PIXI.Text(initialValue ? 'AN' : 'AUS', {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0xFFFFFF
    })
    toggleText.anchor.set(0.5)
    toggleText.position.set(100, 0)
    container.addChild(toggleText)

    container.interactive = true
    container.cursor = 'pointer'

    container.on('pointerover', () => {
      bg.clear()
      bg.beginFill(hoverColor)
      bg.drawRoundedRect(-150, -25, 300, 50, 5)
      bg.endFill()
    })

    container.on('pointerout', () => {
      bg.clear()
      bg.beginFill(bgColor)
      bg.drawRoundedRect(-150, -25, 300, 50, 5)
      bg.endFill()
    })

    container.on('pointerdown', () => {
      const newValue = !initialValue
      onChange(newValue)

      toggle.clear()
      toggle.beginFill(newValue ? 0x00FF88 : 0x666666)
      toggle.drawCircle(100, 0, 20)
      toggle.endFill()
      toggleText.text = newValue ? 'AN' : 'AUS'
    })

    return container
  }

  private createStarfield(container: PIXI.Container, count: number, opacity: number): void {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * window.innerWidth - window.innerWidth / 2
      const y = Math.random() * window.innerHeight - window.innerHeight / 2
      const size = Math.random() * 2 + 1
      const brightness = Math.random() * 0.5 + 0.5

      const star = new PIXI.Graphics()
      star.beginFill(0xFFFFFF, opacity * brightness)
      star.drawCircle(x, y, size)
      star.endFill()
      container.addChild(star)
    }
  }

  private createWorkshopBackground(container: PIXI.Container): void {
    const bg = new PIXI.Graphics()

    // Floor
    bg.beginFill(0x333333)
    bg.drawRect(-window.innerWidth/2, window.innerHeight/2 - 50, window.innerWidth, 50)
    bg.endFill()

    // Walls
    bg.beginFill(0x222222)
    bg.drawRect(-window.innerWidth/2, -window.innerHeight/2, 20, window.innerHeight)
    bg.drawRect(window.innerWidth/2 - 20, -window.innerHeight/2, 20, window.innerHeight)
    bg.endFill()

    // Ceiling lights
    for (let i = 0; i < 5; i++) {
      const x = -window.innerWidth/2 + 100 + i * 200
      bg.beginFill(0xFFFF00, 0.3)
      bg.drawCircle(x, -window.innerHeight/2 + 30, 30)
      bg.endFill()
    }

    // Workbench
    bg.beginFill(0x444444)
    bg.drawRect(-100, window.innerHeight/2 - 80, 200, 30)
    bg.endFill()

    container.addChild(bg)
  }

  private updateMissionDisplay(container: PIXI.Container): void {
    // Remove old elements
    while (container.children.length > 1) {
      container.removeChildAt(1)
    }

    const missions = gameStateManager.getAvailableMissions()

    missions.forEach((mission, index) => {
      const y = 40 + index * 80

      const button = this.createButton(
        `${mission.ship.name} - ${mission.fault.name}`,
        0x0066AA,
        0x00AFFF,
        () => {
          gameStateManager.startMission(mission.id)
          this.showScene('diagnosis')
        }
      )
      button.position.set(0, y)
      container.addChild(button)

      const rewardText = new PIXI.Text(`Belohnung: ${mission.reward} Credits`, {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xFFFF00
      })
      rewardText.anchor.set(0.5)
      rewardText.position.set(0, y + 30)
      container.addChild(rewardText)
    })

    // No missions
    if (missions.length === 0) {
      const text = new PIXI.Text('Keine Aufträge verfügbar', {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0x888888
      })
      text.anchor.set(0.5)
      text.position.set(0, 40)
      container.addChild(text)
    }
  }

  // ============ SCENE SWITCHING ============

  showScene(scene: GameScene): void {
    // Hide all scenes
    Object.values(this.scenes).forEach(s => s.visible = false)

    // Show new scene
    this.currentScene = scene
    this.scenes[scene].visible = true

    // Reset position
    this.scenes[scene].position.set(window.innerWidth / 2, window.innerHeight / 2)

    // Special initialization for test flight
    if (scene === 'test-flight') {
      this.initTestFlight()
    }

    // Update mission select
    if (scene === 'mission-select' || scene === 'workshop') {
      const workshopScene = this.scenes.workshop
      const missionContainer = workshopScene.getChildAt(5) as PIXI.Container
      if (missionContainer) {
        this.updateMissionDisplay(missionContainer)
      }
    }

    // Refresh diagnosis scene
    if (scene === 'diagnosis') {
      this.scenes.diagnosis.destroy({ children: true })
      this.initDiagnosisScene()
    }

    // Refresh repair scene
    if (scene === 'repair') {
      this.scenes.repair.destroy({ children: true })
      this.initRepairScene()
    }

    // Refresh mission complete scene
    if (scene === 'mission-complete') {
      this.scenes['mission-complete'].destroy({ children: true })
      this.initMissionCompleteScene()
    }
  }

  private handleGameStateChange(): void {
    if (this.currentScene === 'workshop' || this.currentScene === 'mission-select') {
      const workshopScene = this.scenes.workshop
      const missionContainer = workshopScene.getChildAt(5) as PIXI.Container
      if (missionContainer) {
        this.updateMissionDisplay(missionContainer)
      }
    }
  }

  destroy(): void {
    cancelAnimationFrame(this.animationFrameId)
    window.removeEventListener('resize', this.handleResize.bind(this))
    
    if (this.testFlight) {
      this.testFlight.destroy()
    }

    if (this.app) {
      this.app.destroy(true)
    }
  }
}
