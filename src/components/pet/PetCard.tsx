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
import { colors, metrics } from '@/themes'

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
    borderRadius: metrics.borderRadiusLarge,
    padding: metrics.medium,
    marginBottom: metrics.medium,
    minHeight: 120,
    position: 'relative',
    overflow: 'hidden',
    // Shadow for elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: metrics.small,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: metrics.small,
  },
  id: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  typesContainer: {
    flexDirection: 'row',
    gap: metrics.tiny,
    flexWrap: 'wrap',
    marginBottom: metrics.small,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
})
