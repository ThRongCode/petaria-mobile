import React from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { ThemedText } from '@/components'
import { Panel } from '@/components/ui'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Move } from '@/stores/types/game'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii } from '@/themes/metrics'

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
}) => {
  return (
    <View style={styles.bottomSection}>
      {/* Battle Log - Show last 3 messages */}
      <Panel variant="dark" style={styles.battleLogBox}>
        {battleLog.slice(-3).map((message, index) => (
          <ThemedText key={index} style={styles.battleLogText}>
            {message}
          </ThemedText>
        ))}
      </Panel>
      
      {/* Action Box - Compact */}
      <Panel variant="dark" style={styles.actionBox}>
        {!battleOver ? (
          turn === 'player' ? (
            <View style={styles.actionContent}>
              <ThemedText style={styles.actionTitle}>What will {playerName} do?</ThemedText>
              
              {/* Moves in 2x2 Grid */}
              <View style={styles.movesGrid}>
                {moves.map((move, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.moveButtonContainer,
                      selectedMove?.name === move.name && styles.selectedMoveButton
                    ]}
                    onPress={() => onMoveSelect(move)}
                    disabled={isAnimating}
                  >
                    <LinearGradient
                      colors={selectedMove?.name === move.name ? [colors.success, '#2E7D32'] : [colors.info, '#1565C0']}
                      style={styles.moveButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <ThemedText style={styles.moveButtonText}>{move.name}</ThemedText>
                      <ThemedText style={styles.movePpText}>PP {move.pp}/{move.maxPp}</ThemedText>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Run Button */}
              <TouchableOpacity
                style={styles.runButtonContainer}
                onPress={onRun}
              >
                <LinearGradient
                  colors={[colors.error, '#C62828']}
                  style={styles.runButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ThemedText style={styles.runButtonText}>🏃 Run</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <ThemedText style={styles.waitingText}>
              {opponentName} is attacking...
            </ThemedText>
          )
        ) : (
          <View style={styles.battleOverBox}>
            <ThemedText style={styles.battleOverTitle}>
              {winner === 'player' ? '🏆 Victory!' : '💀 Defeat!'}
            </ThemedText>
            
            {/* Show rewards summary inline */}
            {battleResult && (
              <View style={styles.rewardsSummary}>
                <View style={styles.rewardRow}>
                  <Ionicons name="star" size={18} color={colors.tertiary} />
                  <ThemedText style={styles.rewardText}>+{battleResult.xpReward} XP</ThemedText>
                </View>
                <View style={styles.rewardRow}>
                  <Ionicons name="cash" size={18} color={colors.secondaryContainer} />
                  <ThemedText style={styles.rewardText}>+{battleResult.coinReward} Coins</ThemedText>
                </View>
                {battleResult.petLeveledUp && (
                  <View style={styles.levelUpBadge}>
                    <Ionicons name="arrow-up-circle" size={18} color={colors.success} />
                    <ThemedText style={styles.levelUpText}>
                      Pet leveled up to Lv.{battleResult.petNewLevel}!
                    </ThemedText>
                  </View>
                )}
                {battleResult.userLeveledUp && (
                  <View style={styles.levelUpBadge}>
                    <Ionicons name="ribbon" size={18} color={colors.secondaryContainer} />
                    <ThemedText style={styles.levelUpText}>
                      You leveled up to Lv.{battleResult.userNewLevel}!
                    </ThemedText>
                  </View>
                )}
              </View>
            )}
            
            <TouchableOpacity
              style={styles.continueButtonContainer}
              onPress={onContinue}
            >
              <LinearGradient
                colors={winner === 'player' ? [colors.success, '#2E7D32'] : [colors.surfaceContainerHighest, colors.surfaceContainerHigh]}
                style={styles.continueButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ThemedText style={styles.continueButtonText}>Continue</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </Panel>
    </View>
  )
}

const styles = StyleSheet.create({
  bottomSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  battleLogBox: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 50,
    justifyContent: 'center',
  },
  battleLogText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.onSurface,
  },
  actionBox: {
    padding: spacing.lg,
  },
  actionContent: {
    // Container for action elements
  },
  actionTitle: {
    fontSize: 14,
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
  moveButtonContainer: {
    width: '48%',
    marginBottom: spacing.sm,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  moveButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  selectedMoveButton: {
    // Selected state handled by gradient colors
  },
  moveButtonText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  movePpText: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  runButtonContainer: {
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  runButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  runButtonText: {
    color: colors.onSurface,
    fontSize: 14,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  waitingText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.onSurface,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  battleOverBox: {
    alignItems: 'center',
  },
  battleOverTitle: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.xl,
  },
  continueButtonContainer: {
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  continueButton: {
    padding: spacing.lg,
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  continueButtonText: {
    color: colors.onSurface,
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  rewardsSummary: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rewardText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
  },
  levelUpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    marginTop: spacing.xs,
  },
  levelUpText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.success,
  },
})
