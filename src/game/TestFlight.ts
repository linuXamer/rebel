import type { TestFlightResult } from '../types'
import { gameStateManager } from './GameStateManager'

export interface FlightEntity {
  id: string
  type: 'player' | 'obstacle' | 'enemy' | 'projectile' | 'collectible'
  x: number
  y: number
  width: number
  height: number
  speed: number
  direction: number
  health?: number
  damage?: number
  value?: number
}

export interface FlightState {
  player: FlightEntity
  entities: FlightEntity[]
  projectiles: FlightEntity[]
  score: number
  time: number
  hitsTaken: number
  targetsDestroyed: number
  gameOver: boolean
  success: boolean
  obstaclesPassed: number
}

export const TEST_FLIGHT_DURATION = 30000

export class TestFlight {
  private state: FlightState
  private keys: Record<string, boolean> = {}
  private touchControls: Record<string, boolean> = {}
  private spawnTimer: number = 0
  private spawnInterval: number = 2000

  constructor(private canvas: HTMLCanvasElement, private onComplete: (result: TestFlightResult) => void) {
    const mission = gameStateManager.getCurrentMission()
    const ship = mission?.ship
    
    this.state = {
      player: {
        id: 'player',
        type: 'player',
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: 40,
        height: 40,
        speed: (ship?.speed || 3) * 2,
        direction: 0,
        health: ship?.maxHealth || 100,
      },
      entities: [],
      projectiles: [],
      score: 0,
      time: 0,
      hitsTaken: 0,
      targetsDestroyed: 0,
      gameOver: false,
      success: false,
      obstaclesPassed: 0,
    }

    this.setupControls()
  }

  private setupControls(): void {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true
    })

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false
    })

    this.setupTouchControls()
  }

  private setupTouchControls(): void {
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault()
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i]
        this.handleTouchStart(touch.clientX)
      }
    })

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault()
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i]
        this.handleTouchEnd(touch.clientX)
      }
    })

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault()
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i]
        this.handleTouchMove(touch.clientX)
      }
    })
  }

  private handleTouchStart(x: number): void {
    const rect = this.canvas.getBoundingClientRect()
    const canvasX = x - rect.left

    if (canvasX < this.canvas.width / 2) {
      this.touchControls.moveLeft = true
      this.touchControls.moveUp = true
    } else {
      this.fireProjectile()
    }
  }

  private handleTouchEnd(x: number): void {
    const rect = this.canvas.getBoundingClientRect()
    const canvasX = x - rect.left

    if (canvasX < this.canvas.width / 2) {
      this.touchControls.moveLeft = false
      this.touchControls.moveUp = false
      this.touchControls.moveDown = false
    }
  }

  private handleTouchMove(x: number): void {
    const rect = this.canvas.getBoundingClientRect()
    const canvasX = x - rect.left

    if (canvasX < this.canvas.width / 2) {
      this.touchControls.moveLeft = true
      this.touchControls.moveUp = true
    }
  }

  update(deltaTime: number): void {
    if (this.state.gameOver) return

    this.state.time += deltaTime

    if (this.state.time >= TEST_FLIGHT_DURATION) {
      this.endFlight(true)
      return
    }

    this.updatePlayer(deltaTime)
    this.updateEntities(deltaTime)
    this.updateProjectiles(deltaTime)
    this.checkCollisions()
    this.spawnEntities(deltaTime)
    this.cleanup()
  }

  private updatePlayer(deltaTime: number): void {
    const player = this.state.player
    const speed = player.speed
    const settings = gameStateManager.getSettings()

    if (!settings.touchControls) {
      if (this.keys['ArrowUp'] || this.keys['KeyW']) {
        player.y -= speed * deltaTime / 16
      }
      if (this.keys['ArrowDown'] || this.keys['KeyS']) {
        player.y += speed * deltaTime / 16
      }
      if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
        player.x -= speed * deltaTime / 16
      }
      if (this.keys['ArrowRight'] || this.keys['KeyD']) {
        player.x += speed * deltaTime / 16
      }
      
      if (this.keys['Space'] && player.health && player.health > 0) {
        this.fireProjectile()
      }
    } else {
      if (this.touchControls.moveUp) {
        player.y -= speed * deltaTime / 16
      }
      if (this.touchControls.moveDown) {
        player.y += speed * deltaTime / 16
      }
      if (this.touchControls.moveLeft) {
        player.x -= speed * deltaTime / 16
      }
    }

    player.x = Math.max(0, Math.min(this.canvas.width - player.width, player.x))
    player.y = Math.max(0, Math.min(this.canvas.height - player.height, player.y))
  }

  private fireProjectile(): void {
    const player = this.state.player
    const mission = gameStateManager.getCurrentMission()
    const ship = mission?.ship
    
    if (!ship || ship.weaponSlots <= 0) return

    const projectile: FlightEntity = {
      id: `projectile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'projectile',
      x: player.x + player.width / 2 - 5,
      y: player.y + player.height / 2 - 5,
      width: 10,
      height: 10,
      speed: 8,
      direction: 0,
      damage: 20,
    }

    this.state.projectiles.push(projectile)
    this.keys['Space'] = false
  }

  private updateEntities(deltaTime: number): void {
    const entities = this.state.entities

    for (let i = entities.length - 1; i >= 0; i--) {
      const entity = entities[i]

      if (entity.type === 'obstacle') {
        entity.y += entity.speed * deltaTime / 16
      } else if (entity.type === 'enemy') {
        const player = this.state.player
        const dx = player.x - entity.x
        const dy = player.y - entity.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > 0) {
          entity.direction = Math.atan2(dy, dx)
          entity.x += Math.cos(entity.direction) * entity.speed * deltaTime / 16
          entity.y += Math.sin(entity.direction) * entity.speed * deltaTime / 16
        }
      } else if (entity.type === 'collectible') {
        entity.y += entity.speed * deltaTime / 16
      }

      if (
        entity.y > this.canvas.height + 100 ||
        entity.x < -100 ||
        entity.x > this.canvas.width + 100
      ) {
        entities.splice(i, 1)
      }
    }
  }

  private updateProjectiles(deltaTime: number): void {
    const projectiles = this.state.projectiles

    for (let i = projectiles.length - 1; i >= 0; i--) {
      const projectile = projectiles[i]

      projectile.x += Math.cos(projectile.direction) * projectile.speed * deltaTime / 16
      projectile.y += Math.sin(projectile.direction) * projectile.speed * deltaTime / 16

      if (
        projectile.x < 0 ||
        projectile.x > this.canvas.width ||
        projectile.y < 0 ||
        projectile.y > this.canvas.height
      ) {
        projectiles.splice(i, 1)
      }
    }
  }

  private spawnEntities(deltaTime: number): void {
    this.spawnTimer += deltaTime

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0

      const types = ['obstacle', 'enemy', 'collectible']
      const type = types[Math.floor(Math.random() * types.length)]

      let entity: FlightEntity

      if (type === 'obstacle') {
        entity = {
          id: `obstacle-${Date.now()}`,
          type: 'obstacle',
          x: Math.random() * (this.canvas.width - 60),
          y: -50,
          width: 60,
          height: 60,
          speed: 1 + Math.random() * 2,
          direction: 0,
        }
      } else if (type === 'enemy') {
        entity = {
          id: `enemy-${Date.now()}`,
          type: 'enemy',
          x: Math.random() > 0.5 ? -50 : this.canvas.width + 50,
          y: Math.random() * this.canvas.height,
          width: 30,
          height: 30,
          speed: 2 + Math.random() * 2,
          direction: 0,
          health: 30,
        }
      } else {
        entity = {
          id: `collectible-${Date.now()}`,
          type: 'collectible',
          x: Math.random() * (this.canvas.width - 30),
          y: -50,
          width: 30,
          height: 30,
          speed: 1,
          direction: 0,
          value: 100,
        }
      }

      this.state.entities.push(entity)
      this.spawnInterval = Math.max(500, this.spawnInterval - 100)
    }
  }

  private checkCollisions(): void {
    const player = this.state.player
    const entities = this.state.entities
    const projectiles = this.state.projectiles

    for (let i = entities.length - 1; i >= 0; i--) {
      const entity = entities[i]

      if (
        entity.type === 'obstacle' ||
        entity.type === 'enemy'
      ) {
        if (this.checkCollision(player, entity)) {
          if (player.health) {
            player.health -= entity.type === 'enemy' ? 10 : 5
            this.state.hitsTaken++

            if (player.health <= 0) {
              this.endFlight(false)
              return
            }
          }

          entities.splice(i, 1)
        }
      }

      if (entity.type === 'collectible' && this.checkCollision(player, entity)) {
        this.state.score += entity.value || 0
        entities.splice(i, 1)
      }
    }

    for (let p = projectiles.length - 1; p >= 0; p--) {
      const projectile = projectiles[p]

      for (let e = entities.length - 1; e >= 0; e--) {
        const entity = entities[e]

        if (
          (entity.type === 'enemy' || entity.type === 'obstacle') &&
          this.checkCollision(projectile, entity)
        ) {
          if (entity.health) {
            entity.health -= projectile.damage || 0
            if (entity.health <= 0) {
              if (entity.type === 'enemy') {
                this.state.score += 50
                this.state.targetsDestroyed++
              }
              entities.splice(e, 1)
            }
          } else {
            entities.splice(e, 1)
          }

          projectiles.splice(p, 1)
          break
        }
      }
    }

    for (const entity of entities) {
      if (entity.type === 'obstacle' && entity.y > this.canvas.height / 2) {
        this.state.obstaclesPassed++
      }
    }
  }

  private checkCollision(a: FlightEntity, b: FlightEntity): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    )
  }

  private cleanup(): void {
    this.state.projectiles = this.state.projectiles.filter(p => {
      return (
        p.x >= 0 &&
        p.x <= this.canvas.width &&
        p.y >= 0 &&
        p.y <= this.canvas.height
      )
    })

    this.state.entities = this.state.entities.filter(e => {
      return e.y <= this.canvas.height + 100
    })
  }

  private endFlight(success: boolean): void {
    const mission = gameStateManager.getCurrentMission()
    const ship = mission?.ship

    this.state.gameOver = true
    this.state.success = success

    const result: TestFlightResult = {
      success,
      score: this.state.score,
      time: this.state.time,
      hitsTaken: this.state.hitsTaken,
      targetsDestroyed: this.state.targetsDestroyed,
    }

    if (this.state.player.health === ship?.maxHealth) {
      result.score += 500
    }

    result.score += this.state.targetsDestroyed * 100
    result.score -= this.state.hitsTaken * 50
    result.score = Math.max(0, result.score)

    this.onComplete(result)
  }

  getState(): FlightState {
    return { ...this.state }
  }

  destroy(): void {
    window.removeEventListener('keydown', () => {})
    window.removeEventListener('keyup', () => {})
    this.canvas.removeEventListener('touchstart', () => {})
    this.canvas.removeEventListener('touchend', () => {})
    this.canvas.removeEventListener('touchmove', () => {})
  }
}
