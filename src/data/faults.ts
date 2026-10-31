import type { Fault, DiagnosisHint } from '../types'

export const FAULTS: Record<string, Fault> = {
  engine: {
    id: 'fault-engine-001',
    type: 'engine',
    name: 'Antriebsstottern',
    description: 'Der Warpantrieb hat Aussetzer. Ursache: Verstopfte Plasmaleitungen.',
    symptoms: [
      'Das Schiff ruckelt beim Beschleunigen',
      'Plasma-Geräusche aus dem Antrieb',
      'Überhitzungswarnungen im Cockpit',
      'Reduzierte Höchstgeschwindigkeit',
    ],
    repairCost: 1500,
    partName: 'Plasma-Filter',
    partCost: 800,
    difficulty: 2,
  },
  weapons: {
    id: 'fault-weapons-001',
    type: 'weapons',
    name: 'Waffenfehlfunktion',
    description: 'Die Blaster feuern nicht mehr korrekt. Ursache: Defekter Zielcomputer.',
    symptoms: [
      'Schüsse gehen daneben, obwohl das Ziel im Visier ist',
      'Waffen überhitzen schnell',
      'Zielcomputer zeigt "Hersteller unterstützt dieses System nicht mehr"',
      'Manuelle Zielerfassung funktioniert noch',
    ],
    repairCost: 2000,
    partName: 'Zielcomputer-Chip',
    partCost: 1200,
    difficulty: 3,
  },
  computer: {
    id: 'fault-computer-001',
    type: 'computer',
    name: 'Bordcomputer-Crash',
    description: 'Der Bordcomputer stürzt ständig ab. Ursache: Veraltete Firmware.',
    symptoms: [
      'Zufällige Systemneustarts',
      'Fehlermeldung: "Segmentation Fault (Core Dumped)"',
      'Navigationsdaten werden nicht gespeichert',
      'Displays zeigen nur noch Hieroglyphen',
    ],
    repairCost: 1000,
    partName: 'Firmware-Update-Modul',
    partCost: 500,
    difficulty: 1,
  },
}

export const DIAGNOSIS_HINTS: DiagnosisHint[] = [
  // Engine-Hinweise
  { id: 'hint-001', text: 'Das Schiff hat Ruckler beim Beschleunigen', faultType: 'engine', weight: 0.9 },
  { id: 'hint-002', text: 'Plasma-Geräusche sind aus dem Antrieb zu hören', faultType: 'engine', weight: 0.8 },
  { id: 'hint-003', text: 'Überhitzungswarnleuchten im Cockpit', faultType: 'engine', weight: 0.7 },
  { id: 'hint-004', text: 'Die Höchstgeschwindigkeit ist reduziert', faultType: 'engine', weight: 0.6 },
  
  // Weapons-Hinweise
  { id: 'hint-005', text: 'Schüsse gehen ständig daneben', faultType: 'weapons', weight: 0.9 },
  { id: 'hint-006', text: 'Die Waffen überhitzen schnell', faultType: 'weapons', weight: 0.8 },
  { id: 'hint-007', text: 'Zielcomputer zeigt Fehlermeldungen', faultType: 'weapons', weight: 0.7 },
  { id: 'hint-008', text: 'Manuelle Zielerfassung funktioniert noch', faultType: 'weapons', weight: 0.5 },
  
  // Computer-Hinweise
  { id: 'hint-009', text: 'Der Bordcomputer stürzt ab', faultType: 'computer', weight: 0.9 },
  { id: 'hint-010', text: 'Fehlermeldung: "Segmentation Fault"', faultType: 'computer', weight: 0.8 },
  { id: 'hint-011', text: 'Navigationsdaten werden nicht gespeichert', faultType: 'computer', weight: 0.7 },
  { id: 'hint-012', text: 'Displays zeigen seltsame Zeichen', faultType: 'computer', weight: 0.6 },
]

export function getFault(type: string): Fault {
  return FAULTS[type] || FAULTS.engine
}

export function getRandomFault(): Fault {
  const types = Object.keys(FAULTS)
  return FAULTS[types[Math.floor(Math.random() * types.length)]]
}

export function getHintsForFault(faultType: string, count: number = 3): DiagnosisHint[] {
  const allHints = DIAGNOSIS_HINTS.filter(h => h.faultType === faultType)
  const otherHints = DIAGNOSIS_HINTS.filter(h => h.faultType !== faultType)
  
  // Mischung aus passenden und zufälligen Hinweisen
  const hints: DiagnosisHint[] = []
  
  // Immer mindestens 2 passende Hinweise
  for (let i = 0; i < Math.min(2, allHints.length); i++) {
    hints.push(allHints[i])
  }
  
  // Rest mit anderen Hinweisen auffüllen
  while (hints.length < count) {
    const otherHint = otherHints[Math.floor(Math.random() * otherHints.length)]
    if (!hints.find(h => h.id === otherHint.id)) {
      hints.push(otherHint)
    }
  }
  
  return hints.sort(() => Math.random() - 0.5)
}

export function getAllHintsForFault(faultType: string): DiagnosisHint[] {
  return DIAGNOSIS_HINTS.filter(h => h.faultType === faultType)
}
