/**
 * Unified Icon Registry
 *
 * Single source of truth for every icon in the app.
 * Each entry is a React component with a consistent (size, color) interface.
 *
 * To swap an icon's source (Ionicon ↔ SVG), change one line here —
 * zero changes at call sites.
 *
 * Usage:
 *   import { AppIcons } from '@/constants/icons'
 *   <AppIcons.coins size={16} color="#FFF" />
 */

import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { SvgIcons } from '@/assets/images/gui-icons-components'

// ── Shared prop interface ──────────────────────────────────
export interface IconProps {
  size?: number
  color?: string
}

// ── Factories ──────────────────────────────────────────────

/** Wrap an Ionicons name into a component */
const ionicon = (name: React.ComponentProps<typeof Ionicons>['name']) => {
  const Icon: React.FC<IconProps> = ({ size = 24, color }) => (
    <Ionicons name={name} size={size} color={color} />
  )
  Icon.displayName = `Ion(${name})`
  return Icon
}

/** Wrap an SvgIcons component */
const svg = (Component: React.FC<{ width?: number; height?: number; color?: string }>) => {
  const Icon: React.FC<IconProps> = ({ size = 24, color }) => (
    <Component width={size} height={size} color={color} />
  )
  Icon.displayName = `Svg(${Component.displayName || 'icon'})`
  return Icon
}

// ── Unified Registry ───────────────────────────────────────

export const AppIcons = {
  // ── Navigation / Tabs ────────────────────────────────
  tabHome:              ionicon('home'),
  tabHunt:              ionicon('map'),
  tabBattle:            ionicon('trophy'),
  tabPets:              ionicon('paw'),
  tabProfile:           ionicon('person'),
  tabDefault:           ionicon('ellipse'),

  // ── Currency ─────────────────────────────────────────
  coins:                ionicon('cash-outline'),
  gems:                 ionicon('diamond'),
  pokeball:             ionicon('tennisball'),
  coinsFilled:          ionicon('cash'),
  gemsFilled:           ionicon('diamond'),
  bitcoin:              ionicon('logo-bitcoin'),

  // ── Navigation Actions ───────────────────────────────
  back:                 ionicon('arrow-back'),
  backOutline:          ionicon('arrow-back-outline'),
  forward:              ionicon('arrow-forward'),
  chevronForward:       ionicon('chevron-forward'),
  close:                ionicon('close'),
  closeCircle:          ionicon('close-circle'),
  exitOutline:          ionicon('exit-outline'),
  logOut:               ionicon('log-out'),
  logOutOutline:        ionicon('log-out-outline'),

  // ── Status / Feedback ────────────────────────────────
  checkmarkCircle:      ionicon('checkmark-circle'),
  checkmarkCircleOutline: ionicon('checkmark-circle-outline'),
  alertCircle:          ionicon('alert-circle'),
  warning:              ionicon('warning'),
  helpCircleOutline:    ionicon('help-circle-outline'),
  infoCircle:           ionicon('information-circle'),

  // ── Actions / Controls ───────────────────────────────
  add:                  ionicon('add'),
  search:               ionicon('search-outline'),
  settings:             ionicon('settings'),
  notifications:        ionicon('notifications-outline'),
  play:                 ionicon('play'),
  copy:                 ionicon('copy-outline'),
  cart:                 ionicon('cart'),
  bagHandle:            ionicon('bag-handle-outline'),
  clipboard:            ionicon('clipboard-outline'),
  arrowUpCircle:        ionicon('arrow-up-circle'),
  radioOutline:         ionicon('radio-outline'),
  compassOutline:       ionicon('compass-outline'),

  // ── Game / Battle ────────────────────────────────────
  shield:               ionicon('shield'),
  flash:                ionicon('flash'),
  speedometer:          ionicon('speedometer'),
  star:                 ionicon('star'),
  sparkles:             ionicon('sparkles'),
  ribbon:               ionicon('ribbon'),
  trendingUp:           ionicon('trending-up'),

  // ── World / Exploration ──────────────────────────────
  walk:                 ionicon('walk'),
  leaf:                 ionicon('leaf'),
  map:                  ionicon('map'),

  // ── Profile / Social ─────────────────────────────────
  person:               ionicon('person'),
  happy:                ionicon('happy'),
  key:                  ionicon('key'),
  lockClosed:           ionicon('lock-closed'),
  lockClosedOutline:    ionicon('lock-closed-outline'),
  lockOpen:             ionicon('lock-open'),
  mailOutline:          ionicon('mail-outline'),

  // ── Items / Inventory ────────────────────────────────
  cube:                 ionicon('cube'),
  cubeOutline:          ionicon('cube-outline'),
  gift:                 ionicon('gift'),

  // ── Time / Calendar ──────────────────────────────────
  time:                 ionicon('time'),
  calendarOutline:      ionicon('calendar-outline'),

  // ── Misc ─────────────────────────────────────────────
  ellipse:              ionicon('ellipse'),
  businessOutline:      ionicon('business-outline'),

  // ── GUI SVG Icons ────────────────────────────────────
  svgPositionMarker:    svg(SvgIcons.PositionMarker),
  svgStarsStack:        svg(SvgIcons.StarsStack),
  svgAttackGauge:       svg(SvgIcons.AttackGauge),
  svgShoppingCart:      svg(SvgIcons.ShoppingCart),
  svgIdCard:            svg(SvgIcons.IdCard),
  svgWallet:            svg(SvgIcons.Wallet),
  svgChart:             svg(SvgIcons.Chart),
  svgCheckMark:         svg(SvgIcons.CheckMark),
  svgChecklist:         svg(SvgIcons.Checklist),
  svgPencil:            svg(SvgIcons.Pencil),
  svgStack:             svg(SvgIcons.Stack),
  svgInterdiction:      svg(SvgIcons.Interdiction),
} as const
