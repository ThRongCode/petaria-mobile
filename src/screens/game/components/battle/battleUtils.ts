import { Move } from '@/stores/types/game'

// Type Effectiveness Chart (Pokemon-style)
export const TYPE_EFFECTIVENESS: Record<string, { strong: string[], weak: string[], immune: string[] }> = {
  Normal: { strong: [], weak: ['Rock', 'Steel'], immune: ['Ghost'] },
  Fire: { strong: ['Grass', 'Ice', 'Bug', 'Steel'], weak: ['Fire', 'Water', 'Rock', 'Dragon'], immune: [] },
  Water: { strong: ['Fire', 'Ground', 'Rock'], weak: ['Water', 'Grass', 'Dragon'], immune: [] },
  Grass: { strong: ['Water', 'Ground', 'Rock'], weak: ['Fire', 'Grass', 'Poison', 'Flying', 'Bug', 'Dragon', 'Steel'], immune: [] },
  Electric: { strong: ['Water', 'Flying'], weak: ['Electric', 'Grass', 'Dragon'], immune: ['Ground'] },
  Ice: { strong: ['Grass', 'Ground', 'Flying', 'Dragon'], weak: ['Fire', 'Water', 'Ice', 'Steel'], immune: [] },
  Fighting: { strong: ['Normal', 'Ice', 'Rock', 'Dark', 'Steel'], weak: ['Poison', 'Flying', 'Psychic', 'Bug', 'Fairy'], immune: ['Ghost'] },
  Poison: { strong: ['Grass', 'Fairy'], weak: ['Poison', 'Ground', 'Rock', 'Ghost'], immune: ['Steel'] },
  Ground: { strong: ['Fire', 'Electric', 'Poison', 'Rock', 'Steel'], weak: ['Grass', 'Bug'], immune: ['Flying'] },
  Flying: { strong: ['Grass', 'Fighting', 'Bug'], weak: ['Electric', 'Rock', 'Steel'], immune: [] },
  Psychic: { strong: ['Fighting', 'Poison'], weak: ['Psychic', 'Steel'], immune: ['Dark'] },
  Bug: { strong: ['Grass', 'Psychic', 'Dark'], weak: ['Fire', 'Fighting', 'Poison', 'Flying', 'Ghost', 'Steel', 'Fairy'], immune: [] },
  Rock: { strong: ['Fire', 'Ice', 'Flying', 'Bug'], weak: ['Fighting', 'Ground', 'Steel'], immune: [] },
  Ghost: { strong: ['Psychic', 'Ghost'], weak: ['Dark'], immune: ['Normal'] },
  Dragon: { strong: ['Dragon'], weak: ['Steel'], immune: ['Fairy'] },
  Dark: { strong: ['Psychic', 'Ghost'], weak: ['Fighting', 'Dark', 'Fairy'], immune: [] },
  Steel: { strong: ['Ice', 'Rock', 'Fairy'], weak: ['Fire', 'Water', 'Electric', 'Steel'], immune: [] },
  Fairy: { strong: ['Fighting', 'Dragon', 'Dark'], weak: ['Fire', 'Poison', 'Steel'], immune: [] },
}

// Default moves fallback when pet has no moves
export const DEFAULT_MOVES: Move[] = [
  { id: '1', name: 'Tackle', type: 'Physical', element: 'Normal', power: 40, accuracy: 100, pp: 35, maxPp: 35, description: 'A basic physical attack' },
  { id: '2', name: 'Scratch', type: 'Physical', element: 'Normal', power: 40, accuracy: 100, pp: 35, maxPp: 35, description: 'A basic scratching attack' },
  { id: '3', name: 'Quick Attack', type: 'Physical', element: 'Normal', power: 40, accuracy: 100, pp: 30, maxPp: 30, description: 'A fast attack that strikes first' },
  { id: '4', name: 'Body Slam', type: 'Physical', element: 'Normal', power: 85, accuracy: 100, pp: 15, maxPp: 15, description: 'A powerful body attack' },
]

// Helper function to infer type from species name
export const getTypeFromSpecies = (species: string): string => {
  const lowerSpecies = species.toLowerCase()
  if (lowerSpecies.includes('char') || lowerSpecies.includes('fire')) return 'Fire'
  if (lowerSpecies.includes('squir') || lowerSpecies.includes('water')) return 'Water'
  if (lowerSpecies.includes('bulb') || lowerSpecies.includes('grass') || lowerSpecies.includes('leaf')) return 'Grass'
  if (lowerSpecies.includes('pika') || lowerSpecies.includes('electric') || lowerSpecies.includes('thunder')) return 'Electric'
  if (lowerSpecies.includes('ice') || lowerSpecies.includes('frost')) return 'Ice'
  if (lowerSpecies.includes('dragon')) return 'Dragon'
  if (lowerSpecies.includes('ghost')) return 'Ghost'
  if (lowerSpecies.includes('psychic')) return 'Psychic'
  if (lowerSpecies.includes('dark')) return 'Dark'
  if (lowerSpecies.includes('steel') || lowerSpecies.includes('metal')) return 'Steel'
  if (lowerSpecies.includes('fairy')) return 'Fairy'
  if (lowerSpecies.includes('rock') || lowerSpecies.includes('stone')) return 'Rock'
  if (lowerSpecies.includes('ground') || lowerSpecies.includes('sand')) return 'Ground'
  if (lowerSpecies.includes('fighting') || lowerSpecies.includes('fight')) return 'Fighting'
  if (lowerSpecies.includes('poison')) return 'Poison'
  if (lowerSpecies.includes('bug')) return 'Bug'
  if (lowerSpecies.includes('fly') || lowerSpecies.includes('bird')) return 'Flying'
  return 'Normal'
}

interface DamageResult {
  damage: number
  effectiveness: number
}

export const calculateDamage = (attacker: any, defender: any, move: Move): DamageResult => {
  if (move.power === 0) return { damage: 0, effectiveness: 1 } // Status moves
  
  // Miss chance (check first)
  if (Math.random() * 100 > move.accuracy) {
    return { damage: -1, effectiveness: 1 } // Miss
  }
  
  const attack = attacker.temporaryStats.attack
  const defense = defender.temporaryStats.defense
  const level = attacker.level || 12
  
  // Pokemon-like damage formula (simplified)
  const baseDamage = Math.floor(((((2 * level / 5 + 2) * move.power * attack / defense) / 50) + 2))
  
  // Calculate type effectiveness
  let effectiveness = 1.0
  const moveElement = move.element
  const defenderType = defender.type || getTypeFromSpecies(defender.species)
  
  console.log(`⚔️ Type Check: ${move.name} (${moveElement}) vs ${defender.species || defender.name} (${defenderType})`)
  
  if (moveElement && defenderType && TYPE_EFFECTIVENESS[moveElement]) {
    const typeChart = TYPE_EFFECTIVENESS[moveElement]
    if (typeChart.immune.includes(defenderType)) {
      effectiveness = 0
    } else if (typeChart.strong.includes(defenderType)) {
      effectiveness = 2.0
    } else if (typeChart.weak.includes(defenderType)) {
      effectiveness = 0.5
    }
    console.log(`   Effectiveness: ${effectiveness}x`)
  }
  
  // Add some randomness (85-100% damage)
  const randomFactor = (Math.random() * 0.15 + 0.85)
  const finalDamage = Math.floor(baseDamage * effectiveness * randomFactor)
  
  // Return actual damage (can be 0 for immune matchups)
  return { damage: finalDamage, effectiveness }
}

export const applyMoveEffects = (user: any, target: any, move: Move) => {
  if (move.effects) {
    // Healing effect
    if (move.effects.healing) {
      const healAmount = Math.floor(move.effects.healing)
      user.currentHp = Math.min(user.currentHp + healAmount, user.temporaryStats.hp)
    }
    
    // Stat boost effects
    if (move.effects.statBoost) {
      Object.entries(move.effects.statBoost).forEach(([stat, change]) => {
        if (typeof change === 'number') {
          user.temporaryStats[stat] = Math.max(1, user.temporaryStats[stat] + change)
        }
      })
    }
  }
}

export const getHpColor = (percentage: number): string => {
  if (percentage > 50) return '#4CAF50'
  if (percentage > 20) return '#FFA726'
  return '#EF5350'
}

export const buildRewardsMessage = (result: {
  won: boolean
  xpReward: number
  coinReward: number
  petLeveledUp: boolean
  petNewLevel: number
  petStatChanges?: { maxHp: number; attack: number; defense: number; speed: number }
  userLeveledUp: boolean
  userNewLevel: number
}): string => {
  let message = `⭐ ${result.xpReward} XP earned\n💰 ${result.coinReward} Coins earned`
  
  if (result.petLeveledUp) {
    message += `\n\n🎊 Your pet leveled up to Lv.${result.petNewLevel}!`
    if (result.petStatChanges) {
      message += `\n📊 New Stats:`
      message += `\n   HP: ${result.petStatChanges.maxHp}`
      message += `\n   ATK: ${result.petStatChanges.attack}`
      message += `\n   DEF: ${result.petStatChanges.defense}`
      message += `\n   SPD: ${result.petStatChanges.speed}`
    }
  }
  
  if (result.userLeveledUp) {
    message += `\n\n🏆 YOU LEVELED UP to Lv.${result.userNewLevel}!`
  }
  
  return message
}
