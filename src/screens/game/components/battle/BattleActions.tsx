import React from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { ThemedText } from '@/components'
import { Panel } from '@/components/ui'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Move } from '@/stores/types/game'

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
                      colors={selectedMove?.name === move.name ? ['#4CAF50', '#45a049'] : ['#2196F3', '#1976D2']}
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
                  colors={['#EF5350', '#E53935']}
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
                  <Ionicons name="star" size={18} color="#9C27B0" />
                  <ThemedText style={styles.rewardText}>+{battleResult.xpReward} XP</ThemedText>
                </View>
                <View style={styles.rewardRow}>
                  <Ionicons name="cash" size={18} color="#FFD700" />
                  <ThemedText style={styles.rewardText}>+{battleResult.coinReward} Coins</ThemedText>
                </View>
                {battleResult.petLeveledUp && (
                  <View style={styles.levelUpBadge}>
                    <Ionicons name="arrow-up-circle" size={18} color="#4CAF50" />
                    <ThemedText style={styles.levelUpText}>
                      Pet leveled up to Lv.{battleResult.petNewLevel}!
                    </ThemedText>
                  </View>
                )}
                {battleResult.userLeveledUp && (
                  <View style={styles.levelUpBadge}>
                    <Ionicons name="ribbon" size={18} color="#FFD700" />
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
                colors={winner === 'player' ? ['#4CAF50', '#45a049'] : ['#757575', '#616161']}
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  battleLogBox: {
    padding: 12,
    marginBottom: 8,
    minHeight: 50,
    justifyContent: 'center',
  },
  battleLogText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  actionBox: {
    padding: 16,
  },
  actionContent: {
    // Container for action elements
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  movesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  moveButtonContainer: {
    width: '48%',
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  moveButton: {
    padding: 12,
    alignItems: 'center',
  },
  selectedMoveButton: {
    // Selected state handled by gradient colors
  },
  moveButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  movePpText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  runButtonContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  runButton: {
    padding: 12,
    alignItems: 'center',
  },
  runButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  waitingText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
    paddingVertical: 16,
  },
  battleOverBox: {
    alignItems: 'center',
  },
  battleOverTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  continueButtonContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  continueButton: {
    padding: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rewardsSummary: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  levelUpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 4,
  },
  levelUpText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
})
