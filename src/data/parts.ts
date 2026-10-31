import type { SparePart } from '../types'

export const PARTS: Record<string, SparePart> = {
  'part-engine-001': {
    id: 'part-engine-001',
    name: 'Plasma-Filter',
    type: 'engine',
    cost: 800,
    description: 'Filtert Plasma-Abfälle aus den Antriebsleitungen. Ohne diesen Filter verstopft der Antrieb nach 100 Flugstunden.',
    stock: 5,
  },
  'part-engine-002': {
    id: 'part-engine-002',
    name: 'Turbo-Injektor',
    type: 'engine',
    cost: 1500,
    description: 'Erhöht die Beschleunigung um 20%. Nicht kompatibel mit allen Schiffen.',
    stock: 3,
  },
  'part-weapons-001': {
    id: 'part-weapons-001',
    name: 'Zielcomputer-Chip',
    type: 'weapons',
    cost: 1200,
    description: 'Modernster Zielcomputer-Chip. Kompatibel mit den meisten Waffen-Systemen.',
    stock: 4,
  },
  'part-weapons-002': {
    id: 'part-weapons-002',
    name: 'Blaster-Kühlung',
    type: 'weapons',
    cost: 600,
    description: 'Verhindert Überhitzung der Blaster. Ersetzt die Standard-Kühlung.',
    stock: 6,
  },
  'part-computer-001': {
    id: 'part-computer-001',
    name: 'Firmware-Update-Modul',
    type: 'computer',
    cost: 500,
    description: 'Aktualisiert die Bordcomputer-Firmware auf die neueste Version. Behebt die meisten Absturz-Probleme.',
    stock: 8,
  },
  'part-computer-002': {
    id: 'part-computer-002',
    name: 'Speicher-Erweiterung',
    type: 'computer',
    cost: 300,
    description: 'Erweitert den Arbeitsspeicher des Bordcomputers um 50%.',
    stock: 10,
  },
}

export function getPart(id: string): SparePart | undefined {
  return PARTS[id]
}

export function getPartsByType(type: string): SparePart[] {
  return Object.values(PARTS).filter(p => p.type === type)
}

export function getCorrectPartForFault(faultType: string): SparePart | undefined {
  const fault = Object.values(PARTS).find(p => p.type === faultType && p.name.includes('Filter') || p.name.includes('Chip') || p.name.includes('Modul'))
  return fault || getPartsByType(faultType)[0]
}

export function getInitialInventory(): Record<string, number> {
  const inventory: Record<string, number> = {}
  Object.values(PARTS).forEach(part => {
    inventory[part.id] = part.stock
  })
  return inventory
}
