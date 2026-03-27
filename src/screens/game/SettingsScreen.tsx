import React, { useState, useCallback } from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/stores/store'
import { getUserProfile } from '@/stores/selectors'
import { gameActions } from '@/stores/reducers'
import { userApi } from '@/services/api'
import { ThemedText } from '@/components'
import { Panel } from '@/components/ui'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii } from '@/themes/metrics'

type SettingsKey = 'notifications' | 'autoFeed' | 'battleAnimations' | 'soundEnabled' | 'musicEnabled'

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap
  iconColor: string
  label: string
  description: string
  value: boolean
  onToggle: (value: boolean) => void
  disabled?: boolean
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  iconColor,
  label,
  description,
  value,
  onToggle,
  disabled,
}) => (
  <View style={styles.settingRow}>
    <View style={[styles.settingIcon, { backgroundColor: iconColor + '20' }]}>
      <Ionicons name={icon} size={22} color={iconColor} />
    </View>
    <View style={styles.settingInfo}>
      <ThemedText style={styles.settingLabel}>{label}</ThemedText>
      <ThemedText style={styles.settingDescription}>{description}</ThemedText>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      disabled={disabled}
      trackColor={{ false: colors.surfaceContainerHigh, true: colors.primaryContainer }}
      thumbColor={value ? colors.onSurface : colors.outline}
    />
  </View>
)

/**
 * SettingsScreen — User preferences with API-first persistence
 * Optimistically updates Redux, then syncs to backend
 */
export const SettingsScreen: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const profile = useSelector(getUserProfile)
  const [isSaving, setIsSaving] = useState(false)

  const settings = profile?.settings ?? {
    notifications: true,
    autoFeed: false,
    battleAnimations: true,
    soundEnabled: true,
    musicEnabled: true,
    language: 'en',
  }

  const handleToggle = useCallback(
    async (key: SettingsKey, value: boolean) => {
      // Optimistic update
      dispatch(gameActions.updateSettings({ [key]: value }))

      try {
        setIsSaving(true)
        await userApi.updateSettings({ [key]: value })
      } catch {
        // Revert on failure
        dispatch(gameActions.updateSettings({ [key]: !value }))
        Alert.alert('Error', 'Failed to save setting. Please try again.')
      } finally {
        setIsSaving(false)
      }
    },
    [dispatch],
  )

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.surfaceContainerLowest, colors.surface, colors.surfaceContainerLow]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Settings</ThemedText>
        {isSaving && <ActivityIndicator color={colors.primary} size="small" />}
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Gameplay Section */}
        <Panel variant="dark" style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🎮 Gameplay</ThemedText>

          <SettingRow
            icon="sparkles"
            iconColor="#FFD700"
            label="Battle Animations"
            description="Show attack & effect animations during battles"
            value={settings.battleAnimations}
            onToggle={(v) => handleToggle('battleAnimations', v)}
          />

          <SettingRow
            icon="refresh"
            iconColor="#4CAF50"
            label="Auto Feed"
            description="Automatically feed hungry pets when you have food"
            value={settings.autoFeed}
            onToggle={(v) => handleToggle('autoFeed', v)}
          />
        </Panel>

        {/* Sound Section */}
        <Panel variant="dark" style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🔊 Sound</ThemedText>

          <SettingRow
            icon="volume-high"
            iconColor="#00BFFF"
            label="Sound Effects"
            description="Play sounds for actions and events"
            value={settings.soundEnabled}
            onToggle={(v) => handleToggle('soundEnabled', v)}
          />

          <SettingRow
            icon="musical-notes"
            iconColor="#9C27B0"
            label="Background Music"
            description="Play background music throughout the app"
            value={settings.musicEnabled}
            onToggle={(v) => handleToggle('musicEnabled', v)}
          />
        </Panel>

        {/* Notifications Section */}
        <Panel variant="dark" style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🔔 Notifications</ThemedText>

          <SettingRow
            icon="notifications"
            iconColor="#FF6B6B"
            label="Push Notifications"
            description="Receive alerts for events, ticket resets, and more"
            value={settings.notifications}
            onToggle={(v) => handleToggle('notifications', v)}
          />
        </Panel>

        {/* Account Section */}
        <Panel variant="dark" style={styles.section}>
          <ThemedText style={styles.sectionTitle}>👤 Account</ThemedText>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Alert.alert('Coming Soon', 'Change password will be available in a future update.')}
          >
            <View style={[styles.settingIcon, { backgroundColor: 'rgba(102,126,234,0.2)' }]}>
              <Ionicons name="key" size={22} color="#667eea" />
            </View>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Change Password</ThemedText>
              <ThemedText style={styles.settingDescription}>Update your account password</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </Panel>

        {/* App Info */}
        <View style={styles.appInfo}>
          <ThemedText style={styles.appInfoText}>VnPeteria v1.0.0</ThemedText>
          <ThemedText style={styles.appInfoText}>Made with ❤️</ThemedText>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  headerSpacer: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  section: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
  },
  settingDescription: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
    gap: spacing.xs,
  },
  appInfoText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.outlineVariant,
  },
})
