/**
 * useHuntSession Hook
 * Single Responsibility: Manage hunt session state and API calls
 * 
 * This hook handles:
 * - Session initialization (start new or resume existing)
 * - Movement in the hunt
 * - Session completion
 */

import { useState, useEffect, useCallback } from 'react'
import { Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { huntApi } from '@/services/api'
import { HuntSession, Encounter, HuntSessionParams, SessionRewards, Direction } from '../types'
import { formatSessionSummary } from '../utils'

interface UseHuntSessionOptions {
  params: HuntSessionParams
  onSessionComplete?: () => void
}

interface UseHuntSessionReturn {
  // State
  session: HuntSession | null
  encounters: Encounter[]
  movesLeft: number
  isLoading: boolean
  isMoving: boolean
  error: string | null
  sessionRewards: SessionRewards
  
  // Actions
  makeMove: (direction: Direction) => Promise<Encounter | null>
  completeSession: () => Promise<void>
  exitSession: () => void
  
  // Encounter management
  currentEncounter: Encounter | null
  setCurrentEncounter: (encounter: Encounter | null) => void
  showEncounter: boolean
  setShowEncounter: (show: boolean) => void
  updateEncounterAsCaught: (encounterId: string) => void
  incrementPetsFound: () => void
}

export const useHuntSession = ({ 
  params, 
  onSessionComplete 
}: UseHuntSessionOptions): UseHuntSessionReturn => {
  const router = useRouter()
  
  // Session state
  const [session, setSession] = useState<HuntSession | null>(null)
  const [encounters, setEncounters] = useState<Encounter[]>([])
  const [movesLeft, setMovesLeft] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [isMoving, setIsMoving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Encounter state
  const [currentEncounter, setCurrentEncounter] = useState<Encounter | null>(null)
  const [showEncounter, setShowEncounter] = useState(false)
  
  // Rewards tracking
  const [sessionRewards, setSessionRewards] = useState<SessionRewards>({
    totalXp: 0,
    totalCoins: 0,
    petsFound: 0,
    itemsFound: 0,
  })

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      console.log('🎯 Initializing hunt session...')
      setIsLoading(true)
      setError(null)

      try {
        if (params.regionId) {
          // Start new session
          await startNewSession(params.regionId)
        } else if (params.sessionId) {
          // Resume existing session
          await resumeSession()
        } else {
          throw new Error('No region or session specified')
        }
      } catch (err) {
        console.error('❌ Error initializing session:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize hunt session'
        setError(errorMessage)
        Alert.alert('Error', 'Failed to start hunt session', [
          { text: 'Go Back', onPress: () => router.back() },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    initSession()
  }, [params.sessionId, params.regionId])

  const startNewSession = async (regionId: string) => {
    console.log('🚀 Starting new hunt session for region:', regionId)

    try {
      const startResult = await huntApi.startHunt(regionId)
      
      if (startResult.success && startResult.data) {
        setSession(startResult.data.session)
        setEncounters(startResult.data.encounters || [])
        setMovesLeft(startResult.data.movesLeft ?? 10)
        return
      }
      throw new Error('Failed to start hunt session')
    } catch (startError: any) {
      // Handle existing session conflict
      const errorMsg = startError?.message || ''
      if (errorMsg.toLowerCase().includes('already have an active')) {
        console.log('⚠️ Existing session found, auto-completing it...')
        await handleExistingSessionConflict(regionId)
      } else {
        throw startError
      }
    }
  }

  const handleExistingSessionConflict = async (regionId: string) => {
    const existingResult = await huntApi.getSession()
    
    if (existingResult.success && existingResult.data) {
      // Auto-complete the old session
      try {
        await huntApi.completeSession(existingResult.data.session.id)
        console.log('✅ Auto-completed old session')
      } catch {
        console.log('⚠️ Could not complete old session, canceling it...')
        await huntApi.cancelSession(existingResult.data.session.id)
      }

      // Now start the new session
      const newStartResult = await huntApi.startHunt(regionId)
      if (newStartResult.success && newStartResult.data) {
        setSession(newStartResult.data.session)
        setEncounters(newStartResult.data.encounters || [])
        setMovesLeft(newStartResult.data.movesLeft ?? 10)
      } else {
        throw new Error('Failed to start new hunt session')
      }
    }
  }

  const resumeSession = async () => {
    console.log('🔄 Resuming existing session:', params.sessionId)
    const result = await huntApi.getSession()

    if (result.success && result.data) {
      const loadedMovesLeft = result.data.movesLeft ?? 0

      // If session has 0 moves, auto-complete it
      if (loadedMovesLeft === 0) {
        console.log('🏁 Session has 0 moves, auto-completing...')
        const caughtCount = (result.data.encounters || []).filter((e: any) => e.caught).length

        try {
          await huntApi.completeSession(result.data.session.id)
        } catch (e) {
          console.log('⚠️ Could not complete session:', e)
        }

        Alert.alert(
          'Hunt Complete!',
          formatSessionSummary(
            result.data.session.region.name,
            result.data.encounters?.length || 0,
            caughtCount
          ),
          [{ text: 'OK', onPress: () => router.back() }]
        )
        return
      }

      setSession(result.data.session)
      setEncounters(result.data.encounters || [])
      setMovesLeft(loadedMovesLeft)
    } else {
      throw new Error('Session not found')
    }
  }

  const makeMove = useCallback(async (direction: Direction): Promise<Encounter | null> => {
    if (!session || isMoving || movesLeft <= 0) {
      console.log('❌ Move blocked:', { hasSession: !!session, isMoving, movesLeft })
      return null
    }

    console.log('✅ Move allowed, calling API...')
    setIsMoving(true)

    try {
      const result = await huntApi.move(session.id, direction)

      if (result.success && result.data) {
        setMovesLeft(result.data.movesLeft)

        if (result.data.encounter) {
          const newEncounter = result.data.encounter
          setEncounters(prev => [...prev, newEncounter])
          setCurrentEncounter(newEncounter)
          setShowEncounter(true)
          return newEncounter
        }

        // Check if out of moves
        if (result.data.movesLeft === 0) {
          // Will be handled by the calling component
          return null
        }
      }
      return null
    } catch (err) {
      console.error('❌ Error moving:', err)
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to move')
      return null
    } finally {
      setIsMoving(false)
    }
  }, [session, isMoving, movesLeft])

  const completeSession = useCallback(async () => {
    if (!session) return

    console.log('🏁 Completing hunt session')

    try {
      await huntApi.completeSession(session.id)
      const caughtCount = encounters.filter(e => e.caught).length

      Alert.alert(
        'Hunting Session Complete!',
        formatSessionSummary(session.region.name, encounters.length, caughtCount),
        [{ text: 'Return to Hunting Grounds', onPress: () => router.back() }]
      )
      
      onSessionComplete?.()
    } catch (err) {
      console.error('❌ Error completing session:', err)
      Alert.alert('Error', 'Failed to complete session', [
        { text: 'Go Back Anyway', onPress: () => router.back() },
      ])
    }
  }, [session, encounters, router, onSessionComplete])

  const exitSession = useCallback(() => {
    router.back()
  }, [router])

  const updateEncounterAsCaught = useCallback((encounterId: string) => {
    setEncounters(prev => 
      prev.map(e => (e.id === encounterId ? { ...e, caught: true } : e))
    )
  }, [])

  const incrementPetsFound = useCallback(() => {
    setSessionRewards((prev: SessionRewards) => ({
      ...prev,
      petsFound: prev.petsFound + 1,
    }))
  }, [])

  return {
    session,
    encounters,
    movesLeft,
    isLoading,
    isMoving,
    error,
    sessionRewards,
    makeMove,
    completeSession,
    exitSession,
    currentEncounter,
    setCurrentEncounter,
    showEncounter,
    setShowEncounter,
    updateEncounterAsCaught,
    incrementPetsFound,
  }
}
