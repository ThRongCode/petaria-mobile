import React from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native'
import { Panel, useAlert, CurrencyBar } from '@/components/ui'
import { ScreenContainer, ThemedText } from '@/components'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector } from 'react-redux'
import { getUserProfile } from '@/stores/selectors'
import { Ionicons } from '@expo/vector-icons'
import { useAppDispatch } from '@/stores/store'
import { userActions, gameActions } from '@/stores/reducers'
import { userApi } from '@/services/api'
import { backgrounds } from '@/assets/images/backgrounds'
import {
  colors,
  fonts,
  spacing,
  radii,
  fontSizes,
  glowAmbient,
  glowError,
} from '@/themes'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const AVATAR_SIZE = 120
const STAT_CARD_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2

/**
 * ProfileScreen — Immersive trainer profile
 *
 * Layout (matches profile_immersive design):
 *   1. Background image + gradient overlay
 *   2. Profile header card: gradient-bordered avatar, level badge, name, rank, XP bar
 *   3. 2×2 stats grid (square aspect-ratio cards)
 *   4. Action buttons: Trainer Settings (gradient) + Logout (glass/error)
 */
export const ProfileScreen: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const alert = useAlert()
  const insets = useSafeAreaInsets()
  const profile = useSelector(getUserProfile)

  const handleLogout = () => {
    alert.show(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(userActions.logout())
          },
        },
      ],
    )
  }

  const handleAddBattleTickets = async () => {
    try {
      const response = await userApi.addBattleTickets()
      if (response.success) {
        alert.show('Success', response.data.message)
        dispatch(gameActions.loadUserData())
      }
    } catch {
      alert.show('Error', 'Failed to add battle tickets')
    }
  }

  const handleAddHuntTickets = async () => {
    try {
      const response = await userApi.addHuntTickets()
      if (response.success) {
        alert.show('Success', response.data.message)
        dispatch(gameActions.loadUserData())
      }
    } catch {
      alert.show('Error', 'Failed to add hunt tickets')
    }
  }

  const xpProgress = Math.min((profile.xp / (profile.xpToNext || 1)) * 100, 100)

  const stats = [
    { label: 'Battles Won', value: profile.stats?.battlesWon || 0, icon: 'trophy' as const, color: colors.secondaryFixed },
    { label: 'Pets Caught', value: profile.stats?.petsOwned || 0, icon: 'paw' as const, color: colors.primary },
    { label: 'Pokeballs', value: profile.currency?.pokeballs || 0, icon: 'baseball' as const, color: colors.tertiary },
    { label: 'Hunts Done', value: profile.stats?.huntsCompleted || 0, icon: 'compass' as const, color: colors.secondaryFixedDim },
  ]

  return (
    <ScreenContainer
      backgroundImage={backgrounds.profile}
      backgroundOverlay
    >
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={[s.scrollContent, { paddingTop: insets.top + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ════════════ HEADER BAR ════════════ */}
        <View style={s.headerBar}>
          <ThemedText style={s.headerBarTitle}>Profile</ThemedText>
        </View>
        <View style={s.currencyRow}>
          <CurrencyBar coins={profile.currency?.coins} gems={profile.currency?.gems} />
        </View>

        {/* ════════════ PROFILE HEADER CARD ════════════ */}
        <View style={s.headerSection}>
          <Panel variant="glass" intensity="default" style={s.headerPanel}>
            {/* Avatar with gradient ring */}
            <View style={s.avatarContainer}>
              <LinearGradient
                colors={[colors.primary, colors.primaryContainer, colors.secondaryFixed]}
                style={s.avatarGradientRing}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={s.avatarInner}>
                  <Ionicons name="person" size={50} color={colors.onSurfaceVariant} />
                </View>
              </LinearGradient>
              {/* Level Badge */}
              <View style={s.levelBadge}>
                <ThemedText style={s.levelText}>LVL {profile.level || 1}</ThemedText>
              </View>
            </View>

            {/* Trainer Info */}
            <ThemedText style={s.trainerName}>{profile.username}</ThemedText>
            <ThemedText style={s.trainerRank}>Pokémon Trainer</ThemedText>

            {/* XP Bar */}
            <View style={s.xpSection}>
              <View style={s.xpLabels}>
                <ThemedText style={s.xpLabel}>EXPERIENCE PROGRESS</ThemedText>
                <ThemedText style={s.xpLabel}>
                  {(profile.xp || 0).toLocaleString()} / {(profile.xpToNext || 1000).toLocaleString()} XP
                </ThemedText>
              </View>
              <View style={s.xpBarOuter}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryContainer]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[s.xpBarInner, { width: `${xpProgress}%` as any }]}
                />
              </View>
            </View>
          </Panel>
        </View>

        {/* ════════════ STATS GRID (2×2) ════════════ */}
        <View style={s.statsGrid}>
          {stats.map((stat, i) => (
            <Panel key={i} variant="glass" intensity="default" flush style={s.statCard}>
              <View style={s.statCardContent}>
                <Ionicons name={stat.icon} size={28} color={stat.color} />
                <View style={s.statBottom}>
                  <ThemedText style={s.statValue}>{stat.value.toLocaleString()}</ThemedText>
                  <ThemedText style={s.statLabel}>{stat.label}</ThemedText>
                </View>
              </View>
            </Panel>
          ))}
        </View>

        {/* ════════════ DEV TOOLS ════════════ */}
        {__DEV__ && (
          <View style={s.actionsSection}>
            <View style={s.devRow}>
              <TouchableOpacity style={s.devBtn} onPress={handleAddBattleTickets}>
                <Panel variant="glass" intensity="subtle" flush style={s.devBtnInner}>
                  <Ionicons name="shield" size={16} color={colors.error} />
                  <ThemedText style={s.devBtnText}>+5 Battle</ThemedText>
                </Panel>
              </TouchableOpacity>
              <TouchableOpacity style={s.devBtn} onPress={handleAddHuntTickets}>
                <Panel variant="glass" intensity="subtle" flush style={s.devBtnInner}>
                  <Ionicons name="leaf" size={16} color={colors.success} />
                  <ThemedText style={s.devBtnText}>+5 Hunt</ThemedText>
                </Panel>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ════════════ ACTION BUTTONS ════════════ */}
        <View style={s.actionsSection}>
          {/* Settings — gradient primary CTA */}
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => router.push('/settings' as any)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[s.actionGradient, glowAmbient]}
            >
              <Ionicons name="settings" size={20} color={colors.onPrimary} />
              <ThemedText style={s.actionTextPrimary}>TRAINER SETTINGS</ThemedText>
            </LinearGradient>
          </TouchableOpacity>

          {/* Logout — glass with error border */}
          <TouchableOpacity
            style={s.actionBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View style={[s.actionLogout, glowError]}>
              <Ionicons name="log-out" size={20} color={colors.error} />
              <ThemedText style={s.actionTextError}>LOGOUT PROFILE</ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: spacing['5xl'] }} />
      </ScrollView>
    </ScreenContainer>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: spacing['4xl'] },

  // ── Header Bar ────────────────────────────────────────────
  headerBar: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  headerBarTitle: {
    fontSize: fontSizes.heading,
    fontFamily: fonts.extraBold,
    color: colors.onSurface,
    letterSpacing: -0.5,
  },
  currencyRow: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },

  // ── Header Card ────────────────────────────────────────────
  headerSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  headerPanel: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.xl,
  },
  avatarGradientRing: {
    width: AVATAR_SIZE + 8,
    height: AVATAR_SIZE + 8,
    borderRadius: (AVATAR_SIZE + 8) / 2,
    padding: 4,
    // Cyan glow around the ring
    shadowColor: 'rgba(68, 216, 241, 0.30)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  avatarInner: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.secondaryContainer,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  levelText: {
    fontSize: fontSizes.span,
    fontFamily: fonts.extraBold,
    color: colors.onSecondary,
  },
  trainerName: {
    fontSize: fontSizes.heading,
    fontFamily: fonts.extraBold,
    color: colors.onSurface,
    letterSpacing: -0.3,
    marginBottom: spacing.xs,
  },
  trainerRank: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.medium,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.xl,
  },
  xpSection: {
    width: '100%',
    gap: spacing.sm,
  },
  xpLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  xpBarOuter: {
    width: '100%',
    height: 12,
    backgroundColor: colors.glass.subtle,
    borderRadius: radii.full,
    overflow: 'hidden',
    padding: 2,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
  },
  xpBarInner: {
    height: '100%',
    borderRadius: radii.full,
    // Glow on the fill
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },

  // ── Stats Grid ─────────────────────────────────────────────
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  statCard: {
    width: STAT_CARD_SIZE,
    aspectRatio: 1,
    borderRadius: radii.lg,
  },
  statCardContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  statBottom: {},
  statValue: {
    fontSize: fontSizes.heading,
    fontFamily: fonts.extraBold,
    color: colors.onSurface,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 2,
  },

  // ── Actions ────────────────────────────────────────────────
  actionsSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionBtn: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
    borderRadius: radii.lg,
  },
  actionTextPrimary: {
    fontSize: fontSizes.span,
    fontFamily: fonts.extraBold,
    color: colors.onPrimary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  actionLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.errorContainer,
  },
  actionTextError: {
    fontSize: fontSizes.span,
    fontFamily: fonts.extraBold,
    color: colors.error,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // ── Dev Tools ──────────────────────────────────────────────
  devRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  devBtn: {
    flex: 1,
    borderRadius: radii.DEFAULT,
    overflow: 'hidden',
  },
  devBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radii.DEFAULT,
  },
  devBtnText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
})
