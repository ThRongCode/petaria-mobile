/**
 * PetCard Component
 * 
 * Grid card for displaying pet in list view with sprite, name, ID, and types
 */

import React from 'react'
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { TypeBadge } from './TypeBadge'
import { Pet, formatPetId, getPrimaryTypeColor } from './types'
import { colors, fonts, radii, spacing } from '@/themes'

interface PetCardProps {
  pet: Pet
  onPress: (pet: Pet) => void
}

export const PetCard: React.FC<PetCardProps> = ({ pet, onPress }) => {
  const backgroundColor = getPrimaryTypeColor(pet.types)
  
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor }]}
      onPress={() => onPress(pet)}
      activeOpacity={0.8}
    >
      {/* Header with name and ID */}
      <View style={styles.header}>
        <ThemedText style={styles.name} numberOfLines={1}>
          {pet.name}
        </ThemedText>
        <ThemedText style={styles.id}>
          {formatPetId(pet.id)}
        </ThemedText>
      </View>

      {/* Type badges */}
      <View style={styles.typesContainer}>
        {pet.types.slice(0, 2).map((type) => (
          <TypeBadge key={type} type={type} size="small" />
        ))}
      </View>

      {/* Pokemon sprite */}
      <Image
        source={typeof pet.sprite === 'string' ? { uri: pet.sprite } : pet.sprite}
        style={styles.sprite}
        resizeMode="contain"
      />

      {/* Decorative background pattern */}
      <View style={styles.pattern} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.DEFAULT,
    padding: spacing.lg,
    marginBottom: spacing.md,
    minHeight: 120,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    flex: 1,
    marginRight: spacing.sm,
  },
  id: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  typesContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
    zIndex: 2,
  },
  sprite: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 90,
    height: 90,
    zIndex: 1,
  },
  pattern: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
})
