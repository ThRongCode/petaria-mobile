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

// Type inference patterns: maps keywords to Pokemon types
const TYPE_PATTERNS: Array<{ keywords: string[]; type: string }> = [
  { keywords: ['char', 'fire'], type: 'Fire' },
  { keywords: ['squir', 'water'], type: 'Water' },
  { keywords: ['bulb', 'grass', 'leaf'], type: 'Grass' },
  { keywords: ['pika', 'electric', 'thunder'], type: 'Electric' },
  { keywords: ['ice', 'frost'], type: 'Ice' },
  { keywords: ['dragon'], type: 'Dragon' },
  { keywords: ['ghost'], type: 'Ghost' },
  { keywords: ['psychic'], type: 'Psychic' },
  { keywords: ['dark'], type: 'Dark' },
  { keywords: ['steel', 'metal'], type: 'Steel' },
  { keywords: ['fairy'], type: 'Fairy' },
  { keywords: ['rock', 'stone'], type: 'Rock' },
  { keywords: ['ground', 'sand'], type: 'Ground' },
  { keywords: ['fighting', 'fight'], type: 'Fighting' },
  { keywords: ['poison'], type: 'Poison' },
  { keywords: ['bug'], type: 'Bug' },
  { keywords: ['fly', 'bird'], type: 'Flying' },
]

export function getTypeFromSpecies(species: string): string {
  const lowerSpecies = species.toLowerCase()

  for (const { keywords, type } of TYPE_PATTERNS) {
    if (keywords.some(keyword => lowerSpecies.includes(keyword))) {
      return type
    }
  }

  return 'Normal'
}

interface DamageResult {
  damage: number
  effectiveness: number
}

export function calculateDamage(attacker: any, defender: any, move: Move): DamageResult {
  // Status moves deal no damage
  if (move.power === 0) {
    return { damage: 0, effectiveness: 1 }
  }

  // Miss chance (check first)
  if (Math.random() * 100 > move.accuracy) {
    return { damage: -1, effectiveness: 1 }
  }

  const attack = attacker.temporaryStats.attack
  const defense = defender.temporaryStats.defense
  const level = attacker.level || 12

  // Pokemon-like damage formula (simplified)
  const baseDamage = Math.floor(((((2 * level / 5 + 2) * move.power * attack / defense) / 50) + 2))

  // Calculate type effectiveness
  const moveElement = move.element
  const defenderType = defender.type || getTypeFromSpecies(defender.species)
  let effectiveness = 1.0

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

  return { damage: finalDamage, effectiveness }
}

export function applyMoveEffects(user: any, target: any, move: Move): void {
  if (!move.effects) {
    return
  }

  // Healing effect
  if (move.effects.healing) {
    const healAmount = Math.floor(move.effects.healing)
    user.currentHp = Math.min(user.currentHp + healAmount, user.temporaryStats.hp)
  }

  // Stat boost effects
  if (move.effects.statBoost) {
    for (const [stat, change] of Object.entries(move.effects.statBoost)) {
      if (typeof change === 'number') {
        user.temporaryStats[stat] = Math.max(1, user.temporaryStats[stat] + change)
      }
    }
  }
}

export function getHpColor(percentage: number): string {
  if (percentage > 50) {
    return '#4CAF50' // Green - healthy
  }
  if (percentage > 20) {
    return '#FFA726' // Orange - warning
  }
  return '#EF5350' // Red - critical
}

interface BattleResultForMessage {
  won: boolean
  xpReward: number
  coinReward: number
  petLeveledUp: boolean
  petNewLevel: number
  petStatChanges?: { maxHp: number; attack: number; defense: number; speed: number }
  userLeveledUp: boolean
  userNewLevel: number
}

export function buildRewardsMessage(result: BattleResultForMessage): string {
  const lines: string[] = [
    `⭐ ${result.xpReward} XP earned`,
    `💰 ${result.coinReward} Coins earned`,
  ]

  if (result.petLeveledUp) {
    lines.push('')
    lines.push(`🎊 Your pet leveled up to Lv.${result.petNewLevel}!`)
    if (result.petStatChanges) {
      lines.push(`📊 New Stats:`)
      lines.push(`   HP: ${result.petStatChanges.maxHp}`)
      lines.push(`   ATK: ${result.petStatChanges.attack}`)
      lines.push(`   DEF: ${result.petStatChanges.defense}`)
      lines.push(`   SPD: ${result.petStatChanges.speed}`)
    }
  }

  if (result.userLeveledUp) {
    lines.push('')
    lines.push(`🏆 YOU LEVELED UP to Lv.${result.userNewLevel}!`)
  }

  return lines.join('\n')
}
