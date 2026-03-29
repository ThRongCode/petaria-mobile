/**
 * BattleActions — "Lapis Glassworks" glass battle controls
 *
 * Battle log box, 2×2 move grid with gradient buttons, run button,
 * battle-over result panel with rewards summary.
 */

import React from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { ThemedText } from '@/components'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Move } from '@/stores/types/game'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'
import { gradientPrimary, gradientGold, gradientError } from '@/themes/styles'

interface BattleResult {
  won: boolean
  xpReward: number
  coinReward: number
  petLeveledUp: boolean
  petNewLevel: number
  petStatChanges?: { maxHp: number; attack: number; defense: number; speed: number }
  userLeveledUp: boolean
  userNewLevel: number
}

interface BattleActionsProps {
  battleLog: string[]
  turn: 'player' | 'opponent'
  battleOver: boolean
  winner: 'player' | 'opponent' | null
  playerName: string
  opponentName: string
  moves: Move[]
  selectedMove: Move | null
  isAnimating: boolean
  battleResult: BattleResult | null
  onMoveSelect: (move: Move) => void
  onRun: () => void
  onContinue: () => void
}

export const BattleActions: React.FC<BattleActionsProps> = ({
  battleLog,
  turn,
  battleOver,
  winner,
  playerName,
  opponentName,
  moves,
  selectedMove,
  isAnimating,
  battleResult,
  onMoveSelect,
  onRun,
  onContinue,
}) => (
  <View style={styles.container}>
    {/* Battle Log */}
    <View style={styles.logBox}>
      {battleLog.slice(-3).map((msg, i) => (
        <ThemedText key={i} style={styles.logText}>{msg}</ThemedText>
      ))}
    </View>

    {/* Action Panel */}
    <View style={styles.actionPanel}>
      {!battleOver ? (
        turn === 'player' ? (
          <View>
            <ThemedText style={styles.prompt}>What will {playerName} do?</ThemedText>

            {/* 2×2 Move Grid */}
            <View style={styles.movesGrid}>
              {moves.map((move, i) => {
                const isSelected = selectedMove?.name === move.name
                return (
                  <TouchableOpacity
                    key={i}
                    style={styles.moveBtn}
                    onPress={() => onMoveSelect(move)}
                    disabled={isAnimating}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={isSelected ? [colors.success, '#2E7D32'] : [...gradientPrimary] as [string, string]}
                      style={styles.moveGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <ThemedText style={styles.moveName}>{move.name}</ThemedText>
                      <ThemedText style={styles.movePP}>PP {move.pp}/{move.maxPp}</ThemedText>
                    </LinearGradient>
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* Run */}
            <TouchableOpacity style={styles.runBtn} onPress={onRun} activeOpacity={0.8}>
              <LinearGradient
                colors={[...gradientError] as [string, string]}
                style={styles.runGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ThemedText style={styles.runText}>🏃 Run</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <ThemedText style={styles.waiting}>
            {opponentName} is attacking...
          </ThemedText>
        )
      ) : (
        /* ── Battle Over ── */
        <View style={styles.battleOver}>
          <ThemedText style={styles.battleOverTitle}>
            {winner === 'player' ? '🏆 Victory!' : '💀 Defeat!'}
          </ThemedText>

          {battleResult && (
            <View style={styles.rewardsList}>
              <RewardRow icon="star" color={colors.tertiary} text={`+${battleResult.xpReward} XP`} />
              <RewardRow icon="cash" color={colors.secondaryContainer} text={`+${battleResult.coinReward} Coins`} />
              {battleResult.petLeveledUp && (
                <View style={styles.levelUpChip}>
                  <Ionicons name="arrow-up-circle" size={16} color={colors.success} />
                  <ThemedText style={styles.levelUpText}>Pet → Lv.{battleResult.petNewLevel}!</ThemedText>
                </View>
              )}
              {battleResult.userLeveledUp && (
                <View style={styles.levelUpChip}>
                  <Ionicons name="ribbon" size={16} color={colors.secondaryContainer} />
                  <ThemedText style={styles.levelUpText}>You → Lv.{battleResult.userNewLevel}!</ThemedText>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity style={styles.continueBtn} onPress={onContinue} activeOpacity={0.8}>
            <LinearGradient
              colors={winner === 'player' ? [colors.success, '#2E7D32'] : [colors.surfaceContainerHighest, colors.surfaceContainerHigh]}
              style={styles.continueGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <ThemedText style={styles.continueText}>Continue</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  </View>
)

const RewardRow = ({ icon, color, text }: { icon: string; color: string; text: string }) => (
  <View style={styles.rewardRow}>
    <Ionicons name={icon as any} size={18} color={color} />
    <ThemedText style={styles.rewardText}>{text}</ThemedText>
  </View>
)

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },

  // ── Log ────────────────────────────────────────
  logBox: {
    backgroundColor: colors.glass.darkFill,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 48,
    justifyContent: 'center',
  },
  logText: {
    fontSize: fontSizes.span,
    fontFamily: fonts.medium,
    color: colors.onSurface,
    lineHeight: 20,
  },

  // ── Action Panel ───────────────────────────────
  actionPanel: {
    backgroundColor: colors.glass.darkFill,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  prompt: {
    fontSize: fontSizes.span,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  movesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  moveBtn: {
    width: '48%',
    marginBottom: spacing.sm,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  moveGradient: { padding: spacing.md, alignItems: 'center', borderRadius: radii.md },
  moveName: { fontSize: fontSizes.span, fontFamily: fonts.bold, color: colors.onPrimary },
  movePP: { fontSize: fontSizes.xs, fontFamily: fonts.regular, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  runBtn: { borderRadius: radii.md, overflow: 'hidden' },
  runGradient: { padding: spacing.md, alignItems: 'center', borderRadius: radii.md },
  runText: { fontSize: fontSizes.span, fontFamily: fonts.bold, color: colors.onSurface },

  waiting: {
    fontSize: fontSizes.span,
    fontFamily: fonts.medium,
    color: colors.onSurface,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },

  // ── Battle Over ────────────────────────────────
  battleOver: { alignItems: 'center' },
  battleOverTitle: {
    fontSize: fontSizes.heading,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.lg,
  },
  rewardsList: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rewardText: { fontSize: fontSizes.body, fontFamily: fonts.semiBold, color: colors.onSurface },
  levelUpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  levelUpText: { fontSize: fontSizes.span, fontFamily: fonts.bold, color: colors.success },

  continueBtn: { borderRadius: radii.md, overflow: 'hidden' },
  continueGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['4xl'],
    alignItems: 'center',
    borderRadius: radii.md,
  },
  continueText: { fontSize: fontSizes.body, fontFamily: fonts.bold, color: colors.onSurface },
})