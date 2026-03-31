/**
 * useHuntSession Hook
 * Manages hunt session state and API calls
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'expo-router'
import { globalAlert } from '@/components/ui/AlertProvider'
import { huntApi } from '@/services/api'
import { HuntSession, Encounter, HuntSessionParams, SessionRewards, Direction } from '../types'
import { formatSessionSummary } from '../utils'

interface UseHuntSessionOptions {
  params: HuntSessionParams
  onSessionComplete?: () => void
}

interface UseHuntSessionReturn {
  session: HuntSession | null
  encounters: Encounter[]
  movesLeft: number
  isLoading: boolean
  isMoving: boolean
  error: string | null
  sessionRewards: SessionRewards
  makeMove: (direction: Direction) => Promise<Encounter | null>
  completeSession: () => Promise<void>
  exitSession: () => void
  currentEncounter: Encounter | null
  setCurrentEncounter: (encounter: Encounter | null) => void
  updateEncounterAsCaught: (encounterId: string) => void
  incrementPetsFound: () => void
}

export const useHuntSession = ({
  params,
  onSessionComplete
}: UseHuntSessionOptions): UseHuntSessionReturn => {
  const router = useRouter()

  const [session, setSession] = useState<HuntSession | null>(null)
  const [encounters, setEncounters] = useState<Encounter[]>([])
  const [movesLeft, setMovesLeft] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [isMoving, setIsMoving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentEncounter, setCurrentEncounter] = useState<Encounter | null>(null)
  const [sessionRewards, setSessionRewards] = useState<SessionRewards>({
    totalXp: 0,
    totalCoins: 0,
    petsFound: 0,
    itemsFound: 0,
  })

  useEffect(() => {
    const initSession = async () => {
      setIsLoading(true)
      setError(null)

      try {
        if (params.regionId) {
          await startNewSession(params.regionId)
        } else if (params.sessionId) {
          await resumeSession()
        } else {
          throw new Error('No region or session specified')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize hunt session'
        setError(errorMessage)
        globalAlert.show('Error', 'Failed to start hunt session', [
          { text: 'Go Back', onPress: () => router.back() },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    initSession()
  }, [params.sessionId, params.regionId])

  const startNewSession = async (regionId: string) => {
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
      const errorMsg = startError?.message || ''
      if (errorMsg.toLowerCase().includes('already have an active')) {
        await handleExistingSessionConflict(regionId)
      } else {
        throw startError
      }
    }
  }

  const handleExistingSessionConflict = async (regionId: string) => {
    const existingResult = await huntApi.getSession()

    if (existingResult.success && existingResult.data) {
      try {
        await huntApi.completeSession(existingResult.data.session.id)
      } catch {
        await huntApi.cancelSession(existingResult.data.session.id)
      }

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
    const result = await huntApi.getSession()

    if (result.success && result.data) {
      const loadedMovesLeft = result.data.movesLeft ?? 0

      if (loadedMovesLeft === 0) {
        const caughtCount = (result.data.encounters || []).filter((e: any) => e.caught).length

        try {
          await huntApi.completeSession(result.data.session.id)
        } catch {
          // Session may already be completed
        }

        globalAlert.show(
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
    if (!session || isMoving || movesLeft <= 0) return null

    setIsMoving(true)

    try {
      const result = await huntApi.move(session.id, direction)

      if (result.success && result.data) {
        setMovesLeft(result.data.movesLeft)

        if (result.data.encounter) {
          const newEncounter = result.data.encounter
          setEncounters(prev => [...prev, newEncounter])
          setCurrentEncounter(newEncounter)
          return newEncounter
        }
      }
      return null
    } catch (err) {
      globalAlert.show('Error', err instanceof Error ? err.message : 'Failed to move')
      return null
    } finally {
      setIsMoving(false)
    }
  }, [session, isMoving, movesLeft])

  const completeSession = useCallback(async () => {
    if (!session) return

    try {
      await huntApi.completeSession(session.id)
      const caughtCount = encounters.filter(e => e.caught).length

      globalAlert.show(
        'Hunting Session Complete!',
        formatSessionSummary(session.region.name, encounters.length, caughtCount),
        [{ text: 'Return to Hunting Grounds', onPress: () => router.back() }]
      )

      onSessionComplete?.()
    } catch (err) {
      globalAlert.show('Error', 'Failed to complete session', [
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
    updateEncounterAsCaught,
    incrementPetsFound,
  }
}
