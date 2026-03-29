import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { ScreenContainer, ThemedText } from '@/components'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector } from 'react-redux'
import { getUserProfile } from '@/stores/selectors'
import { Ionicons } from '@expo/vector-icons'
import { battleApi } from '@/services/api'
import {
  colors,
  fonts,
  spacing,
  radii,
  fontSizes,
} from '@/themes'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface BattleType {
  id: string
  name: string
  description: string
  icon: string
  gradient: string[]
  rewards: string[]
  available: boolean
  endDate?: string
}

// Battle type color mapping
const BATTLE_COLORS: Record<string, { label: string; accent: string; badge: string; badgeBg: string }> = {
  event: { label: 'Special Event', accent: colors.secondaryContainer, badge: 'Difficulty: Elite', badgeBg: 'rgba(255, 219, 60, 0.2)' },
  exp: { label: 'Leveling Zone', accent: '#A855F7', badge: 'Difficulty: Training', badgeBg: 'rgba(168, 85, 247, 0.2)' },
  material: { label: 'Resource Hunt', accent: colors.primary, badge: 'Difficulty: Hard', badgeBg: 'rgba(68, 216, 241, 0.2)' },
}

/**
 * EventScreen — Immersive Battle Hub
 *
 * Layout (matches battle_arena_immersive design):
 *   1. Background + overlay
 *   2. Hero heading "Battle Hub" + subtitle
 *   3. Full-width battle mode cards with gradient overlay,
 *      category label, title, difficulty badge, description,
 *      full-width gradient CTA button
 */
export const EventScreen: React.FC = () => {
  const router = useRouter()
  const profile = useSelector(getUserProfile)
  const insets = useSafeAreaInsets()
  const [loading, setLoading] = useState(true)
  const [battleTypes, setBattleTypes] = useState<BattleType[]>([])

  useEffect(() => {
    loadBattleTypes()
  }, [])

  const loadBattleTypes = async () => {
    try {
      setLoading(true)
      const response = await battleApi.getBattleTypes()
      if (response.success && response.data) {
        setBattleTypes(response.data)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const handleBattleTypeSelect = (battleType: BattleType) => {
    router.push({
      pathname: '/battle-selection' as any,
      params: {
        battleType: battleType.id,
        battleName: battleType.name,
      },
    })
  }

  const getBattleTheme = (battleType: BattleType) => {
    const id = battleType.id.toLowerCase()
    if (id.includes('event')) return BATTLE_COLORS.event
    if (id.includes('exp')) return BATTLE_COLORS.exp
    return BATTLE_COLORS.material
  }

  const renderBattleCard = (battleType: BattleType, index: number) => {
    const theme = getBattleTheme(battleType)
    const gradientColors = battleType.available
      ? [battleType.gradient[0] || theme.accent, (battleType.gradient[1] || theme.accent) + '66']
      : ['rgba(100, 100, 100, 0.3)', 'rgba(50, 50, 50, 0.3)']

    return (
      <TouchableOpacity
        key={battleType.id}
        style={s.battleCard}
        onPress={() => handleBattleTypeSelect(battleType)}
        disabled={!battleType.available}
        activeOpacity={0.85}
      >
        {/* Card background gradient */}
        <LinearGradient
          colors={['rgba(15, 19, 31, 0.85)', 'rgba(15, 19, 31, 0.5)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.battleOverlay}
        />

        <View style={s.battleContent}>
          {/* Header Row */}
          <View style={s.battleHeaderRow}>
            <View style={s.battleTitleCol}>
              <ThemedText style={[s.battleLabel, { color: theme.accent }]}>
                {theme.label.toUpperCase()}
              </ThemedText>
              <ThemedText style={s.battleTitle}>{battleType.name}</ThemedText>
            </View>
            <View style={[s.diffBadge, { backgroundColor: theme.badgeBg, borderColor: theme.accent + '66' }]}>
              <ThemedText style={[s.diffBadgeText, { color: theme.accent }]}>
                {theme.badge.toUpperCase()}
              </ThemedText>
            </View>
          </View>

          {/* Description */}
          <ThemedText style={s.battleDesc}>{battleType.description}</ThemedText>

          {/* Rewards Row */}
          {battleType.rewards.length > 0 && (
            <View style={s.rewardsRow}>
              {battleType.rewards.slice(0, 3).map((reward, i) => (
                <View key={i} style={s.rewardChip}>
                  <Ionicons name="gift" size={12} color={colors.success} />
                  <ThemedText style={s.rewardText}>{reward}</ThemedText>
                </View>
              ))}
            </View>
          )}

          {/* CTA Button */}
          {battleType.available ? (
            <TouchableOpacity
              style={s.ctaBtn}
              onPress={() => handleBattleTypeSelect(battleType)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.accent, theme.accent + '88']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.ctaGradient}
              >
                <ThemedText style={s.ctaText}>CHALLENGE</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={s.lockedBtn}>
              <ThemedText style={s.lockedText}>COMING SOON</ThemedText>
            </View>
          )}

          {/* End date badge */}
          {battleType.endDate && (
            <View style={s.endDateBadge}>
              <Ionicons name="time" size={12} color={colors.error} />
              <ThemedText style={s.endDateText}>{battleType.endDate}</ThemedText>
            </View>
          )}
        </View>

        {/* Side accent glow */}
        <View style={[s.sideGlow, { backgroundColor: theme.accent }]} />
      </TouchableOpacity>
    )
  }

  return (
    <ScreenContainer
      backgroundImage={require('@/assets/images/background/mobile_background.png')}
      backgroundOverlay
    >
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={[s.scrollContent, { paddingTop: insets.top + spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ════════════ BATTLE CARDS ════════════ */}
        <View style={s.battlesList}>
          {loading ? (
            <View style={s.loadingBox}>
              <ActivityIndicator color={colors.primary} size="large" />
              <ThemedText style={s.loadingText}>Loading battle types...</ThemedText>
            </View>
          ) : (
            battleTypes.map((bt, i) => renderBattleCard(bt, i))
          )}
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

  // ── Battle Cards ───────────────────────────────────────────
  battlesList: {
    paddingHorizontal: spacing.lg,
    gap: spacing['2xl'],
  },
  battleCard: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(15, 19, 31, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  battleOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  battleContent: {
    padding: spacing['2xl'],
    gap: spacing.lg,
  },
  battleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  battleTitleCol: { flex: 1, gap: 4 },
  battleLabel: {
    fontSize: fontSizes.micro,
    fontFamily: fonts.extraBold,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  battleTitle: {
    fontSize: fontSizes.title,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  diffBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  diffBadgeText: {
    fontSize: fontSizes.micro,
    fontFamily: fonts.bold,
    letterSpacing: 1.5,
  },
  battleDesc: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  rewardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(35, 193, 107, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(35, 193, 107, 0.25)',
  },
  rewardText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.semiBold,
    color: colors.success,
  },
  ctaBtn: {
    borderRadius: radii.DEFAULT,
    overflow: 'hidden',
  },
  ctaGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderRadius: radii.DEFAULT,
    shadowColor: 'rgba(68, 216, 241, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
  },
  ctaText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.extraBold,
    color: colors.onPrimary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  lockedBtn: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderRadius: radii.DEFAULT,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lockedText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.extraBold,
    color: colors.outline,
    letterSpacing: 3,
  },
  endDateBadge: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  endDateText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.semiBold,
    color: colors.error,
  },
  sideGlow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    opacity: 0.6,
    borderTopLeftRadius: radii.xl,
    borderBottomLeftRadius: radii.xl,
  },

  // ── Loading ────────────────────────────────────────────────
  loadingBox: {
    padding: spacing['4xl'],
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
})
