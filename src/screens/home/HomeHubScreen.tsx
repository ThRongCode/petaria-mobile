import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { Panel, useAlert, CurrencyBar } from '@/components/ui'
import { ScreenContainer, ThemedText } from '@/components'
import { useRouter } from 'expo-router'
import { useSelector, useDispatch } from 'react-redux'
import { getUserProfile, getAllPets } from '@/stores/selectors'
import { gameActions } from '@/stores/reducers'
import { apiClient } from '@/services/api/client'
import { userApi } from '@/services/api'
import { Ionicons } from '@expo/vector-icons'
import { AppIcons } from '@/constants/icons'
import { backgrounds } from '@/assets/images/backgrounds'
import {
  colors,
  fonts,
  spacing,
  radii,
  fontSizes,
  glowHero,
} from '@/themes'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { RootState } from '@/stores/store'

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
  const alert = useAlert()
  const insets = useSafeAreaInsets()
  const profile = useSelector(getUserProfile)
  const pets = useSelector(getAllPets)
  const dailyLogin = useSelector((state: RootState) => state.game.dailyLogin)
  const [healingLoading, setHealingLoading] = useState(false)
  const [loginClaimed, setLoginClaimed] = useState(dailyLogin.claimedToday)

  // Count unique species owned
  const uniqueSpecies = new Set(pets.map(p => p.species)).size
  const TOTAL_SPECIES = 51 // Gen 1 roster

  // Auto-claim daily login on first visit
  useEffect(() => {
    if (!dailyLogin.claimedToday && !loginClaimed) {
      userApi.claimDailyLogin().then(res => {
        if (res.success && res.data?.claimed) {
          setLoginClaimed(true)
          const r = res.data.reward
          dispatch(gameActions.setDailyLogin({
            ...dailyLogin,
            claimedToday: true,
            currentStreak: res.data.currentStreak,
            currentDay: ((res.data.currentStreak - 1) % 7) + 1,
            totalLogins: res.data.totalLogins,
            lastClaimedReward: r,
          }))
          // Refresh profile to get updated coins/gems/tickets
          dispatch({ type: 'game/loadUserData' })
          if (r) {
            const parts = []
            if (r.coins) parts.push(`${r.coins} coins`)
            if (r.gems) parts.push(`${r.gems} gems`)
            if (r.huntTickets) parts.push(`${r.huntTickets} hunt tickets`)
            if (r.battleTickets) parts.push(`${r.battleTickets} battle tickets`)
            alert.show(
              `${r.label || 'Daily Login'} (Day ${res.data.currentStreak})`,
              `Streak: ${res.data.currentStreak} days!\n\nRewards: ${parts.join(', ')}`,
              [{ text: 'Awesome!' }],
            )
          }
        } else {
          setLoginClaimed(true)
        }
      }).catch(() => setLoginClaimed(true))
    }
  }, [])

  // ── Healing handler (preserved from original) ───────────────────────────
  const handleHealAllPets = async () => {
    const HEAL_COST = 200
    alert.show(
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
                alert.show(
                  healedCount === 0 ? 'All Healthy!' : 'Healing Complete!',
                  healedCount === 0
                    ? message || 'All Pokémon are already at full health'
                    : `Healed ${healedCount} Pokémon!\nCoins: ${coinCost} spent, ${coinsRemaining} left`,
                  [{ text: 'OK' }],
                )
              } else {
                throw new Error(response.error?.message || 'Failed to heal')
              }
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Unable to heal right now'
              alert.show('Healing Failed', msg, [{ text: 'OK' }])
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
      subtitle: 'Check Rewards',
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
      backgroundImage={backgrounds.homeHub}
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
                <AppIcons.person size={22} color={colors.primaryFixedDim} />
              </View>
            </TouchableOpacity>
            <ThemedText style={s.brandText}>VnPeteria</ThemedText>
          </View>

          {/* Right: Notifications */}
          <TouchableOpacity
            style={s.notifBtn}
            onPress={() => router.push('/settings')}
          >
            <AppIcons.notifications size={22} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Currency row */}
        <View style={s.currencyRow}>
          <CurrencyBar coins={profile.currency?.coins} gems={profile.currency?.gems} />
        </View>

        {/* ════════════ STATUS CARDS ════════════ */}
        <View style={s.statusCards}>
          {/* Daily Login Streak */}
          <Panel variant="glass" intensity="default" flush style={s.statusCard}>
            <Ionicons name="flame" size={18} color="#FFD700" />
            <View style={{ flex: 1 }}>
              <ThemedText style={s.statusLabel}>Login Streak</ThemedText>
              <ThemedText style={s.statusValue}>
                {dailyLogin.currentStreak || 0} day{dailyLogin.currentStreak !== 1 ? 's' : ''}
              </ThemedText>
            </View>
            <View style={s.streakBadge}>
              <ThemedText style={s.streakBadgeText}>
                Day {dailyLogin.currentDay || 0}/7
              </ThemedText>
            </View>
          </Panel>

          {/* Collection Progress */}
          <Panel variant="glass" intensity="default" flush style={s.statusCard}>
            <Ionicons name="albums" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <ThemedText style={s.statusLabel}>Pokédex</ThemedText>
              <View style={s.collectionBarTrack}>
                <View style={[s.collectionBarFill, { width: `${Math.min((uniqueSpecies / TOTAL_SPECIES) * 100, 100)}%` as any }]} />
              </View>
            </View>
            <ThemedText style={s.statusValue}>{uniqueSpecies}/{TOTAL_SPECIES}</ThemedText>
          </Panel>
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
  currencyRow: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  notifBtn: {
    padding: spacing.sm,
    borderRadius: radii.full,
  },

  // ── Status Cards ───────────────────────────────────────────
  statusCards: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
  },
  statusLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.semiBold,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusValue: {
    fontSize: fontSizes.span,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  streakBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  streakBadgeText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: '#FFD700',
  },
  collectionBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceVariant,
    overflow: 'hidden',
    marginTop: 3,
  },
  collectionBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
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
