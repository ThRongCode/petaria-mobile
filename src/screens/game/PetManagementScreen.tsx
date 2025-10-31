/**
 * Pet Management Screen (Pets List)
 * 
 * Grid view of user's pet collection with search and filter
 */

import React, { useState, useMemo } from 'react'
import { StyleSheet, FlatList, View, TextInput, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { ThemedText, ScreenContainer, HeaderBase } from '@/components'
import { HEADER_GRADIENTS } from '@/constants/headerGradients'
import { PetCard, Pet, PokemonType } from '@/components/pet'
import { useSelector } from 'react-redux'
import { getOwnedPets } from '@/stores/selectors'
import { colors, metrics } from '@/themes'
import { SvgIcons } from '@/assets/images/gui-icons-components'
import { getPokemonImage } from '@/assets/images'
import { getPokemonTypes } from '@/utilities/pokemonTypes'
import Ionicons from '@expo/vector-icons/Ionicons'

export const PetManagementScreen: React.FC = () => {
  const router = useRouter()
  const ownedPets = useSelector(getOwnedPets)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilter, setShowFilter] = useState(false)

  // Transform Redux pets to Pet component format
  const pets: Pet[] = useMemo(() => {
    return ownedPets.map((pet, index) => ({
      id: pet.id ? parseInt(pet.id) : index + 1,
      name: pet.name,
      types: getPokemonTypes(pet.species),
      sprite: getPokemonImage(pet.species),
      level: pet.level,
      description: pet.species,
      stats: [
        { name: 'HP', value: pet.stats.hp, maxValue: pet.stats.maxHp },
        { name: 'Attack', value: pet.stats.attack, maxValue: 150 },
        { name: 'Defence', value: pet.stats.defense, maxValue: 150 },
        { name: 'Speed', value: pet.stats.speed, maxValue: 150 },
      ],
      moves: [], // TODO: Add moves to Redux state if needed
    }))
  }, [ownedPets])

  // Filter pets based on search query
  const filteredPets = useMemo(() => {
    if (!searchQuery.trim()) return pets
    const query = searchQuery.toLowerCase()
    return pets.filter(pet => 
      pet.name.toLowerCase().includes(query) ||
      pet.description?.toLowerCase().includes(query)
    )
  }, [pets, searchQuery])

  const handlePetPress = (pet: Pet) => {
    // Use type assertion to bypass TypeScript error for dynamic route
    router.push({
      pathname: '/pet-details' as any,
      params: { petData: JSON.stringify(pet) }
    })
  }

  const renderPetCard = ({ item }: { item: Pet }) => (
    <View style={styles.cardWrapper}>
      <PetCard pet={item} onPress={handlePetPress} />
    </View>
  )



  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.emptyText}>
        {searchQuery ? 'No pets found matching your search' : 'No pets in your collection yet'}
      </ThemedText>
      {!searchQuery && (
        <ThemedText style={styles.emptySubtext}>
          Go hunting to catch your first pet!
        </ThemedText>
      )}
    </View>
  )

  return (
    <ScreenContainer style={styles.screenContainer}>
      <HeaderBase title="Pets" gradientColors={HEADER_GRADIENTS.pets}>
        <View style={styles.headerContent}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={20} color={colors.placeholder} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search a pet..."
                placeholderTextColor={colors.placeholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.placeholder} />
                </TouchableOpacity>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilter(!showFilter)}
              activeOpacity={0.7}
            >
              <Ionicons name="filter" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </HeaderBase>

      {/* Pet count */}
      <ThemedText style={styles.petCount}>
        {filteredPets.length} {filteredPets.length === 1 ? 'Pet' : 'Pets'} Found
      </ThemedText>

      <FlatList
        data={filteredPets}
        renderItem={renderPetCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  screenContainer: {
    backgroundColor: '#F8F9FA',
  },
  headerContent: {
    paddingHorizontal: metrics.medium,
  },
  listContent: {
    padding: metrics.medium,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.small,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: metrics.borderRadiusLarge,
    paddingHorizontal: metrics.medium,
    height: 48,
  },
  searchIcon: {
    marginRight: metrics.xxs,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.black,
    paddingVertical: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: metrics.borderRadiusLarge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray,
    marginHorizontal: metrics.medium,
    marginTop: metrics.medium,
    marginBottom: metrics.small,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    flex: 1,
    marginHorizontal: metrics.xxs,
    maxWidth: '48%',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: metrics.huge,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray,
    textAlign: 'center',
    marginBottom: metrics.xxs,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.placeholder,
    textAlign: 'center',
  },
})
