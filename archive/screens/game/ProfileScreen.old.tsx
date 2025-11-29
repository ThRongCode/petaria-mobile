import React, { useState } from 'react'
import { StyleSheet, View, TouchableOpacity, Image, FlatList, Modal, ScrollView } from 'react-native'
import { ThemedText, ThemedView, ScreenContainer } from '@/components'
import { useSelector } from 'react-redux'
import { 
  getUserProfile, 
  getUserCurrency, 
  getGameStats,
  getPlayerXP,
  getNotifications,
  getUnreadNotifications,
  getOwnedLegendRegions,
  getMyAuctionListings
} from '@/stores/selectors'
import { colors, metrics, fontSizes } from '@/themes'
import { GameNotification, UserProfile } from '@/stores/types/game'
import { useAppDispatch } from '@/stores/store'
import { gameActions } from '@/stores/reducers'
import { ButtonPrimary, ButtonSecondary } from 'rn-base-component'

export const ProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch()
  const profile = useSelector(getUserProfile)
  const currency = useSelector(getUserCurrency)
  const gameStats = useSelector(getGameStats)
  const playerXP = useSelector(getPlayerXP)
  const notifications = useSelector(getNotifications)
  const unreadNotifications = useSelector(getUnreadNotifications)
  const ownedLegendRegions = useSelector(getOwnedLegendRegions)
  const myAuctions = useSelector(getMyAuctionListings)
  
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'settings' | 'notifications'>('stats')
  const [showEditProfile, setShowEditProfile] = useState(false)

  const achievements = [
    { id: 'first_pet', name: 'First Pet', description: 'Caught your first pet', icon: '🐾', unlocked: true },
    { id: 'first_battle_win', name: 'First Victory', description: 'Won your first battle', icon: '⚔️', unlocked: true },
    { id: 'pet_collector_10', name: 'Pet Collector', description: 'Own 10 pets', icon: '🏆', unlocked: true },
    { id: 'hunt_master_100', name: 'Hunt Master', description: 'Complete 100 hunts', icon: '🏹', unlocked: true },
    { id: 'legend_owner', name: 'Legend Owner', description: 'Own a legendary pet', icon: '👑', unlocked: true },
    { id: 'auction_master', name: 'Auction Master', description: 'Sell 50 items in auctions', icon: '💰', unlocked: false },
    { id: 'battle_champion', name: 'Battle Champion', description: 'Win 100 battles', icon: '🥇', unlocked: false },
    { id: 'region_ruler', name: 'Region Ruler', description: 'Own 3 legend regions', icon: '🏰', unlocked: false },
  ]

  const handleNotificationPress = (notification: GameNotification) => {
    if (!notification.read) {
      dispatch(gameActions.markNotificationRead(notification.id))
    }
  }

  const handleClearAllNotifications = () => {
    dispatch(gameActions.clearNotifications())
  }

  const renderStatCard = (title: string, value: string | number, icon: string) => (
    <View style={styles.statCard}>
      <ThemedText style={styles.statIcon}>{icon}</ThemedText>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statTitle}>{title}</ThemedText>
    </View>
  )

  const renderAchievement = ({ item }: { item: typeof achievements[0] }) => (
    <View style={[styles.achievementCard, !item.unlocked && styles.lockedAchievement]}>
      <ThemedText style={styles.achievementIcon}>{item.icon}</ThemedText>
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
          <ThemedText style={styles.unlockedText}>✓</ThemedText>
        </View>
      )}
    </View>
  )

  const renderNotification = ({ item }: { item: GameNotification }) => (
    <TouchableOpacity 
      style={[styles.notificationCard, !item.read && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationHeader}>
        <ThemedText type="defaultSemiBold" style={styles.notificationTitle}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.notificationTime}>
          {new Date(item.timestamp).toLocaleDateString()}
        </ThemedText>
      </View>
      <ThemedText style={styles.notificationMessage}>
        {item.message}
      </ThemedText>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  )

  const SettingsCard = ({ title, value, onPress }: { 
    title: string; 
    value: string; 
    onPress: () => void 
  }) => (
    <TouchableOpacity style={styles.settingCard} onPress={onPress}>
      <ThemedText style={styles.settingTitle}>{title}</ThemedText>
      <View style={styles.settingRight}>
        <ThemedText style={styles.settingValue}>{value}</ThemedText>
        <ThemedText style={styles.settingArrow}>›</ThemedText>
      </View>
    </TouchableOpacity>
  )

  const ProfileModal = () => (
    <Modal visible={showEditProfile} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ThemedText type="title" style={styles.modalTitle}>Edit Profile</ThemedText>
          
          <View style={styles.editSection}>
            <ThemedText type="defaultSemiBold" style={styles.editLabel}>Avatar</ThemedText>
            <Image source={{ uri: profile.avatar }} style={styles.editAvatar} />
          </View>
          
          <View style={styles.editSection}>
            <ThemedText type="defaultSemiBold" style={styles.editLabel}>Username</ThemedText>
            <ThemedText style={styles.editValue}>{profile.username}</ThemedText>
            <ThemedText style={styles.editNote}>
              ⚠️ You can only edit your username once
            </ThemedText>
          </View>
          
          <View style={styles.modalActions}>
            <ButtonSecondary 
              style={styles.modalButton}
              onPress={() => setShowEditProfile(false)}
            >
              Cancel
            </ButtonSecondary>
            <ButtonPrimary 
              style={styles.modalButton}
              onPress={() => setShowEditProfile(false)}
            >
              Save Changes
            </ButtonPrimary>
          </View>
        </View>
      </View>
    </Modal>
  )

  return (
    <ScreenContainer>
      <ThemedView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            <View style={styles.profileInfo}>
              <ThemedText type="title" style={styles.username}>{profile.username}</ThemedText>
              <ThemedText style={styles.email}>{profile.email}</ThemedText>
              <View style={styles.levelContainer}>
                <ThemedText style={styles.levelText}>Level {profile.level}</ThemedText>
                <View style={styles.xpBar}>
                  <View 
                    style={[styles.xpFill, { width: `${playerXP.percentage}%` }]}
                  />
                  <ThemedText style={styles.xpText}>
                    {playerXP.current}/{playerXP.toNext} XP
                  </ThemedText>
                </View>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setShowEditProfile(true)}
            >
              <ThemedText style={styles.editButtonText}>Edit</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Currency Display */}
          <View style={styles.currencyContainer}>
            <View style={styles.currencyCard}>
              <ThemedText style={styles.currencyIcon}>💰</ThemedText>
              <ThemedText style={styles.currencyValue}>{currency.coins.toLocaleString()}</ThemedText>
              <ThemedText style={styles.currencyLabel}>Coins</ThemedText>
            </View>
            <View style={styles.currencyCard}>
              <ThemedText style={styles.currencyIcon}>💎</ThemedText>
              <ThemedText style={styles.currencyValue}>{currency.gems.toLocaleString()}</ThemedText>
              <ThemedText style={styles.currencyLabel}>Gems</ThemedText>
            </View>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            {(['stats', 'achievements', 'settings', 'notifications'] as const).map((tab) => (
              <TouchableOpacity 
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <ThemedText style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'notifications' && unreadNotifications.length > 0 && (
                    <ThemedText style={styles.notificationBadge}>
                      {' '}({unreadNotifications.length})
                    </ThemedText>
                  )}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'stats' && (
              <View style={styles.statsContainer}>
                <View style={styles.statsGrid}>
                  {renderStatCard('Pets Owned', gameStats.totalPets, '🐾')}
                  {renderStatCard('Legendary Pets', gameStats.legendaryPets, '👑')}
                  {renderStatCard('Battles Won', gameStats.battlesWon, '⚔️')}
                  {renderStatCard('Hunts Completed', gameStats.huntsCompleted, '🏹')}
                </View>
                
                <View style={styles.statsSection}>
                  <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                    Legend Regions Owned
                  </ThemedText>
                  {ownedLegendRegions.length > 0 ? (
                    ownedLegendRegions.map((region) => (
                      <View key={region.id} style={styles.regionItem}>
                        <ThemedText style={styles.regionName}>👑 {region.name}</ThemedText>
                        <ThemedText style={styles.regionFee}>
                          +{region.legendFee} coins per hunt
                        </ThemedText>
                      </View>
                    ))
                  ) : (
                    <ThemedText style={styles.emptyText}>
                      No legend regions owned yet
                    </ThemedText>
                  )}
                </View>

                <View style={styles.statsSection}>
                  <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                    Financial Summary
                  </ThemedText>
                  <View style={styles.financialRow}>
                    <ThemedText style={styles.financialLabel}>Total Earnings:</ThemedText>
                    <ThemedText style={styles.financialValue}>
                      {gameStats.totalEarnings.toLocaleString()} coins
                    </ThemedText>
                  </View>
                  <View style={styles.financialRow}>
                    <ThemedText style={styles.financialLabel}>Auctions Sold:</ThemedText>
                    <ThemedText style={styles.financialValue}>
                      {gameStats.auctionsSold}
                    </ThemedText>
                  </View>
                  <View style={styles.financialRow}>
                    <ThemedText style={styles.financialLabel}>Pet Collection Value:</ThemedText>
                    <ThemedText style={styles.financialValue}>
                      ~{gameStats.totalValue.toLocaleString()} coins
                    </ThemedText>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'achievements' && (
              <FlatList
                data={achievements}
                renderItem={renderAchievement}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                style={styles.achievementsList}
              />
            )}

            {activeTab === 'settings' && (
              <View style={styles.settingsContainer}>
                <SettingsCard 
                  title="Notifications"
                  value={profile.settings.notifications ? 'On' : 'Off'}
                  onPress={() => {}}
                />
                <SettingsCard 
                  title="Auto Feed Pets"
                  value={profile.settings.autoFeed ? 'On' : 'Off'}
                  onPress={() => {}}
                />
                <SettingsCard 
                  title="Battle Animations"
                  value={profile.settings.battleAnimations ? 'On' : 'Off'}
                  onPress={() => {}}
                />
                <SettingsCard 
                  title="Account"
                  value="Manage"
                  onPress={() => {}}
                />
                <SettingsCard 
                  title="Privacy"
                  value="Settings"
                  onPress={() => {}}
                />
                <SettingsCard 
                  title="Help & Support"
                  value=""
                  onPress={() => {}}
                />
              </View>
            )}

            {activeTab === 'notifications' && (
              <View style={styles.notificationsContainer}>
                {notifications.length > 0 && (
                  <TouchableOpacity 
                    style={styles.clearAllButton}
                    onPress={handleClearAllNotifications}
                  >
                    <ThemedText style={styles.clearAllText}>Clear All</ThemedText>
                  </TouchableOpacity>
                )}
                
                <FlatList
                  data={notifications}
                  renderItem={renderNotification}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  ListEmptyComponent={
                    <View style={styles.emptyNotifications}>
                      <ThemedText style={styles.emptyText}>No notifications</ThemedText>
                    </View>
                  }
                />
              </View>
            )}
          </View>
        </ScrollView>

        <ProfileModal />
      </ThemedView>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    padding: metrics.medium,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: metrics.medium,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    marginBottom: metrics.tiny,
    color: colors.primary,
  },
  email: {
    color: colors.gray,
    fontSize: fontSizes.span,
    marginBottom: metrics.small,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.small,
  },
  levelText: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.primary,
    minWidth: 60,
  },
  xpBar: {
    flex: 1,
    height: 16,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: metrics.borderRadius,
    justifyContent: 'center',
    position: 'relative',
  },
  xpFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: metrics.borderRadius,
  },
  xpText: {
    fontSize: fontSizes.small,
    textAlign: 'center',
    fontWeight: '500',
    zIndex: 1,
  },
  editButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: metrics.medium,
    paddingVertical: metrics.small,
    borderRadius: metrics.borderRadius,
  },
  editButtonText: {
    color: colors.white,
    fontSize: fontSizes.span,
    fontWeight: '600',
  },
  currencyContainer: {
    flexDirection: 'row',
    padding: metrics.medium,
    gap: metrics.medium,
  },
  currencyCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: metrics.medium,
    borderRadius: metrics.borderRadius,
    alignItems: 'center',
    elevation: 2,
  },
  currencyIcon: {
    fontSize: 32,
    marginBottom: metrics.small,
  },
  currencyValue: {
    fontSize: fontSizes.large,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: metrics.tiny,
  },
  currencyLabel: {
    fontSize: fontSizes.span,
    color: colors.gray,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: metrics.medium,
    borderRadius: metrics.borderRadius,
    padding: metrics.tiny,
  },
  tab: {
    flex: 1,
    paddingVertical: metrics.small,
    alignItems: 'center',
    borderRadius: metrics.borderRadius,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: fontSizes.span,
    color: colors.gray,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.white,
    fontWeight: '600',
  },
  notificationBadge: {
    color: colors.error,
    fontWeight: '700',
  },
  tabContent: {
    padding: metrics.medium,
  },
  statsContainer: {
    gap: metrics.large,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: metrics.medium,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.white,
    padding: metrics.medium,
    borderRadius: metrics.borderRadius,
    alignItems: 'center',
    elevation: 2,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: metrics.small,
  },
  statValue: {
    fontSize: fontSizes.title,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: metrics.tiny,
  },
  statTitle: {
    fontSize: fontSizes.span,
    color: colors.gray,
    textAlign: 'center',
  },
  statsSection: {
    backgroundColor: colors.white,
    padding: metrics.medium,
    borderRadius: metrics.borderRadius,
  },
  sectionTitle: {
    fontSize: fontSizes.large,
    marginBottom: metrics.medium,
    color: colors.primary,
  },
  regionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: metrics.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSecondary,
  },
  regionName: {
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  regionFee: {
    fontSize: fontSizes.span,
    color: colors.success,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: metrics.small,
  },
  financialLabel: {
    fontSize: fontSizes.body,
    color: colors.gray,
  },
  financialValue: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.gray,
    fontStyle: 'italic',
    padding: metrics.large,
  },
  achievementsList: {
    marginTop: metrics.small,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: metrics.medium,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.small,
    alignItems: 'center',
    elevation: 2,
  },
  lockedAchievement: {
    opacity: 0.6,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: metrics.medium,
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
    backgroundColor: colors.success,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedText: {
    color: colors.white,
    fontSize: fontSizes.small,
    fontWeight: '600',
  },
  settingsContainer: {
    gap: metrics.small,
  },
  settingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: metrics.medium,
    borderRadius: metrics.borderRadius,
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: fontSizes.body,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.small,
  },
  settingValue: {
    fontSize: fontSizes.body,
    color: colors.gray,
  },
  settingArrow: {
    fontSize: fontSizes.large,
    color: colors.gray,
  },
  notificationsContainer: {
    gap: metrics.small,
  },
  clearAllButton: {
    alignSelf: 'flex-end',
    paddingVertical: metrics.small,
    paddingHorizontal: metrics.medium,
  },
  clearAllText: {
    color: colors.error,
    fontSize: fontSizes.span,
    fontWeight: '600',
  },
  notificationCard: {
    backgroundColor: colors.white,
    padding: metrics.medium,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.small,
    position: 'relative',
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: metrics.small,
  },
  notificationTitle: {
    fontSize: fontSizes.body,
    flex: 1,
  },
  notificationTime: {
    fontSize: fontSizes.small,
    color: colors.gray,
  },
  notificationMessage: {
    fontSize: fontSizes.span,
    color: colors.gray,
    lineHeight: 18,
  },
  unreadDot: {
    position: 'absolute',
    top: metrics.medium,
    right: metrics.medium,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  emptyNotifications: {
    padding: metrics.huge,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.white,
    borderRadius: metrics.borderRadiusLarge,
    padding: metrics.large,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: metrics.large,
    color: colors.primary,
  },
  editSection: {
    marginBottom: metrics.large,
  },
  editLabel: {
    fontSize: fontSizes.body,
    marginBottom: metrics.small,
    color: colors.primary,
  },
  editAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
  },
  editValue: {
    fontSize: fontSizes.large,
    marginBottom: metrics.small,
  },
  editNote: {
    fontSize: fontSizes.small,
    color: colors.warning,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    gap: metrics.medium,
  },
  modalButton: {
    flex: 1,
  },
})
