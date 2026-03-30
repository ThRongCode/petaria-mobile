import React from 'react'
import { StyleSheet, View } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { Panel } from '@/components/ui'
import { Ionicons } from '@expo/vector-icons'
import { Pet } from '@/stores/types/game'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii } from '@/themes/metrics'

interface AboutTabProps {
  pet: Pet
}

export const AboutTab: React.FC<AboutTabProps> = ({ pet }) => (
  <Panel variant="dark" style={styles.tabPanel}>
    <ThemedText style={styles.sectionTitle}>Description</ThemedText>
    <ThemedText style={styles.description}>
      A powerful {pet.species} with incredible abilities. Known for its strength and loyalty in battles.
    </ThemedText>
    
    <View style={styles.infoGrid}>
      <View style={styles.infoItem}>
        <View style={styles.infoLabelRow}><Ionicons name="flash" size={14} color={colors.warning} /><ThemedText style={styles.infoLabel}>Attack</ThemedText></View>
        <ThemedText style={styles.infoValue}>{pet.stats.attack}</ThemedText>
      </View>
      <View style={styles.infoItem}>
        <View style={styles.infoLabelRow}><Ionicons name="shield" size={14} color={colors.info} /><ThemedText style={styles.infoLabel}>Defense</ThemedText></View>
        <ThemedText style={styles.infoValue}>{pet.stats.defense}</ThemedText>
      </View>
      <View style={styles.infoItem}>
        <View style={styles.infoLabelRow}><Ionicons name="speedometer" size={14} color={colors.tertiary} /><ThemedText style={styles.infoLabel}>Speed</ThemedText></View>
        <ThemedText style={styles.infoValue}>{pet.stats.speed}</ThemedText>
      </View>
      <View style={styles.infoItem}>
        <View style={styles.infoLabelRow}><Ionicons name="star" size={14} color={colors.secondaryContainer} /><ThemedText style={styles.infoLabel}>Experience</ThemedText></View>
        <View style={styles.xpProgressContainer}>
          <View style={styles.xpProgressBar}>
            <View 
              style={[
                styles.xpProgressFill, 
                { width: `${(pet.xp / pet.xpToNext) * 100}%` }
              ]} 
            />
          </View>
          <ThemedText style={styles.xpProgressText}>
            {pet.xp} / {pet.xpToNext} XP
          </ThemedText>
        </View>
      </View>
      <View style={styles.infoItem}>
        <View style={styles.infoLabelRow}>
          <Ionicons name="star" size={14} color={colors.secondaryContainer} />
          <ThemedText style={styles.infoLabel}>Rarity</ThemedText>
        </View>
        <ThemedText style={styles.infoValue}>{pet.rarity}</ThemedText>
      </View>
      <View style={styles.infoItem}>
        <View style={styles.infoLabelRow}>
          <Ionicons name="happy" size={14} color={colors.secondaryContainer} />
          <ThemedText style={styles.infoLabel}>Mood</ThemedText>
        </View>
        <ThemedText style={styles.infoValue}>{pet.mood}/100</ThemedText>
      </View>
    </View>
  </Panel>
)

const styles = StyleSheet.create({
  tabPanel: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  infoItem: {
    width: '48%',
    backgroundColor: colors.surfaceContainerHigh,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.xs,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  infoValue: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  xpProgressContainer: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  xpProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 219, 60, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: colors.secondaryContainer,
    borderRadius: 3,
  },
  xpProgressText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.secondaryContainer,
    textAlign: 'right',
  },
})
