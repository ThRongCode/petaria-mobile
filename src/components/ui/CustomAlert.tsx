import React from 'react'
import { Modal, View, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import { ThemedText } from '@/components'
import { LinearGradient } from 'expo-linear-gradient'
import { Panel } from './Panel'

interface AlertButton {
  text: string
  onPress?: () => void
  style?: 'default' | 'cancel' | 'destructive'
}

interface CustomAlertProps {
  visible: boolean
  title: string
  message?: string
  buttons?: AlertButton[]
  onDismiss?: () => void
}

/**
 * CustomAlert - Themed alert dialog replacing native Alert
 * Matches the app's dark theme with gold accents
 */
export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: 'OK', style: 'default' }],
  onDismiss,
}) => {
  const handleButtonPress = (button: AlertButton) => {
    // Execute button action first
    if (button.onPress) {
      button.onPress()
    }
    // Then dismiss alert after a small delay to prevent flash
    setTimeout(() => {
      if (onDismiss) {
        onDismiss()
      }
    }, 50)
  }

  const getButtonColors = (style?: string): [string, string] => {
    switch (style) {
      case 'destructive':
        return ['#EF5350', '#E53935']
      case 'cancel':
        return ['#757575', '#616161']
      default:
        return ['#2196F3', '#1976D2']
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Panel variant="dark" style={styles.alertContainer}>
          {/* Title */}
          <ThemedText style={styles.title}>{title}</ThemedText>

          {/* Message */}
          {message && (
            <ThemedText style={styles.message}>{message}</ThemedText>
          )}

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={styles.button}
                onPress={() => handleButtonPress(button)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={getButtonColors(button.style)}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ThemedText style={styles.buttonText}>
                    {button.text}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </Panel>
      </View>
    </Modal>
  )
}

/**
 * showCustomAlert - Helper function to show custom alerts
 * Usage: showCustomAlert({ title, message, buttons })
 */
export const showCustomAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[]
): Promise<void> => {
  return new Promise((resolve) => {
    // This will be implemented with a global alert manager
    // For now, components should use the CustomAlert component directly
    resolve()
  })
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    width: '100%',
    maxWidth: 340,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonsContainer: {
    gap: 12,
  },
  button: {
    width: '100%',
  },
  buttonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
})
