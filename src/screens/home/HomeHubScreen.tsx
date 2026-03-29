import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Panel } from '@/components/ui'
import { ScreenContainer, ThemedText } from '@/components'
import { useRouter } from 'expo-router'
import { useSelector, useDispatch } from 'react-redux'
import { getUserProfile } from '@/stores/selectors'
import { gameActions } from '@/stores/reducers'
import { apiClient } from '@/services/api/client'
import { Ionicons } from '@expo/vector-icons'
import {
  colors,
  fonts,
  spacing,
  radii,
  fontSizes,
  glowHero,
} from '@/themes'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const HERO_SIZE = SCREEN_WIDTH * 0.38
const ICON_BOX = 56

// ─── Nav grid item definition ────────────────────────────────────────────────
interface NavItem {
  key: string
  icon: keyof typeof Ionicons.glyphMap
  label: string
  subtitle: string
  tintColor: string
  tintBg: string
  route: string
  badge?: boolean
  isHealing?: boolean
}

/**
 * HomeHubScreen — Immersive main hub.
 *
 * Layout (top → bottom):
 *   1. Fixed background image + gradient overlay
 *   2. Compact TopAppBar (avatar / brand / gems / notifications)
 *   3. Hero section (strongest pet in circular glass frame)
 *   4. 2×3 Bento nav grid (Hunt, Battle, Healing, Shop, Quests, Events)
 *   5. Trainer Logs (recent activity feed)
 */
export const HomeHubScreen: React.FC = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const insets = useSafeAreaInsets()
  const profile = useSelector(getUserProfile)
  const [healingLoading, setHealingLoading] = useState(false)

  // ── Healing handler (preserved from original) ───────────────────────────
  const handleHealAllPets = async () => {
    const HEAL_COST = 200
    Alert.alert(
      'Healing Center',
      `Heal all your Pokémon to full HP for ${HEAL_COST} coins?\n\nBalance: ${profile.currency?.coins || 0} coins`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Heal (${HEAL_COST} coins)`,
          onPress: async () => {
            try {
              setHealingLoading(true)
              const response = await apiClient.healAllPets()
              if (response.success && response.data) {
                const { healedCount, coinCost, coinsRemaining, message } = response.data
                if (coinCost > 0) {
                  dispatch(gameActions.updateProfile({
                    currency: { ...profile.currency, coins: coinsRemaining },
                  }))
                }
                dispatch(gameActions.loadUserData())
                Alert.alert(
                  healedCount === 0 ? 'All Healthy! 💚' : 'Healing Complete!',
                  healedCount === 0
                    ? message || 'All Pokémon are already at full health'
                    : `Healed ${healedCount} Pokémon! ✨\nCoins: ${coinCost} spent, ${coinsRemaining} left`,
                  [{ text: 'OK' }],
                )
              } else {
                throw new Error(response.error?.message || 'Failed to heal')
              }
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Unable to heal right now'
              Alert.alert('Healing Failed', msg, [{ text: 'OK' }])
            } finally {
              setHealingLoading(false)
            }
          },
        },
      ],
    )
  }

  // ── Nav grid items ──────────────────────────────────────────────────────
  const navItems: NavItem[] = [
    {
      key: 'hunt',
      icon: 'compass',
      label: 'Hunt Pokémon',
      subtitle: 'Wild Grounds',
      tintColor: colors.primary,
      tintBg: 'rgba(68, 216, 241, 0.15)',
      route: '/(app)/hunt',
    },
    {
      key: 'battle',
      icon: 'trophy',
      label: 'Battle Arena',
      subtitle: 'Global Rank',
      tintColor: colors.secondaryFixed,
      tintBg: 'rgba(255, 219, 60, 0.15)',
      route: '/(app)/battle',
    },
    {
      key: 'heal',
      icon: 'medkit',
      label: 'Healing Center',
      subtitle: 'Restore All',
      tintColor: colors.error,
      tintBg: 'rgba(255, 180, 171, 0.15)',
      route: '',
      isHealing: true,
    },
    {
      key: 'shop',
      icon: 'bag-handle',
      label: 'Item Shop',
      subtitle: 'Daily Deals',
      tintColor: colors.tertiary,
      tintBg: 'rgba(0, 218, 243, 0.15)',
      route: '/shop',
    },
    {
      key: 'quests',
      icon: 'clipboard',
      label: 'Daily Quests',
      subtitle: '3 Pending',
      tintColor: colors.tertiary,
      tintBg: 'rgba(0, 218, 243, 0.15)',
      route: '/quests',
      badge: true,
    },
    {
      key: 'events',
      icon: 'people',
      label: 'Special Events',
      subtitle: 'Time Limited',
      tintColor: colors.primaryFixed,
      tintBg: 'rgba(161, 239, 255, 0.15)',
      route: '/events',
    },
  ]

  const handleNavPress = (item: NavItem) => {
    if (item.isHealing) {
      handleHealAllPets()
    } else {
      router.push(item.route as any)
    }
  }

  return (
    <ScreenContainer
      backgroundImage={require('@/assets/images/background/mobile_background.png')}
      backgroundOverlay
    >
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={[s.scrollContent, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ════════════ TOP APP BAR ════════════ */}
        <View style={s.topBar}>
          {/* Left: Avatar + Brand */}
          <View style={s.topBarLeft}>
            <TouchableOpacity
              onPress={() => router.push('/(app)/profile')}
              style={s.avatarWrap}
            >
              <View style={s.avatarHolder}>
                <Ionicons name="person" size={22} color={colors.primaryFixedDim} />
              </View>
            </TouchableOpacity>
            <ThemedText style={s.brandText}>VnPeteria</ThemedText>
          </View>

          {/* Right: Gems + Notifications */}
          <View style={s.topBarRight}>
            <Panel variant="glass" intensity="subtle" flush style={s.gemsPill}>
              <ThemedText style={s.gemsText}>
                {profile.currency?.gems || 0}
              </ThemedText>
              <Ionicons name="diamond" size={14} color={colors.secondaryFixed} />
            </Panel>
            <TouchableOpacity
              style={s.notifBtn}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ════════════ HERO SECTION ════════════ */}
        <View style={s.heroSection}>
          {/* Avatar Container */}
          <View style={s.heroAvatarContainer}>
            {/* Circular Grey Avatar (matches Profile screen) */}
            <View style={[s.heroAvatarCircle, glowHero]}>
              <Ionicons name="person" size={48} color={colors.onSurfaceVariant} />
            </View>
            {/* Level Badge */}
            <View style={s.heroLevelBadge}>
              <ThemedText style={s.heroLevelBadgeText}>
                Lv.{profile.level || 1}
              </ThemedText>
            </View>
          </View>

          {/* Trainer Info Below */}
          <View style={s.heroInfo}>
            <ThemedText style={s.heroName}>
              {profile.username || 'Trainer'}
            </ThemedText>
            <View style={s.heroMeta}>
              <ThemedText style={s.heroLevel}>
                {profile.xp || 0} / {profile.xpToNext || 1000} XP
              </ThemedText>
              <View style={s.xpBarTrack}>
                <View style={[s.xpBarFill, { width: `${Math.min(((profile.xp || 0) / (profile.xpToNext || 1000)) * 100, 100)}%` as any }]} />
              </View>
            </View>
          </View>
        </View>

        {/* ════════════ BENTO NAV GRID ════════════ */}
        <View style={s.bentoGrid}>
          {navItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={s.bentoCard}
              onPress={() => handleNavPress(item)}
              activeOpacity={0.7}
              disabled={item.isHealing && healingLoading}
            >
              <Panel variant="glass" intensity="default" flush style={s.bentoCardInner}>
                {/* Badge dot */}
                {item.badge && <View style={s.badgeDot} />}

                {/* Icon container */}
                <View style={[s.iconBox, { backgroundColor: item.tintBg }]}>
                  {item.isHealing && healingLoading ? (
                    <ActivityIndicator size="small" color={item.tintColor} />
                  ) : (
                    <Ionicons name={item.icon} size={28} color={item.tintColor} />
                  )}
                </View>

                {/* Labels */}
                <ThemedText style={s.bentoLabel}>{item.label}</ThemedText>
                <ThemedText style={s.bentoSub}>{item.subtitle}</ThemedText>
              </Panel>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom spacing for tab bar */}
        <View style={{ height: spacing['5xl'] }} />
      </ScrollView>
    </ScreenContainer>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['4xl'],
  },

  // ── Top App Bar ────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarWrap: {},
  avatarHolder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(68, 216, 241, 0.30)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerHigh,
  },
  brandText: {
    fontSize: fontSizes.heading,
    fontFamily: fonts.extraBold,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  gemsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
  },
  gemsText: {
    fontSize: fontSizes.span,
    fontFamily: fonts.bold,
    color: colors.secondaryFixed,
  },
  notifBtn: {
    padding: spacing.sm,
    borderRadius: radii.full,
  },

  // ── Hero Section ───────────────────────────────────────────
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  heroAvatarContainer: {
    position: 'relative',
  },
  heroAvatarCircle: {
    width: HERO_SIZE,
    height: HERO_SIZE,
    borderRadius: HERO_SIZE / 2,
    borderWidth: 4,
    borderColor: colors.primary,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLevelBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: colors.secondaryContainer,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minWidth: 48,
    alignItems: 'center',
  },
  heroLevelBadgeText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.bold,
    color: colors.onSecondary,
  },
  heroInfo: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  heroName: {
    fontSize: fontSizes.heading,
    fontFamily: fonts.extraBold,
    color: colors.onSurface,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroLevel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  xpBarTrack: {
    width: 96,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceVariant,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
    // Glow on XP bar
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },

  // ── Bento Nav Grid ─────────────────────────────────────────
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  bentoCard: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2,
  },
  bentoCardInner: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.lg,
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
    borderWidth: 3,
    borderColor: colors.surfaceContainerLowest,
    zIndex: 10,
  },
  iconBox: {
    width: ICON_BOX,
    height: ICON_BOX,
    borderRadius: radii.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoLabel: {
    fontSize: fontSizes.span,
    fontFamily: fonts.bold,
    color: colors.primary,
    textAlign: 'center',
  },
  bentoSub: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
  },


})
