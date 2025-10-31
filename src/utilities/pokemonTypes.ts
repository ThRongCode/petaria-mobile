/**
 * Pokemon Species to Type Mapper
 * 
 * Maps Pokemon species names to their types
 */

import { PokemonType } from '@/components/pet'

export const getPokemonTypes = (species: string): PokemonType[] => {
  const speciesLower = species.toLowerCase()
  
  // Mapping based on species name
  const typeMap: Record<string, PokemonType[]> = {
    // Generation 1
    'bulbasaur': ['grass', 'poison'],
    'ivysaur': ['grass', 'poison'],
    'venusaur': ['grass', 'poison'],
    'charmander': ['fire'],
    'charmeleon': ['fire'],
    'charizard': ['fire', 'flying'],
    'squirtle': ['water'],
    'wartortle': ['water'],
    'blastoise': ['water'],
    'pikachu': ['electric'],
    'raichu': ['electric'],
    'sandshrew': ['ground'],
    'sandslash': ['ground'],
    'nidoran': ['poison'],
    'nidorino': ['poison'],
    'nidoking': ['poison', 'ground'],
    'clefairy': ['fairy'],
    'vulpix': ['fire'],
    'ninetales': ['fire'],
    'jigglypuff': ['normal', 'fairy'],
    'zubat': ['poison', 'flying'],
    'oddish': ['grass', 'poison'],
    'paras': ['bug', 'grass'],
    'venonat': ['bug', 'poison'],
    'diglett': ['ground'],
    'meowth': ['normal'],
    'psyduck': ['water'],
    'mankey': ['fighting'],
    'growlithe': ['fire'],
    'arcanine': ['fire'],
    'poliwag': ['water'],
    'abra': ['psychic'],
    'kadabra': ['psychic'],
    'machop': ['fighting'],
    'machoke': ['fighting'],
    'machamp': ['fighting'],
    'bellsprout': ['grass', 'poison'],
    'tentacool': ['water', 'poison'],
    'geodude': ['rock', 'ground'],
    'ponyta': ['fire'],
    'slowpoke': ['water', 'psychic'],
    'magnemite': ['electric', 'steel'],
    'farfetchd': ['normal', 'flying'],
    'doduo': ['normal', 'flying'],
    'seel': ['water'],
    'grimer': ['poison'],
    'shellder': ['water'],
    'gastly': ['ghost', 'poison'],
    'onix': ['rock', 'ground'],
    'drowzee': ['psychic'],
    'krabby': ['water'],
    'voltorb': ['electric'],
    'exeggcute': ['grass', 'psychic'],
    'cubone': ['ground'],
    'hitmonlee': ['fighting'],
    'hitmonchan': ['fighting'],
    'lickitung': ['normal'],
    'koffing': ['poison'],
    'rhyhorn': ['ground', 'rock'],
    'chansey': ['normal'],
    'tangela': ['grass'],
    'kangaskhan': ['normal'],
    'horsea': ['water'],
    'goldeen': ['water'],
    'staryu': ['water'],
    'mrmime': ['psychic', 'fairy'],
    'scyther': ['bug', 'flying'],
    'jynx': ['ice', 'psychic'],
    'electabuzz': ['electric'],
    'magmar': ['fire'],
    'pinsir': ['bug'],
    'tauros': ['normal'],
    'magikarp': ['water'],
    'gyarados': ['water', 'flying'],
    'lapras': ['water', 'ice'],
    'ditto': ['normal'],
    'eevee': ['normal'],
    'vaporeon': ['water'],
    'jolteon': ['electric'],
    'flareon': ['fire'],
    'porygon': ['normal'],
    'omanyte': ['rock', 'water'],
    'kabuto': ['rock', 'water'],
    'aerodactyl': ['rock', 'flying'],
    'snorlax': ['normal'],
    'articuno': ['ice', 'flying'],
    'zapdos': ['electric', 'flying'],
    'moltres': ['fire', 'flying'],
    'dratini': ['dragon'],
    'dragonair': ['dragon'],
    'dragonite': ['dragon', 'flying'],
    'mewtwo': ['psychic'],
    'mew': ['psychic'],
  }
  
  // Check if species exists in map
  if (typeMap[speciesLower]) {
    return typeMap[speciesLower]
  }
  
  // Default fallback based on name hints
  if (speciesLower.includes('fire') || speciesLower.includes('flame')) {
    return ['fire']
  }
  if (speciesLower.includes('water') || speciesLower.includes('aqua')) {
    return ['water']
  }
  if (speciesLower.includes('grass') || speciesLower.includes('leaf')) {
    return ['grass']
  }
  if (speciesLower.includes('electric') || speciesLower.includes('thunder')) {
    return ['electric']
  }
  if (speciesLower.includes('dragon')) {
    return ['dragon']
  }
  
  // Ultimate fallback
  return ['normal']
}
