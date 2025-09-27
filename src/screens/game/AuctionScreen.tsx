import React, { useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, Image, FlatList, Modal, TextInput, Alert } from 'react-native'
import { ThemedText, ThemedView, ScreenContainer } from '@/components'
import { useSelector } from 'react-redux'
import { 
  getActiveAuctions, 
  getMyAuctionListings, 
  getMyActiveBids,
  getAuctionsByCategory,
  getEndingSoonAuctions,
  getUserCurrency,
  getOwnedPets,
  getOwnedItems,
  getUserProfile,
  getAllPets,
  getAllItems
} from '@/stores/selectors'
import { colors, metrics, fontSizes } from '@/themes'
import { Auction, Pet, Item } from '@/stores/types/game'
import { useAppDispatch } from '@/stores/store'
import { gameActions } from '@/stores/reducers'
import { ButtonPrimary, ButtonSecondary } from 'rn-base-component'

type AuctionTab = 'browse' | 'my_listings' | 'my_bids' | 'create'
type BrowseFilter = 'all' | 'pets' | 'items' | 'ending_soon'

export const AuctionScreen: React.FC = () => {
  const dispatch = useAppDispatch()
  const activeAuctions = useSelector(getActiveAuctions)
  const myListings = useSelector(getMyAuctionListings)
  const myBids = useSelector(getMyActiveBids)
  const auctionsByCategory = useSelector(getAuctionsByCategory)
  const endingSoonAuctions = useSelector(getEndingSoonAuctions)
  const currency = useSelector(getUserCurrency)
  const ownedPets = useSelector(getOwnedPets)
  const ownedItems = useSelector(getOwnedItems)
  const profile = useSelector(getUserProfile)
  const allPets = useSelector(getAllPets)
  const allItems = useSelector(getAllItems)
  
  const [activeTab, setActiveTab] = useState<AuctionTab>('browse')
  const [browseFilter, setBrowseFilter] = useState<BrowseFilter>('all')
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null)
  const [showAuctionDetails, setShowAuctionDetails] = useState(false)
  const [showCreateAuction, setShowCreateAuction] = useState(false)
  const [bidAmount, setBidAmount] = useState('')
  const [auctionTimers, setAuctionTimers] = useState<{ [key: string]: string }>({})
  
  // Create auction form state
  const [createItemType, setCreateItemType] = useState<'pet' | 'item'>('pet')
  const [selectedItemId, setSelectedItemId] = useState('')
  const [startingBid, setStartingBid] = useState('')
  const [buyoutPrice, setBuyoutPrice] = useState('')
  const [auctionDuration, setAuctionDuration] = useState('24') // hours

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const timers: { [key: string]: string } = {}
      
      activeAuctions.forEach(auction => {
        const timeLeft = auction.endTime - now
        if (timeLeft > 0) {
          const hours = Math.floor(timeLeft / (1000 * 60 * 60))
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
          timers[auction.id] = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
        } else {
          timers[auction.id] = 'Ended'
        }
      })
      
      setAuctionTimers(timers)
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [activeAuctions])

  const getDisplayData = () => {
    switch (activeTab) {
      case 'browse':
        switch (browseFilter) {
          case 'pets': return auctionsByCategory.pets
          case 'items': return auctionsByCategory.items
          case 'ending_soon': return endingSoonAuctions
          default: return activeAuctions
        }
      case 'my_listings': return myListings
      case 'my_bids': return myBids
      default: return []
    }
  }

  const getItemDetails = (auction: Auction) => {
    if (auction.itemType === 'pet') {
      return allPets.find(pet => pet.id === auction.itemId)
    } else {
      return allItems.find(item => item.id === auction.itemId)
    }
  }

  const handleBid = (auction: Auction) => {
    const bid = parseInt(bidAmount)
    if (!bid || bid <= auction.currentBid) {
      Alert.alert('Invalid Bid', 'Bid must be higher than current bid')
      return
    }
    
    if (bid > currency.coins) {
      Alert.alert('Insufficient Funds', 'You don\'t have enough coins')
      return
    }

    dispatch(gameActions.bidOnAuction({
      auctionId: auction.id,
      bidAmount: bid,
      bidderId: profile.id,
      bidderUsername: profile.username
    }))

    setBidAmount('')
    setShowAuctionDetails(false)
    
    Alert.alert('Bid Placed!', `Your bid of ${bid} coins has been placed`)
  }

  const handleBuyout = (auction: Auction) => {
    if (!auction.buyoutPrice || auction.buyoutPrice > currency.coins) {
      Alert.alert('Insufficient Funds', 'You don\'t have enough coins')
      return
    }

    dispatch(gameActions.bidOnAuction({
      auctionId: auction.id,
      bidAmount: auction.buyoutPrice,
      bidderId: profile.id,
      bidderUsername: profile.username
    }))

    // Immediately complete auction at buyout price
    dispatch(gameActions.completeAuction({
      auctionId: auction.id,
      winnerId: profile.id
    }))

    setShowAuctionDetails(false)
    
    Alert.alert('Item Purchased!', `You bought the item for ${auction.buyoutPrice} coins`)
  }

  const handleCreateAuction = () => {
    const startBid = parseInt(startingBid)
    const buyout = buyoutPrice ? parseInt(buyoutPrice) : undefined
    const duration = parseInt(auctionDuration)
    
    if (!selectedItemId || !startBid || startBid <= 0) {
      Alert.alert('Invalid Input', 'Please fill in all required fields')
      return
    }

    const itemDetails = createItemType === 'pet' 
      ? ownedPets.find(pet => pet.id === selectedItemId)
      : ownedItems.find(item => item.id === selectedItemId)

    if (!itemDetails) {
      Alert.alert('Error', 'Selected item not found')
      return
    }

    const newAuction: Auction = {
      id: 'auction-' + Date.now(),
      sellerId: profile.id,
      sellerUsername: profile.username,
      itemType: createItemType,
      itemId: selectedItemId,
      startingBid: startBid,
      buyoutPrice: buyout,
      currentBid: startBid,
      endTime: Date.now() + (duration * 60 * 60 * 1000), // Convert hours to ms
      status: 'active',
      bids: [],
      commission: 0.05, // 5% commission
      createdAt: Date.now()
    }

    dispatch(gameActions.createAuction(newAuction))
    
    // Reset form
    setSelectedItemId('')
    setStartingBid('')
    setBuyoutPrice('')
    setAuctionDuration('24')
    setShowCreateAuction(false)
    
    Alert.alert('Auction Created!', 'Your item has been listed for auction')
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return colors.gray
      case 'Rare': return colors.info
      case 'Epic': return colors.warning
      case 'Legendary': return colors.error
      default: return colors.gray
    }
  }

  const renderAuctionCard = ({ item: auction }: { item: Auction }) => {
    const itemDetails = getItemDetails(auction)
    const isMyAuction = auction.sellerId === profile.id
    const isMyBid = auction.currentBidderId === profile.id
    
    return (
      <TouchableOpacity 
        style={[
          styles.auctionCard,
          isMyBid && styles.myBidCard,
          isMyAuction && styles.myAuctionCard
        ]}
        onPress={() => {
          setSelectedAuction(auction)
          setShowAuctionDetails(true)
        }}
      >
        <Image 
          source={{ uri: itemDetails?.image || 'https://via.placeholder.com/80' }} 
          style={styles.auctionImage} 
        />
        <View style={styles.auctionInfo}>
          <ThemedText type="defaultSemiBold" style={styles.auctionTitle}>
            {itemDetails?.name || 'Unknown Item'}
          </ThemedText>
          <ThemedText style={styles.auctionSeller}>
            by {auction.sellerUsername}
          </ThemedText>
          
          <View style={styles.auctionStats}>
            <View style={styles.bidInfo}>
              <ThemedText style={styles.currentBidLabel}>Current Bid:</ThemedText>
              <ThemedText style={styles.currentBidValue}>
                💰 {auction.currentBid.toLocaleString()}
              </ThemedText>
            </View>
            
            {auction.buyoutPrice && (
              <View style={styles.buyoutInfo}>
                <ThemedText style={styles.buyoutLabel}>Buyout:</ThemedText>
                <ThemedText style={styles.buyoutValue}>
                  💰 {auction.buyoutPrice.toLocaleString()}
                </ThemedText>
              </View>
            )}
          </View>
          
          <View style={styles.auctionFooter}>
            <ThemedText style={styles.timeLeft}>
              ⏰ {auctionTimers[auction.id] || 'Calculating...'}
            </ThemedText>
            <View style={styles.bidCount}>
              <ThemedText style={styles.bidCountText}>
                {auction.bids.length} bids
              </ThemedText>
            </View>
          </View>
          
          {isMyBid && (
            <View style={styles.statusBadge}>
              <ThemedText style={styles.statusText}>Your Bid</ThemedText>
            </View>
          )}
          
          {isMyAuction && (
            <View style={[styles.statusBadge, styles.myAuctionBadge]}>
              <ThemedText style={styles.statusText}>Your Auction</ThemedText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  const renderCreateableItem = ({ item }: { item: Pet | (Item & { quantity: number }) }) => (
    <TouchableOpacity 
      style={[
        styles.selectableItem,
        selectedItemId === item.id && styles.selectedItem
      ]}
      onPress={() => setSelectedItemId(item.id)}
    >
      <Image source={{ uri: item.image }} style={styles.selectableItemImage} />
      <View style={styles.selectableItemInfo}>
        <ThemedText style={styles.selectableItemName}>{item.name}</ThemedText>
        {'species' in item ? (
          <ThemedText style={styles.selectableItemDetail}>
            {item.species} • Level {item.level}
          </ThemedText>
        ) : (
          <ThemedText style={styles.selectableItemDetail}>
            Quantity: {'quantity' in item ? item.quantity : 1}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  )

  const AuctionDetailsModal = () => (
    <Modal visible={showAuctionDetails} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {selectedAuction && (
            <>
              {(() => {
                const itemDetails = getItemDetails(selectedAuction)
                return (
                  <>
                    <Image 
                      source={{ uri: itemDetails?.image }} 
                      style={styles.modalItemImage} 
                    />
                    <ThemedText type="title" style={styles.modalItemName}>
                      {itemDetails?.name}
                    </ThemedText>
                    
                    {'species' in itemDetails! ? (
                      <View style={styles.petDetails}>
                        <ThemedText style={styles.petSpecies}>
                          {(itemDetails as Pet).species} • Level {(itemDetails as Pet).level}
                        </ThemedText>
                        <View style={styles.petStatsRow}>
                          <ThemedText style={styles.petStat}>
                            HP: {(itemDetails as Pet).stats.hp}/{(itemDetails as Pet).stats.maxHp}
                          </ThemedText>
                          <ThemedText style={styles.petStat}>
                            ATK: {(itemDetails as Pet).stats.attack}
                          </ThemedText>
                          <ThemedText style={styles.petStat}>
                            DEF: {(itemDetails as Pet).stats.defense}
                          </ThemedText>
                        </View>
                      </View>
                    ) : (
                      <ThemedText style={styles.itemDescription}>
                        {(itemDetails as Item).description}
                      </ThemedText>
                    )}
                    
                    <View style={styles.auctionDetails}>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Current Bid:</ThemedText>
                        <ThemedText style={styles.detailValue}>
                          💰 {selectedAuction.currentBid.toLocaleString()}
                        </ThemedText>
                      </View>
                      
                      {selectedAuction.buyoutPrice && (
                        <View style={styles.detailRow}>
                          <ThemedText style={styles.detailLabel}>Buyout Price:</ThemedText>
                          <ThemedText style={styles.detailValue}>
                            💰 {selectedAuction.buyoutPrice.toLocaleString()}
                          </ThemedText>
                        </View>
                      )}
                      
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Time Left:</ThemedText>
                        <ThemedText style={styles.detailValue}>
                          {auctionTimers[selectedAuction.id]}
                        </ThemedText>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Seller:</ThemedText>
                        <ThemedText style={styles.detailValue}>
                          {selectedAuction.sellerUsername}
                        </ThemedText>
                      </View>
                    </View>
                    
                    {selectedAuction.sellerId !== profile.id && (
                      <View style={styles.bidSection}>
                        <TextInput
                          style={styles.bidInput}
                          placeholder={`Min bid: ${selectedAuction.currentBid + 1}`}
                          value={bidAmount}
                          onChangeText={setBidAmount}
                          keyboardType="numeric"
                        />
                        <View style={styles.bidActions}>
                          <ButtonSecondary 
                            style={styles.bidButton}
                            onPress={() => handleBid(selectedAuction)}
                            disabled={!bidAmount || parseInt(bidAmount) <= selectedAuction.currentBid}
                          >
                            Place Bid
                          </ButtonSecondary>
                          
                          {selectedAuction.buyoutPrice && (
                            <ButtonPrimary 
                              style={styles.buyoutButton}
                              onPress={() => handleBuyout(selectedAuction)}
                            >
                              Buy Now
                            </ButtonPrimary>
                          )}
                        </View>
                      </View>
                    )}
                    
                    <ButtonSecondary onPress={() => setShowAuctionDetails(false)}>
                      Close
                    </ButtonSecondary>
                  </>
                )
              })()}
            </>
          )}
        </View>
      </View>
    </Modal>
  )

  const CreateAuctionModal = () => (
    <Modal visible={showCreateAuction} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ThemedText type="title" style={styles.modalTitle}>Create Auction</ThemedText>
          
          <View style={styles.createSection}>
            <ThemedText type="defaultSemiBold" style={styles.createLabel}>Item Type</ThemedText>
            <View style={styles.typeSelector}>
              <TouchableOpacity 
                style={[styles.typeButton, createItemType === 'pet' && styles.activeTypeButton]}
                onPress={() => setCreateItemType('pet')}
              >
                <ThemedText style={[styles.typeButtonText, createItemType === 'pet' && styles.activeTypeButtonText]}>
                  Pets
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeButton, createItemType === 'item' && styles.activeTypeButton]}
                onPress={() => setCreateItemType('item')}
              >
                <ThemedText style={[styles.typeButtonText, createItemType === 'item' && styles.activeTypeButtonText]}>
                  Items
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.createSection}>
            <ThemedText type="defaultSemiBold" style={styles.createLabel}>Select Item</ThemedText>
            <FlatList
              data={createItemType === 'pet' ? ownedPets.filter(pet => !pet.isForSale) : ownedItems}
              renderItem={renderCreateableItem}
              keyExtractor={(item) => item.id}
              style={styles.itemSelector}
              maxHeight={150}
            />
          </View>
          
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <ThemedText style={styles.fieldLabel}>Starting Bid (Coins)</ThemedText>
              <TextInput
                style={styles.textInput}
                value={startingBid}
                onChangeText={setStartingBid}
                keyboardType="numeric"
                placeholder="100"
              />
            </View>
            <View style={styles.formField}>
              <ThemedText style={styles.fieldLabel}>Buyout Price (Optional)</ThemedText>
              <TextInput
                style={styles.textInput}
                value={buyoutPrice}
                onChangeText={setBuyoutPrice}
                keyboardType="numeric"
                placeholder="1000"
              />
            </View>
          </View>
          
          <View style={styles.createSection}>
            <ThemedText style={styles.fieldLabel}>Duration (Hours)</ThemedText>
            <View style={styles.durationSelector}>
              {['6', '12', '24', '48'].map((hours) => (
                <TouchableOpacity
                  key={hours}
                  style={[
                    styles.durationButton,
                    auctionDuration === hours && styles.activeDurationButton
                  ]}
                  onPress={() => setAuctionDuration(hours)}
                >
                  <ThemedText style={[
                    styles.durationButtonText,
                    auctionDuration === hours && styles.activeDurationButtonText
                  ]}>
                    {hours}h
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.modalActions}>
            <ButtonSecondary 
              style={styles.modalButton}
              onPress={() => setShowCreateAuction(false)}
            >
              Cancel
            </ButtonSecondary>
            <ButtonPrimary 
              style={styles.modalButton}
              onPress={handleCreateAuction}
              disabled={!selectedItemId || !startingBid}
            >
              Create Auction
            </ButtonPrimary>
          </View>
        </View>
      </View>
    </Modal>
  )

  return (
    <ScreenContainer>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Auction House</ThemedText>
          <View style={styles.currencyContainer}>
            <ThemedText style={styles.currency}>💰 {currency.coins.toLocaleString()}</ThemedText>
            <ThemedText style={styles.currency}>💎 {currency.gems.toLocaleString()}</ThemedText>
          </View>
        </View>

        {/* Main Tab Navigation */}
        <View style={styles.mainTabContainer}>
          <TouchableOpacity 
            style={[styles.mainTab, activeTab === 'browse' && styles.activeMainTab]}
            onPress={() => setActiveTab('browse')}
          >
            <ThemedText style={[styles.mainTabText, activeTab === 'browse' && styles.activeMainTabText]}>
              Browse
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.mainTab, activeTab === 'my_listings' && styles.activeMainTab]}
            onPress={() => setActiveTab('my_listings')}
          >
            <ThemedText style={[styles.mainTabText, activeTab === 'my_listings' && styles.activeMainTabText]}>
              My Listings ({myListings.length})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.mainTab, activeTab === 'my_bids' && styles.activeMainTab]}
            onPress={() => setActiveTab('my_bids')}
          >
            <ThemedText style={[styles.mainTabText, activeTab === 'my_bids' && styles.activeMainTabText]}>
              My Bids ({myBids.length})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.mainTab, activeTab === 'create' && styles.activeMainTab]}
            onPress={() => setShowCreateAuction(true)}
          >
            <ThemedText style={[styles.mainTabText, activeTab === 'create' && styles.activeMainTabText]}>
              + Create
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Browse Filters */}
        {activeTab === 'browse' && (
          <View style={styles.filterContainer}>
            {(['all', 'pets', 'items', 'ending_soon'] as const).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterButton, browseFilter === filter && styles.activeFilterButton]}
                onPress={() => setBrowseFilter(filter)}
              >
                <ThemedText style={[
                  styles.filterButtonText,
                  browseFilter === filter && styles.activeFilterButtonText
                ]}>
                  {filter === 'ending_soon' ? 'Ending Soon' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Auction List */}
        <FlatList
          data={getDisplayData()}
          renderItem={renderAuctionCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.auctionsList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>
                {activeTab === 'browse' ? 'No auctions available' : 
                 activeTab === 'my_listings' ? 'You have no active listings' :
                 'You have no active bids'}
              </ThemedText>
            </View>
          }
        />

        <AuctionDetailsModal />
        <CreateAuctionModal />
      </ThemedView>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: metrics.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: metrics.large,
  },
  title: {
    color: colors.primary,
  },
  currencyContainer: {
    flexDirection: 'row',
    gap: metrics.small,
  },
  currency: {
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  mainTabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: metrics.borderRadius,
    padding: metrics.tiny,
    marginBottom: metrics.medium,
  },
  mainTab: {
    flex: 1,
    paddingVertical: metrics.small,
    alignItems: 'center',
    borderRadius: metrics.borderRadius,
  },
  activeMainTab: {
    backgroundColor: colors.primary,
  },
  mainTabText: {
    fontSize: fontSizes.span,
    color: colors.gray,
    fontWeight: '500',
  },
  activeMainTabText: {
    color: colors.white,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: metrics.small,
    marginBottom: metrics.medium,
  },
  filterButton: {
    paddingHorizontal: metrics.medium,
    paddingVertical: metrics.small,
    borderRadius: metrics.borderRadius,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: fontSizes.span,
    color: colors.primary,
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: colors.white,
  },
  auctionsList: {
    paddingBottom: metrics.huge,
  },
  auctionCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: metrics.borderRadius,
    padding: metrics.medium,
    marginBottom: metrics.medium,
    elevation: 2,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  myBidCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  myAuctionCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  auctionImage: {
    width: 80,
    height: 80,
    borderRadius: metrics.borderRadius,
  },
  auctionInfo: {
    flex: 1,
    marginLeft: metrics.medium,
  },
  auctionTitle: {
    fontSize: fontSizes.body,
    marginBottom: metrics.tiny,
  },
  auctionSeller: {
    fontSize: fontSizes.span,
    color: colors.gray,
    marginBottom: metrics.small,
  },
  auctionStats: {
    marginBottom: metrics.small,
  },
  bidInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: metrics.tiny,
  },
  currentBidLabel: {
    fontSize: fontSizes.span,
    color: colors.gray,
  },
  currentBidValue: {
    fontSize: fontSizes.span,
    fontWeight: '600',
    color: colors.primary,
  },
  buyoutInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buyoutLabel: {
    fontSize: fontSizes.span,
    color: colors.gray,
  },
  buyoutValue: {
    fontSize: fontSizes.span,
    fontWeight: '600',
    color: colors.warning,
  },
  auctionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLeft: {
    fontSize: fontSizes.span,
    color: colors.error,
    fontWeight: '500',
  },
  bidCount: {
    backgroundColor: colors.backgroundPrimary,
    paddingHorizontal: metrics.small,
    paddingVertical: metrics.tiny,
    borderRadius: metrics.borderRadius,
  },
  bidCountText: {
    fontSize: fontSizes.small,
    color: colors.primary,
    fontWeight: '500',
  },
  statusBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.info,
    paddingHorizontal: metrics.small,
    paddingVertical: metrics.tiny,
    borderTopRightRadius: metrics.borderRadius,
    borderBottomLeftRadius: metrics.borderRadius,
  },
  myAuctionBadge: {
    backgroundColor: colors.success,
  },
  statusText: {
    color: colors.white,
    fontSize: fontSizes.small,
    fontWeight: '600',
  },
  emptyState: {
    padding: metrics.huge,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.gray,
    fontSize: fontSizes.body,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.white,
    borderRadius: metrics.borderRadiusLarge,
    padding: metrics.large,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: metrics.large,
    color: colors.primary,
  },
  modalItemImage: {
    width: 120,
    height: 120,
    borderRadius: metrics.borderRadius,
    alignSelf: 'center',
    marginBottom: metrics.medium,
  },
  modalItemName: {
    textAlign: 'center',
    marginBottom: metrics.medium,
    color: colors.primary,
  },
  petDetails: {
    alignItems: 'center',
    marginBottom: metrics.large,
  },
  petSpecies: {
    fontSize: fontSizes.body,
    color: colors.gray,
    marginBottom: metrics.small,
  },
  petStatsRow: {
    flexDirection: 'row',
    gap: metrics.medium,
  },
  petStat: {
    fontSize: fontSizes.span,
    fontWeight: '600',
    color: colors.primary,
  },
  itemDescription: {
    textAlign: 'center',
    color: colors.gray,
    marginBottom: metrics.large,
    lineHeight: 20,
  },
  auctionDetails: {
    backgroundColor: colors.backgroundPrimary,
    padding: metrics.medium,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.large,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: metrics.small,
  },
  detailLabel: {
    fontSize: fontSizes.body,
    color: colors.gray,
  },
  detailValue: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.primary,
  },
  bidSection: {
    marginBottom: metrics.large,
  },
  bidInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: metrics.borderRadius,
    padding: metrics.medium,
    fontSize: fontSizes.body,
    marginBottom: metrics.medium,
  },
  bidActions: {
    flexDirection: 'row',
    gap: metrics.medium,
  },
  bidButton: {
    flex: 1,
  },
  buyoutButton: {
    flex: 1,
    backgroundColor: colors.warning,
  },
  createSection: {
    marginBottom: metrics.large,
  },
  createLabel: {
    fontSize: fontSizes.body,
    marginBottom: metrics.medium,
    color: colors.primary,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: metrics.small,
  },
  typeButton: {
    flex: 1,
    paddingVertical: metrics.medium,
    borderRadius: metrics.borderRadius,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  activeTypeButton: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    fontSize: fontSizes.body,
    color: colors.primary,
    fontWeight: '500',
  },
  activeTypeButtonText: {
    color: colors.white,
  },
  itemSelector: {
    maxHeight: 150,
  },
  selectableItem: {
    flexDirection: 'row',
    padding: metrics.medium,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.small,
    borderWidth: 1,
    borderColor: colors.backgroundSecondary,
  },
  selectedItem: {
    borderColor: colors.primary,
    backgroundColor: colors.backgroundPrimary,
  },
  selectableItemImage: {
    width: 50,
    height: 50,
    borderRadius: metrics.borderRadius,
  },
  selectableItemInfo: {
    flex: 1,
    marginLeft: metrics.medium,
    justifyContent: 'center',
  },
  selectableItemName: {
    fontSize: fontSizes.body,
    fontWeight: '500',
    marginBottom: metrics.tiny,
  },
  selectableItemDetail: {
    fontSize: fontSizes.span,
    color: colors.gray,
  },
  formRow: {
    flexDirection: 'row',
    gap: metrics.medium,
    marginBottom: metrics.large,
  },
  formField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: fontSizes.span,
    color: colors.gray,
    marginBottom: metrics.small,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: metrics.borderRadius,
    padding: metrics.medium,
    fontSize: fontSizes.body,
  },
  durationSelector: {
    flexDirection: 'row',
    gap: metrics.small,
  },
  durationButton: {
    flex: 1,
    paddingVertical: metrics.small,
    borderRadius: metrics.borderRadius,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  activeDurationButton: {
    backgroundColor: colors.primary,
  },
  durationButtonText: {
    fontSize: fontSizes.span,
    color: colors.primary,
    fontWeight: '500',
  },
  activeDurationButtonText: {
    color: colors.white,
  },
  modalActions: {
    flexDirection: 'row',
    gap: metrics.medium,
  },
  modalButton: {
    flex: 1,
  },
})
