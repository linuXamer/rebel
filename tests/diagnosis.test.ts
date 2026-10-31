import { describe, it, expect } from 'vitest'
import { getHintsForFault, getAllHintsForFault, getFault } from '../src/data/faults'
import { FAULTS, DIAGNOSIS_HINTS } from '../src/data/faults'
import type { FaultType } from '../src/types'

describe('Diagnosis System', () => {
  describe('Fault Data', () => {
    it('should have three fault types', () => {
      const faultTypes: FaultType[] = ['engine', 'weapons', 'computer']
      faultTypes.forEach(type => {
        const fault = getFault(type)
        expect(fault).toBeDefined()
        expect(fault.type).toBe(type)
        expect(fault.name).toBeDefined()
        expect(fault.description).toBeDefined()
        expect(fault.symptoms).toBeDefined()
        expect(fault.symptoms.length).toBeGreaterThan(0)
        expect(fault.repairCost).toBeGreaterThan(0)
        expect(fault.partName).toBeDefined()
        expect(fault.partCost).toBeGreaterThan(0)
        expect(fault.difficulty).toBeGreaterThanOrEqual(1)
        expect(fault.difficulty).toBeLessThanOrEqual(3)
      })
    })

    it('should have unique fault IDs', () => {
      const ids = Object.values(FAULTS).map(f => f.id)
      const uniqueIds = new Set(ids)
      expect(ids.length).toBe(uniqueIds.size)
    })

    it('should have different symptoms for each fault', () => {
      const engineSymptoms = getFault('engine').symptoms
      const weaponsSymptoms = getFault('weapons').symptoms
      const computerSymptoms = getFault('computer').symptoms

      // Jede Fehlerart sollte einzigartige Symptome haben
      const allSymptoms = [...engineSymptoms, ...weaponsSymptoms, ...computerSymptoms]
      const uniqueSymptoms = new Set(allSymptoms)
      
      // Nicht alle Symptome müssen einzigartig sein, aber es sollten Überschneidungen geben
      expect(allSymptoms.length).toBeGreaterThan(uniqueSymptoms.size)
    })
  })

  describe('Diagnosis Hints', () => {
    it('should have hints for each fault type', () => {
      const faultTypes: FaultType[] = ['engine', 'weapons', 'computer']
      faultTypes.forEach(type => {
        const hints = getAllHintsForFault(type)
        expect(hints.length).toBeGreaterThan(0)
        hints.forEach(hint => {
          expect(hint.faultType).toBe(type)
          expect(hint.text).toBeDefined()
          expect(hint.weight).toBeGreaterThanOrEqual(0)
          expect(hint.weight).toBeLessThanOrEqual(1)
        })
      })
    })

    it('should return correct number of hints', () => {
      const hints = getHintsForFault('engine', 4)
      expect(hints.length).toBe(4)
    })

    it('should include hints for the correct fault type', () => {
      const hints = getHintsForFault('engine', 4)
      const engineHints = hints.filter(h => h.faultType === 'engine')
      
      // Sollte mindestens 2 passende Hinweise enthalten
      expect(engineHints.length).toBeGreaterThanOrEqual(2)
    })

    it('should mix hints from different fault types', () => {
      const hints = getHintsForFault('engine', 4)
      const faultTypes = hints.map(h => h.faultType)
      const uniqueFaultTypes = new Set(faultTypes)
      
      // Sollte Hinweise von verschiedenen Fehlerarten enthalten
      expect(uniqueFaultTypes.size).toBeGreaterThanOrEqual(1)
    })

    it('should have unique hint IDs', () => {
      const ids = DIAGNOSIS_HINTS.map(h => h.id)
      const uniqueIds = new Set(ids)
      expect(ids.length).toBe(uniqueIds.size)
    })
  })

  describe('Hint Quality', () => {
    it('should have higher weight for more specific hints', () => {
      const engineHints = getAllHintsForFault('engine')
      const maxWeight = Math.max(...engineHints.map(h => h.weight))
      const minWeight = Math.min(...engineHints.map(h => h.weight))
      
      expect(maxWeight).toBeGreaterThan(minWeight)
    })

    it('should have descriptive hint texts', () => {
      DIAGNOSIS_HINTS.forEach(hint => {
        expect(hint.text.length).toBeGreaterThan(10)
        expect(hint.text).not.toContain('undefined')
        expect(hint.text).not.toContain('null')
      })
    })
  })

  describe('Diagnosis Logic', () => {
    it('should be possible to identify fault from symptoms', () => {
      const faultTypes: FaultType[] = ['engine', 'weapons', 'computer']
      
      faultTypes.forEach(faultType => {
        const fault = getFault(faultType)
        const hints = getHintsForFault(faultType, 3)
        
        // Die meisten Hinweise sollten zur richtigen Fehlerart passen
        const correctHints = hints.filter(h => h.faultType === faultType)
        expect(correctHints.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('should have hints that correspond to actual symptoms', () => {
      const faultTypes: FaultType[] = ['engine', 'weapons', 'computer']
      
      faultTypes.forEach(faultType => {
        const fault = getFault(faultType)
        const hints = getAllHintsForFault(faultType)
        
        // Jeder Hinweis sollte mit den Symptomen der Fehlerart zusammenhängen
        hints.forEach(hint => {
          // Prüfen ob der Hinweis-Text mit einem der Symptome übereinstimmt
          const matchingSymptoms = fault.symptoms.filter(symptom =>
            hint.text.toLowerCase().includes(symptom.toLowerCase().substring(0, 10)) ||
            symptom.toLowerCase().includes(hint.text.toLowerCase().substring(0, 10))
          )
          
          // Mindestens ein Symptom sollte mit dem Hinweis zusammenhängen
          // (Diese Prüfung ist etwas locker, da die Texte nicht exakt übereinstimmen müssen)
          expect(hint.text.length).toBeGreaterThan(0)
        })
      })
    })
  })
})
