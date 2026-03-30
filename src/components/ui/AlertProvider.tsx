/**
 * Global Alert Provider — "Lapis Glassworks" themed alerts
 *
 * Drop-in replacement for React Native's Alert.alert().
 * Wrap your app with <AlertProvider> and use the useAlert() hook
 * or call globalAlert.show() from non-component code (hooks, sagas).
 *
 * Usage:
 *   // In components:
 *   const alert = useAlert()
 *   alert.show('Title', 'Message', [{ text: 'OK' }])
 *
 *   // In hooks / non-component code:
 *   import { globalAlert } from '@/components/ui/AlertProvider'
 *   globalAlert.show('Title', 'Message', [{ text: 'OK' }])
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { CustomAlert } from './CustomAlert'

interface AlertButton {
  text: string
  onPress?: () => void
  style?: 'default' | 'cancel' | 'destructive'
}

interface AlertState {
  visible: boolean
  title: string
  message?: string
  buttons: AlertButton[]
}

interface AlertContextValue {
  show: (title: string, message?: string, buttons?: AlertButton[]) => void
}

const AlertContext = createContext<AlertContextValue | null>(null)

/**
 * Global alert reference — usable outside of React components
 * (e.g. in custom hooks, redux sagas, utility functions)
 */
export const globalAlert: AlertContextValue = {
  show: () => {
    console.warn('AlertProvider not mounted yet. Falling back to console.')
  },
}

export const useAlert = (): AlertContextValue => {
  const ctx = useContext(AlertContext)
  if (!ctx) {
    // Fallback to globalAlert if used outside provider (shouldn't happen)
    return globalAlert
  }
  return ctx
}

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
    message: undefined,
    buttons: [],
  })

  // Queue for alerts that come in while one is already showing
  const queueRef = useRef<Omit<AlertState, 'visible'>[]>([])
  const isShowingRef = useRef(false)

  const showNext = useCallback(() => {
    if (queueRef.current.length > 0) {
      const next = queueRef.current.shift()!
      setAlertState({ visible: true, ...next })
    } else {
      isShowingRef.current = false
    }
  }, [])

  const show = useCallback((
    title: string,
    message?: string,
    buttons?: AlertButton[],
  ) => {
    const alertData = {
      title,
      message,
      buttons: buttons || [{ text: 'OK', style: 'default' as const }],
    }

    if (isShowingRef.current) {
      // Queue it if an alert is already showing
      queueRef.current.push(alertData)
    } else {
      isShowingRef.current = true
      setAlertState({ visible: true, ...alertData })
    }
  }, [])

  const handleDismiss = useCallback(() => {
    setAlertState(prev => ({ ...prev, visible: false }))
    // Show next queued alert after a brief delay for animation
    setTimeout(showNext, 200)
  }, [showNext])

  // Keep globalAlert in sync
  const contextValue = useRef<AlertContextValue>({ show }).current
  contextValue.show = show
  globalAlert.show = show

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onDismiss={handleDismiss}
      />
    </AlertContext.Provider>
  )
}
