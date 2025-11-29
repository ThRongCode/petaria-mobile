import React, { useState } from 'react'
import { StyleSheet, View, TouchableOpacity, Image, FlatList, ScrollView } from 'react-native'
import { ThemedText, ThemedView, ScreenContainer } from '@/components'
import { 
  GameCard, 
  PokemonSprite, 
  StatBar, 
  LevelBadge,
  CurrencyDisplay,
  IconButton,
  RARITY_COLORS 
} from '@/components/GameUI'
import { SvgIcons } from '@/assets/images/gui-icons-components'
import { useSelector } from 'react-redux'
import { 
  getUserProfile, 
  getUserCurrency, 
  getGameStats,
  getPlayerXP,
  getOwnedPets,
} from '@/stores/selectors'
import { colors, metrics, fontSizes } from '@/themes'
import { useAppDispatch } from '@/stores/store'
import { gameActions } from '@/stores/reducers'
import { getPokemonImage } from '@/assets/images'
import { Pet } from '@/stores/types/game'

export const ProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch()
  const profile = useSelector(getUserProfile)
  const currency = useSelector(getUserCurrency)
  const gameStats = useSelector(getGameStats)
  const playerXP = useSelector(getPlayerXP)
  const ownedPets = useSelector(getOwnedPets)
  
  const [activeTab, setActiveTab] = useState<'stats' | 'pets' | 'achievements'>('stats')

  const achievements = [
    { 
      id: 1, 
      name: 'First Catch', 
      description: 'Catch your first pet', 
      unlocked: true, 
      icon: 'StarsStack'
    },
    { 
      id: 2, 
      name: 'Battle Master', 
      description: 'Win 10 battles', 
      unlocked: false, 
      icon: 'AttackGauge'
    },
    { 
      id: 3, 
      name: 'Legendary Hunter', 
      description: 'Catch a legendary pet', 
      unlocked: false, 
      icon: 'Interdiction'
    },
  ];

  const renderPetThumbnail = ({ item: pet }: { item: Pet }) => {
    const petImage = getPokemonImage(pet.species)
    
    return (
      <TouchableOpacity style={styles.petThumbnail}>
        <View style={[styles.petThumbnailBorder, { borderColor: RARITY_COLORS[pet.rarity] }]}>
          <Image source={petImage} style={styles.petThumbnailImage} />
          <LevelBadge level={pet.level} style={styles.petThumbnailLevel} />
        </View>
      </TouchableOpacity>
    )
  }

  const renderAchievement = ({ item }: { item: typeof achievements[number] }) => {
    const IconComponent = SvgIcons[item.icon as keyof typeof SvgIcons]
    
    return (
      <GameCard style={styles.achievementCard}>
        <View style={[styles.achievementContent, !item.unlocked && styles.lockedAchievement]}>
          <View style={styles.achievementIcon}>
            <IconComponent 
              width={40}
              height={40}
              color={item.unlocked ? colors.primary : colors.gray} 
            />
          </View>
          <View style={styles.achievementInfo}>
            <ThemedText 
              type="defaultSemiBold" 
              style={[styles.achievementName, !item.unlocked && styles.lockedText]}
            >
              {item.name}
            </ThemedText>
            <ThemedText 
              style={[styles.achievementDescription, !item.unlocked && styles.lockedText]}
            >
              {item.description}
            </ThemedText>
          </View>
          {item.unlocked && (
            <View style={styles.unlockedBadge}>
              <SvgIcons.CheckMark width={16} height={16} color={colors.white} />
            </View>
          )}
        </View>
      </GameCard>
    )
  }

  const renderStatItem = (label: string, value: string | number, iconName: keyof typeof SvgIcons) => {
    const IconComponent = SvgIcons[iconName]
    
    return (
      <View style={styles.statItem}>
        <View style={styles.statIconContainer}>
          <IconComponent width={24} height={24} color={colors.primary} />
        </View>
        <ThemedText style={styles.statValue}>{value}</ThemedText>
        <ThemedText style={styles.statLabel}>{label}</ThemedText>
      </View>
    )
  }

  return (
    <ScreenContainer>
      <ThemedView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Header Card */}
          <GameCard style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Image source={{ uri: profile.avatar }} style={styles.avatar} />
                <LevelBadge level={profile.level} style={styles.profileLevelBadge} />
              </View>
              
              <View style={styles.profileInfo}>
                <ThemedText type="title" style={styles.username}>
                  {profile.username}
                </ThemedText>
                <ThemedText style={styles.email}>{profile.email}</ThemedText>
                
                <StatBar 
                  label="XP"
                  current={playerXP.current}
                  max={playerXP.toNext}
                  color={colors.primary}
                  style={styles.xpBar}
                />
              </View>
              
              <IconButton
                icon="Pencil"
                onPress={() => {}}
                style={styles.editButton}
                size={36}
              />
            </View>

            {/* Currency Display */}
            <View style={styles.currencySection}>
              <CurrencyDisplay coins={currency.coins} gems={currency.gems} />
            </View>
          </GameCard>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
              onPress={() => setActiveTab('stats')}
            >
              <SvgIcons.Chart 
                width={20}
                height={20}
                color={activeTab === 'stats' ? colors.white : colors.gray} 
              />
              <ThemedText style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
                Stats
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'pets' && styles.activeTab]}
              onPress={() => setActiveTab('pets')}
            >
              <SvgIcons.StarsStack 
                width={20}
                height={20}
                color={activeTab === 'pets' ? colors.white : colors.gray} 
              />
              <ThemedText style={[styles.tabText, activeTab === 'pets' && styles.activeTabText]}>
                Pets
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'achievements' && styles.activeTab]}
              onPress={() => setActiveTab('achievements')}
            >
              <SvgIcons.Checklist 
                width={20}
                height={20}
                color={activeTab === 'achievements' ? colors.white : colors.gray} 
              />
              <ThemedText style={[styles.tabText, activeTab === 'achievements' && styles.activeTabText]}>
                Achievements
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'stats' && (
            <GameCard style={styles.contentCard}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Game Statistics</ThemedText>
              <View style={styles.statsGrid}>
                {renderStatItem('Pets Owned', gameStats.totalPets, 'StarsStack')}
                {renderStatItem('Legendary', gameStats.legendaryPets, 'Stack')}
                {renderStatItem('Battles Won', gameStats.battlesWon, 'AttackGauge')}
                {renderStatItem('Hunts', gameStats.huntsCompleted, 'PositionMarker')}
                {renderStatItem('Auctions', gameStats.auctionsSold, 'ShoppingCart')}
                {renderStatItem('Total Value', `${gameStats.totalValue}💰`, 'Wallet')}
              </View>
              
              <View style={styles.earningsSection}>
                <SvgIcons.Wallet width={32} height={32} color={colors.warning} />
                <View style={styles.earningsInfo}>
                  <ThemedText style={styles.earningsLabel}>Total Earnings</ThemedText>
                  <ThemedText type="title" style={styles.earningsValue}>
                    {gameStats.totalEarnings.toLocaleString()} 💰
                  </ThemedText>
                </View>
              </View>
            </GameCard>
          )}

          {activeTab === 'pets' && (
            <GameCard style={styles.contentCard}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Pet Collection ({ownedPets.length})
              </ThemedText>
              <FlatList
                data={ownedPets}
                renderItem={renderPetThumbnail}
                keyExtractor={(item) => item.id}
                numColumns={4}
                scrollEnabled={false}
                columnWrapperStyle={styles.petGrid}
                contentContainerStyle={styles.petGridContent}
              />
            </GameCard>
          )}

          {activeTab === 'achievements' && (
            <View style={styles.achievementsContainer}>
              <FlatList
                data={achievements}
                renderItem={renderAchievement}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                contentContainerStyle={styles.achievementsList}
              />
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: metrics.medium,
  },
  profileCard: {
    marginBottom: metrics.medium,
    padding: metrics.large,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: metrics.medium,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: metrics.medium,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  profileLevelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    color: colors.primary,
    marginBottom: metrics.tiny,
  },
  email: {
    fontSize: fontSizes.span,
    color: colors.gray,
    marginBottom: metrics.small,
  },
  xpBar: {
    marginTop: metrics.small,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  currencySection: {
    paddingTop: metrics.medium,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundSecondary,
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: metrics.borderRadius,
    padding: metrics.tiny,
    marginBottom: metrics.medium,
    elevation: 2,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: metrics.small,
    borderRadius: metrics.borderRadius,
    gap: metrics.tiny,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: fontSizes.span,
    color: colors.gray,
  },
  activeTabText: {
    color: colors.white,
    fontWeight: '600',
  },
  contentCard: {
    padding: metrics.large,
    marginBottom: metrics.medium,
  },
  sectionTitle: {
    color: colors.primary,
    marginBottom: metrics.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: metrics.medium,
    marginBottom: metrics.large,
  },
  statItem: {
    width: '30%',
    alignItems: 'center',
    padding: metrics.small,
    backgroundColor: colors.backgroundPrimary,
    borderRadius: metrics.borderRadius,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: metrics.small,
  },
  statValue: {
    fontSize: fontSizes.large,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: metrics.tiny,
  },
  statLabel: {
    fontSize: fontSizes.small,
    color: colors.gray,
    textAlign: 'center',
  },
  earningsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: metrics.medium,
    backgroundColor: colors.backgroundPrimary,
    borderRadius: metrics.borderRadius,
    gap: metrics.medium,
  },
  earningsInfo: {
    flex: 1,
  },
  earningsLabel: {
    fontSize: fontSizes.span,
    color: colors.gray,
    marginBottom: metrics.tiny,
  },
  earningsValue: {
    color: colors.warning,
  },
  petGrid: {
    gap: metrics.small,
    marginBottom: metrics.small,
  },
  petGridContent: {
    paddingBottom: metrics.small,
  },
  petThumbnail: {
    width: '23%',
    aspectRatio: 1,
  },
  petThumbnailBorder: {
    flex: 1,
    borderRadius: metrics.borderRadius,
    borderWidth: 2,
    padding: metrics.tiny,
    backgroundColor: colors.white,
  },
  petThumbnailImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
  petThumbnailLevel: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    transform: [{ scale: 0.7 }],
  },
  achievementsContainer: {
    marginBottom: metrics.medium,
  },
  achievementsList: {
    gap: metrics.small,
  },
  achievementCard: {
    marginBottom: 0,
  },
  lockedAchievement: {
    opacity: 0.5,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: metrics.medium,
    gap: metrics.medium,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.backgroundPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: fontSizes.body,
    marginBottom: metrics.tiny,
  },
  achievementDescription: {
    fontSize: fontSizes.span,
    color: colors.gray,
  },
  lockedText: {
    color: colors.gray,
  },
  unlockedBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
