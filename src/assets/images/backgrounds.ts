/**
 * Background Images — Central registry
 *
 * Single source of truth for all screen & card background images.
 * To swap a background, just change the require() path here.
 *
 * Usage:
 *   import { backgrounds } from '@/assets/images/backgrounds'
 *   <ScreenContainer backgroundImage={backgrounds.homeHub} />
 */
import { ImageSourcePropType } from 'react-native'

/** Full-screen backgrounds keyed by flow / screen */
export const backgrounds = {
  /** Default fallback — deep navy abstract */
  default: require('./background/mobile_background.png') as ImageSourcePropType,

  // ── Main Tabs ────────────────────────────────
  /** Home hub — fantasy dusk landscape with floating islands */
  homeHub: require('./background/home_hub_landscape.jpg') as ImageSourcePropType,

  /** Profile — cyan/purple nebula cosmos */
  profile: require('./background/profile_celestial.jpg') as ImageSourcePropType,

  // ── Battle Flow ──────────────────────────────
  /** Battle Hub / Events — sci-fi arena overview */
  battleHub: require('./background/battle_arena.jpg') as ImageSourcePropType,

  /** Battle Selection — sci-fi tech arena */
  battleSelection: require('./background/battle_selection.jpg') as ImageSourcePropType,

  /** Battle Arena — stadium with grid floor */
  battleArena: require('./background/battle_stadium.jpg') as ImageSourcePropType,

  // ── Hunt Flow ────────────────────────────────
  /** Hunting Grounds — same as homeHub for now */
  huntingGrounds: require('./background/home_hub_landscape.jpg') as ImageSourcePropType,

  /** Hunting Session — ethereal meadow with glowing crystals */
  huntingSession: require('./background/hunting_meadow.jpg') as ImageSourcePropType,

  /** Hunting Session alt — deep sea bioluminescent cave */
  huntingCave: require('./background/hunting_cave.jpg') as ImageSourcePropType,

  // ── Other Screens ────────────────────────────
  /** Quests — cloud-covered mountain ruins */
  quests: require('./background/quests_mountain.jpg') as ImageSourcePropType,

  /** Pets collection */
  pets: require('./background/mobile_background.png') as ImageSourcePropType,

  /** Pet details */
  petDetails: require('./background/mobile_background.png') as ImageSourcePropType,

  /** Item use */
  itemUse: require('./background/mobile_background.png') as ImageSourcePropType,

  /** Shop */
  shop: require('./background/mobile_background.png') as ImageSourcePropType,

  /** Settings */
  settings: require('./background/mobile_background.png') as ImageSourcePropType,

  /** Pokemon selection */
  pokemonSelection: require('./background/mobile_background.png') as ImageSourcePropType,

  // ── Auth Flow ────────────────────────────────
  /** Sign in — abstract cyan/blue flowing gradients */
  signIn: require('./background/auth_abstract.jpg') as ImageSourcePropType,

  /** Sign up — celestial dragon in mystical forest */
  signUp: require('./background/auth_dragon.jpg') as ImageSourcePropType,

  /** Forgot password — same abstract as sign in */
  forgotPassword: require('./background/auth_abstract.jpg') as ImageSourcePropType,
} as const

/** Battle card backgrounds (used inside EventScreen cards) */
export const battleCardBackgrounds = {
  /** Event Battle — volcanic arena */
  event: require('./background/battle_card_event.jpg') as ImageSourcePropType,

  /** EXP Battle — digital grid */
  exp: require('./background/battle_card_exp.jpg') as ImageSourcePropType,

  /** Material Battle — robotic factory */
  material: require('./background/battle_card_material.jpg') as ImageSourcePropType,
} as const
