import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native'
import { TopBar, Panel, CustomAlert } from '@/components/ui'
import { ThemedText } from '@/components'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector } from 'react-redux'
import { getUserProfile, getAllPets } from '@/stores/selectors'
import { Ionicons } from '@expo/vector-icons'
import { getPokemonImage } from '@/assets/images'
import { apiClient } from '@/services/api'
import type { Pet, Item } from '@/stores/types/game'

/**
 * ItemUseScreen - Select a Pokemon to use an item on
 */
export const ItemUseScreen: React.FC = () => {
  const router = useRouter()
  const params = useLocalSearchParams()
  const profile = useSelector(getUserProfile)
  const pets = useSelector(getAllPets) as Pet[]
  const [using, setUsing] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertConfig, setAlertConfig] = useState<{
    title: string
    message: string
    buttons: Array<{ text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void }>
  }>({ title: '', message: '', buttons: [] })

  // Parse item from params
  const item: Item | null = params.item ? JSON.parse(params.item as string) : null

  const showCustomAlert = (
    title: string,
    message: string,
    buttons: Array<{ text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void }>
  ) => {
    setAlertConfig({ title, message, buttons })
    setShowAlert(true)
  }

  const handleUsePet = async (pet: Pet) => {
    if (!item) return

    showCustomAlert(
      'Confirm Use',
      `Use ${item.name} on ${pet.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Use Item',
          style: 'default',
          onPress: async () => {
            setUsing(true)
            try {
              const response = await apiClient.useItemOnPet(item.id, pet.id)
              if (response.success && response.data) {
                showCustomAlert(
                  'Success!',
                  response.data.message,
                  [
                    {
                      text: 'OK',
                      onPress: () => router.back(),
                    },
                  ]
                )
              }
            } catch (error: any) {
              showCustomAlert(
                'Error',
                error.message || 'Failed to use item',
                [{ text: 'OK' }]
              )
            } finally {
              setUsing(false)
            }
          },
        },
      ]
    )
  }

  const renderPetCard = ({ item: pet }: { item: Pet }) => {
    return (
      <TouchableOpacity
        style={styles.petCard}
        onPress={() => handleUsePet(pet)}
        disabled={using}
      >
        <Panel variant="dark" style={styles.petPanel}>
          {/* Pet Image */}
          <View style={styles.petImageContainer}>
            <Image
              source={getPokemonImage(pet.species) as any}
              style={styles.petImage}
              resizeMode="contain"
            />
            {/* Level Badge */}
            <View style={styles.levelBadge}>
              <ThemedText style={styles.levelText}>Lv.{pet.level}</ThemedText>
            </View>
          </View>

          {/* Pet Info */}
          <View style={styles.petInfo}>
            <ThemedText style={styles.petName} numberOfLines={1}>
              {pet.name}
            </ThemedText>
            <ThemedText style={styles.petSpecies} numberOfLines={1}>
              {pet.species}
            </ThemedText>

            {/* HP Bar */}
            <View style={styles.hpBarContainer}>
              <ThemedText style={styles.hpLabel}>HP</ThemedText>
              <View style={styles.hpBarOuter}>
                <View
                  style={[
                    styles.hpBarInner,
                    {
                      width: `${(pet.stats.hp / 200) * 100}%`,
                      backgroundColor: pet.stats.hp > 100 ? '#4CAF50' : '#FFA726',
                    },
                  ]}
                />
              </View>
              <ThemedText style={styles.hpValue}>{pet.stats.hp}</ThemedText>
            </View>

            {/* Stats Preview */}
            <View style={styles.statsPreview}>
              <View style={styles.statMini}>
                <Ionicons name="flash" size={12} color="#FFA726" />
                <ThemedText style={styles.statMiniText}>{pet.stats.attack}</ThemedText>
              </View>
              <View style={styles.statMini}>
                <Ionicons name="shield" size={12} color="#2196F3" />
                <ThemedText style={styles.statMiniText}>{pet.stats.defense}</ThemedText>
              </View>
              <View style={styles.statMini}>
                <Ionicons name="speedometer" size={12} color="#9C27B0" />
                <ThemedText style={styles.statMiniText}>{pet.stats.speed}</ThemedText>
              </View>
            </View>
          </View>
        </Panel>
      </TouchableOpacity>
    )
  }

  if (!item) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.errorText}>No item selected</ThemedText>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Background */}
      <ImageBackground
        source={require('@/assets/images/background/mobile_background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.7)']}
          style={styles.gradientOverlay}
        />
      </ImageBackground>

      {/* Content */}
      <View style={styles.content}>
        {/* Top Bar */}
        <TopBar
          username={profile.username}
          coins={profile.currency?.coins || 0}
          gems={profile.currency?.gems || 150}
          pokeballs={profile.currency?.pokeballs || 0}
          energy={80}
          maxEnergy={100}
          battleTickets={profile.battleTickets}
          huntTickets={profile.huntTickets}
          onSettingsPress={() => router.push('/profile')}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFD700" />
          </TouchableOpacity>
          <Panel variant="transparent" style={styles.headerPanel}>
            <View style={styles.headerRow}>
              <Image
                source={{ uri: item.image }}
                style={styles.itemImage}
                resizeMode="contain"
              />
              <View style={styles.headerInfo}>
                <ThemedText style={styles.headerTitle}>{item.name}</ThemedText>
                <ThemedText style={styles.headerSubtitle}>
                  Select a Pokemon to use this item on
                </ThemedText>
              </View>
            </View>
          </Panel>
        </View>

        {/* Pokemon Grid */}
        {using ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <ThemedText style={styles.loadingText}>Using item...</ThemedText>
          </View>
        ) : (
          <FlatList
            data={pets}
            renderItem={renderPetCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Panel variant="dark" style={styles.emptyPanel}>
                  <ThemedText style={styles.emptyIcon}>🎒</ThemedText>
                  <ThemedText style={styles.emptyTitle}>No Pokemon</ThemedText>
                  <ThemedText style={styles.emptyText}>
                    You need Pokemon to use items on!
                  </ThemedText>
                </Panel>
              </View>
            )}
          />
        )}
      </View>

      {/* Alert */}
      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={() => setShowAlert(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backButton: {
    marginBottom: 12,
  },
  headerPanel: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  gridRow: {
    gap: 12,
    paddingHorizontal: 16,
  },
  gridContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  petCard: {
    flex: 1,
    marginBottom: 12,
  },
  petPanel: {
    padding: 12,
  },
  petImageContainer: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  petImage: {
    width: 80,
    height: 80,
  },
  levelBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  petInfo: {
    gap: 4,
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  petSpecies: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  hpBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hpLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    width: 20,
  },
  hpBarOuter: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  hpBarInner: {
    height: '100%',
    borderRadius: 3,
  },
  hpValue: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    width: 30,
    textAlign: 'right',
  },
  statsPreview: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  statMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statMiniText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emptyContainer: {
    padding: 32,
  },
  emptyPanel: {
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
  },
})
