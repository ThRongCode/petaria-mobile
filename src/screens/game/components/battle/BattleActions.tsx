/**
 * BattleActions — "Lapis Glassworks" glass battle controls
 *
 * Battle log box with rich text (damage, effectiveness, move names),
 * 2×2 move grid colored by element type, run button,
 * battle-over result panel with rewards summary.
 */

import React from 'react'
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native'
import { ThemedText } from '@/components'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Move } from '@/stores/types/game'
import { colors, typeColors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'
import { gradientPrimary, gradientGold, gradientError } from '@/themes/styles'

// Darken a hex color for gradient end
function darkenColor(hex: string, amount: number = 0.3): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${Math.floor(r * (1 - amount))}, ${Math.floor(g * (1 - amount))}, ${Math.floor(b * (1 - amount))})`
}

// Get gradient colors for a move's element type
function getMoveGradient(element?: string): [string, string] {
  if (!element) return [...gradientPrimary] as [string, string]
  const base = typeColors[element.toLowerCase()]
  if (!base) return [...gradientPrimary] as [string, string]
  return [base, darkenColor(base, 0.35)]
}

// Render a battle log message with rich text highlighting
function renderLogMessage(msg: string, idx: number) {
  // Damage numbers: "It dealt 42 damage!"
  const damageMatch = msg.match(/^It dealt (\d+) damage!$/)
  if (damageMatch) {
    return (
      <Text key={idx} style={styles.logText}>
        It dealt <Text style={styles.logDamage}>{damageMatch[1]}</Text> damage!
      </Text>
    )
  }

  // Super effective
  if (msg === "It's super effective!") {
    return <Text key={idx} style={[styles.logText, styles.logSuperEffective]}>{msg}</Text>
  }

  // Not very effective
  if (msg === "It's not very effective...") {
    return <Text key={idx} style={[styles.logText, styles.logNotEffective]}>{msg}</Text>
  }

  // Miss
  if (msg === 'But it missed!') {
    return <Text key={idx} style={[styles.logText, styles.logMiss]}>{msg}</Text>
  }

  // Immune
  if (msg.includes("doesn't affect")) {
    return <Text key={idx} style={[styles.logText, styles.logImmune]}>{msg}</Text>
  }

  // Fainted
  if (msg.includes('fainted!')) {
    return <Text key={idx} style={[styles.logText, styles.logFainted]}>{msg}</Text>
  }

  // Move usage: "Name used MoveName!"
  const moveMatch = msg.match(/^(.+) used (.+)!$/)
  if (moveMatch) {
    return (
      <Text key={idx} style={styles.logText}>
        {moveMatch[1]} used <Text style={styles.logMoveName}>{moveMatch[2]}</Text>!
      </Text>
    )
  }

  // Default
  return <ThemedText key={idx} style={styles.logText}>{msg}</ThemedText>
}

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
      {battleLog.slice(-3).map((msg, i) => renderLogMessage(msg, i))}
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
                const typeGrad = getMoveGradient(move.element)
                const elementColor = typeColors[move.element?.toLowerCase() ?? ''] ?? colors.primary
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.moveBtn, isSelected && { borderColor: '#fff', borderWidth: 2 }]}
                    onPress={() => onMoveSelect(move)}
                    disabled={isAnimating}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={typeGrad}
                      style={styles.moveGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <ThemedText style={styles.moveName}>{move.name}</ThemedText>
                      <View style={styles.moveMetaRow}>
                        <View style={[styles.moveTypeBadge, { backgroundColor: 'rgba(0,0,0,0.25)' }]}>
                          <ThemedText style={styles.moveTypeText}>{move.element || 'Normal'}</ThemedText>
                        </View>
                        <ThemedText style={styles.movePower}>
                          {move.power > 0 ? `${move.power} PWR` : 'Status'}
                        </ThemedText>
                      </View>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="exit-outline" size={18} color={colors.onSurface} />
                  <ThemedText style={styles.runText}>Run</ThemedText>
                </View>
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
            {winner === 'player' ? 'Victory!' : 'Defeat!'}
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
    lineHeight: 22,
  },
  logDamage: {
    fontFamily: fonts.extraBold,
    color: '#FF6B6B',
    fontSize: fontSizes.body,
  },
  logSuperEffective: {
    fontFamily: fonts.bold,
    color: '#FFD700',
  },
  logNotEffective: {
    fontFamily: fonts.medium,
    color: '#999',
    fontStyle: 'italic',
  },
  logMiss: {
    fontFamily: fonts.medium,
    color: '#888',
    fontStyle: 'italic',
  },
  logImmune: {
    fontFamily: fonts.medium,
    color: '#735797',
    fontStyle: 'italic',
  },
  logFainted: {
    fontFamily: fonts.bold,
    color: '#FF6B6B',
  },
  logMoveName: {
    fontFamily: fonts.bold,
    color: colors.primary,
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
  moveName: { fontSize: fontSizes.span, fontFamily: fonts.bold, color: '#fff' },
  moveMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  moveTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  moveTypeText: {
    fontSize: 9,
    fontFamily: fonts.bold,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  movePower: { fontSize: 9, fontFamily: fonts.bold, color: 'rgba(255,255,255,0.8)' },

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