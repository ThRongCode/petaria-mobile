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
import { Ionicons } from '@expo/vector-icons'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/stores/store'
import { getUserProfile } from '@/stores/selectors'
import { gameActions } from '@/stores/reducers'
import { userApi } from '@/services/api'
import { ScreenContainer, ThemedText } from '@/components'
import { Panel } from '@/components/ui'
import {
  colors,
  fonts,
  spacing,
  radii,
  fontSizes,
} from '@/themes'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type SettingsKey = 'notifications' | 'autoFeed' | 'battleAnimations' | 'soundEnabled' | 'musicEnabled'

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap
  iconColor: string
  label: string
  description: string
  value: boolean
  onToggle: (value: boolean) => void
  disabled?: boolean
  isLast?: boolean
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  iconColor,
  label,
  description,
  value,
  onToggle,
  disabled,
  isLast,
}) => (
  <View style={[s.settingRow, !isLast && s.settingRowBorder]}>
    <View style={[s.settingIcon, { backgroundColor: iconColor + '15' }]}>
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>
    <View style={s.settingInfo}>
      <ThemedText style={s.settingLabel}>{label}</ThemedText>
      <ThemedText style={s.settingDesc}>{description}</ThemedText>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      disabled={disabled}
      trackColor={{ false: colors.surfaceContainerHighest, true: colors.primaryContainer }}
      thumbColor={value ? '#FFF' : colors.outline}
    />
  </View>
)

/**
 * SettingsScreen — Immersive settings panel
 *
 * Layout (matches settings_immersive design):
 *   1. Background gradient + ambient blur orbs
 *   2. Header with back button + "Settings" title
 *   3. Profile account card (glass)
 *   4. Sections: Gameplay, Audio & Visuals, Notifications, Account
 *   5. Footer version + sign out
 */
export const SettingsScreen: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const insets = useSafeAreaInsets()
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
      dispatch(gameActions.updateSettings({ [key]: value }))
      try {
        setIsSaving(true)
        await userApi.updateSettings({ [key]: value })
      } catch {
        dispatch(gameActions.updateSettings({ [key]: !value }))
        Alert.alert('Error', 'Failed to save setting. Please try again.')
      } finally {
        setIsSaving(false)
      }
    },
    [dispatch],
  )

  return (
    <ScreenContainer backgroundOverlay>
      {/* ════════════ HEADER ════════════ */}
      <View style={[s.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <ThemedText style={s.headerTitle}>Settings</ThemedText>
        {isSaving && <ActivityIndicator color={colors.primary} size="small" />}
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ════════════ PROFILE CARD ════════════ */}
        <Panel variant="glass" intensity="default" style={s.profileCard}>
          <View style={s.profileRow}>
            <View style={s.profileAvatar}>
              <Ionicons name="person" size={32} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={s.profileName}>{profile.username}</ThemedText>
              <View style={s.profileStatus}>
                <View style={s.statusDot} />
                <ThemedText style={s.profileSub}>Network Connected</ThemedText>
              </View>
            </View>
          </View>
        </Panel>

        {/* ════════════ GAMEPLAY ════════════ */}
        <View style={s.sectionWrapper}>
          <ThemedText style={s.sectionTitle}>GAMEPLAY</ThemedText>
          <Panel variant="glass" intensity="subtle" flush style={s.sectionPanel}>
            <SettingRow
              icon="sparkles"
              iconColor={colors.secondaryContainer}
              label="Battle Animations"
              description="Show attack & effect animations"
              value={settings.battleAnimations}
              onToggle={(v) => handleToggle('battleAnimations', v)}
            />
            <SettingRow
              icon="refresh"
              iconColor={colors.success}
              label="Auto Feed"
              description="Automatically feed hungry pets"
              value={settings.autoFeed}
              onToggle={(v) => handleToggle('autoFeed', v)}
              isLast
            />
          </Panel>
        </View>

        {/* ════════════ AUDIO & VISUALS ════════════ */}
        <View style={s.sectionWrapper}>
          <ThemedText style={s.sectionTitle}>AUDIO & VISUALS</ThemedText>
          <Panel variant="glass" intensity="subtle" flush style={s.sectionPanel}>
            <SettingRow
              icon="volume-high"
              iconColor={colors.tertiary}
              label="Sound Effects"
              description="Play sounds for actions and events"
              value={settings.soundEnabled}
              onToggle={(v) => handleToggle('soundEnabled', v)}
            />
            <SettingRow
              icon="musical-notes"
              iconColor="#A855F7"
              label="Background Music"
              description="Play music throughout the app"
              value={settings.musicEnabled}
              onToggle={(v) => handleToggle('musicEnabled', v)}
              isLast
            />
          </Panel>
        </View>

        {/* ════════════ NOTIFICATIONS ════════════ */}
        <View style={s.sectionWrapper}>
          <ThemedText style={s.sectionTitle}>NOTIFICATIONS</ThemedText>
          <Panel variant="glass" intensity="subtle" flush style={s.sectionPanel}>
            <SettingRow
              icon="notifications"
              iconColor={colors.error}
              label="Push Notifications"
              description="Alerts for events, tickets, and more"
              value={settings.notifications}
              onToggle={(v) => handleToggle('notifications', v)}
              isLast
            />
          </Panel>
        </View>

        {/* ════════════ ACCOUNT ════════════ */}
        <View style={s.sectionWrapper}>
          <ThemedText style={s.sectionTitle}>ACCOUNT</ThemedText>
          <Panel variant="glass" intensity="subtle" flush style={s.sectionPanel}>
            <TouchableOpacity
              style={s.linkRow}
              onPress={() => Alert.alert('Coming Soon', 'Change password will be available soon.')}
            >
              <View style={[s.settingIcon, { backgroundColor: 'rgba(102,126,234,0.15)' }]}>
                <Ionicons name="key" size={20} color="#667eea" />
              </View>
              <View style={s.settingInfo}>
                <ThemedText style={s.settingLabel}>Change Password</ThemedText>
                <ThemedText style={s.settingDesc}>Update your account password</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.outline} />
            </TouchableOpacity>
          </Panel>
        </View>

        {/* ════════════ FOOTER ════════════ */}
        <View style={s.footer}>
          <ThemedText style={s.versionText}>VERSION V1.0.0-VNPETERIA</ThemedText>
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  // ── Header ─────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.glass.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSizes.title,
    fontFamily: fonts.bold,
    color: colors.primaryFixed,
    textAlign: 'center',
    textShadowColor: 'rgba(68, 216, 241, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['5xl'],
  },

  // ── Profile Card ───────────────────────────────────────────
  profileCard: {
    padding: spacing.xl,
    marginBottom: spacing['2xl'],
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 2,
    borderColor: 'rgba(68, 216, 241, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: fontSizes.title,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  profileStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondaryFixed,
  },
  profileSub: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },

  // ── Sections ───────────────────────────────────────────────
  sectionWrapper: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: fontSizes.small,
    fontFamily: fonts.bold,
    color: colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.md,
  },
  sectionPanel: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },

  // ── Setting Row ────────────────────────────────────────────
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: fontSizes.body,
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
  },
  settingDesc: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },

  // ── Link Row ───────────────────────────────────────────────
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },

  // ── Footer ─────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
    gap: spacing.md,
  },
  versionText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.medium,
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
})
