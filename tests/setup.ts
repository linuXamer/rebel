import { beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { gameStateManager } from '../src/game/GameStateManager'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    length: Object.keys(store).length,
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock Service Worker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: vi.fn().mockResolvedValue({
      onupdatefound: null,
    }),
  },
  writable: true,
})

// Mock caches
const cacheMock = {
  match: vi.fn().mockResolvedValue(null),
  add: vi.fn().mockResolvedValue(undefined),
  addAll: vi.fn().mockResolvedValue(undefined),
  put: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(true),
  keys: vi.fn().mockResolvedValue([]),
}

const cachesMock = {
  open: vi.fn().mockResolvedValue(cacheMock),
  match: vi.fn().mockResolvedValue(null),
  delete: vi.fn().mockResolvedValue(true),
  keys: vi.fn().mockResolvedValue([]),
  has: vi.fn().mockResolvedValue(false),
}

Object.defineProperty(window, 'caches', {
  value: cachesMock,
  writable: true,
})

// Setup und Teardown
beforeAll(() => {
  // Initialen Spielstand zurücksetzen
  localStorageMock.clear()
})

beforeEach(() => {
  // Vor jedem Test den Spielstand zurücksetzen
  localStorageMock.clear()
})

afterAll(() => {
  vi.restoreAllMocks()
})

// Hilfsfunktion zum Warten auf asynchrone Operationen
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
