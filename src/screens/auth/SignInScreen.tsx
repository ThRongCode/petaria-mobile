/**
 * Sign In Screen — "Lapis Glassworks" redesign
 * Matches the sign_up_immersive design: cinematic background image,
 * gradient branding title, frosted glass form card, glass inputs.
 */

import React, { useState, useCallback } from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput as RNTextInput,
  Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { ScreenContainer, ThemedText } from '@/components'
import { useAppDispatch } from '@/stores/store'
import { userActions } from '@/stores/reducers'
import { SignInSchema } from './signin.schema'
import { backgrounds } from '@/assets/images/backgrounds'
import { colors, fonts, spacing, radii, fontSizes, Images } from '@/themes'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type SignInFormData = z.infer<typeof SignInSchema>

export const SignInScreen: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const insets = useSafeAreaInsets()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const togglePassword = useCallback(() => setShowPassword(p => !p), [])

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(SignInSchema),
    defaultValues: __DEV__
      ? { email: 'test@vnpet.com', password: 'password123' }
      : { email: '', password: '' },
  })

  const onSubmit = async (data: SignInFormData) => {
    if (__DEV__) console.log('Sign in attempt:', { email: data.email })
    setIsLoading(true)
    try {
      dispatch(userActions.userLogin(data))
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
    }
  }

  return (
    <ScreenContainer backgroundImage={backgrounds.signIn}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[s.scrollContent, { paddingTop: insets.top + spacing.xl }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Branding Header ────────────────────────────── */}
          <View style={s.heroSection}>
            <ThemedText style={s.brandTitle}>VnPeteria</ThemedText>
            <ThemedText style={s.brandSubtitle}>THE ETHEREAL ARCHIVE</ThemedText>
          </View>

          {/* ── Glass Form Card ────────────────────────────── */}
          <View style={s.formCard}>
            {/* Decorative blur orbs inside card */}
            <View style={[s.decorOrb, s.orbTopRight]} />
            <View style={[s.decorOrb, s.orbBottomLeft]} />

            <View style={s.cardInner}>
              {/* Card header */}
              <View style={s.cardHeader}>
                <ThemedText style={s.cardTitle}>Welcome Back</ThemedText>
                <ThemedText style={s.cardSubtitle}>Sign in to continue your journey</ThemedText>
              </View>

              {/* Email field */}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={s.fieldGroup}>
                    <ThemedText style={s.fieldLabel}>EMAIL ADDRESS</ThemedText>
                    <View style={s.inputGlass}>
                      <Ionicons name="mail-outline" size={18} color={colors.onSurfaceVariant} />
                      <RNTextInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder="trainer@vnpeteria.com"
                        placeholderTextColor="rgba(255, 255, 255, 0.3)"
                        style={s.nativeInput}
                        selectionColor={colors.primary}
                      />
                    </View>
                    {errors.email && (
                      <ThemedText style={s.errorText}>{errors.email.message}</ThemedText>
                    )}
                  </View>
                )}
              />

              {/* Password field */}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={s.fieldGroup}>
                    <ThemedText style={s.fieldLabel}>PASSWORD</ThemedText>
                    <View style={s.inputGlass}>
                      <Ionicons name="lock-closed-outline" size={18} color={colors.onSurfaceVariant} />
                      <RNTextInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={!showPassword}
                        placeholder="Enter your password"
                        placeholderTextColor="rgba(255, 255, 255, 0.3)"
                        style={s.nativeInput}
                        selectionColor={colors.primary}
                      />
                      <TouchableOpacity onPress={togglePassword} hitSlop={8}>
                        <Image
                          source={showPassword ? Images.eyeHide : Images.eye}
                          style={s.eyeIcon}
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.password && (
                      <ThemedText style={s.errorText}>{errors.password.message}</ThemedText>
                    )}
                  </View>
                )}
              />

              {/* Forgot password */}
              <TouchableOpacity
                style={s.forgotRow}
                onPress={() => router.push('/forgot-password')}
                activeOpacity={0.7}
              >
                <ThemedText style={s.forgotText}>Forgot password?</ThemedText>
              </TouchableOpacity>

              {/* Sign In button */}
              <TouchableOpacity
                style={[s.ctaButton, isLoading && s.ctaDisabled]}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryContainer]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.ctaGradient}
                >
                  {isLoading ? (
                    <View style={s.loadingRow}>
                      <ActivityIndicator color={colors.onPrimary} size="small" />
                      <ThemedText style={s.ctaText}>SIGNING IN...</ThemedText>
                    </View>
                  ) : (
                    <View style={s.ctaContent}>
                      <ThemedText style={s.ctaText}>SIGN IN</ThemedText>
                      <Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Dev info */}
              {__DEV__ && (
                <View style={s.devInfo}>
                  <ThemedText style={s.devInfoText}>Dev Mode: Credentials pre-filled</ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* ── Footer Link ────────────────────────────────── */}
          <View style={s.footer}>
            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <ThemedText style={s.dividerLabel}>NEW TRAINER?</ThemedText>
              <View style={s.dividerLine} />
            </View>
            <TouchableOpacity onPress={() => router.push('/sign-up')} activeOpacity={0.7}>
              <ThemedText style={s.footerLink}>
                Create Account
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */

const s = StyleSheet.create({
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
  },

  // ── Branding ──────────────────────────────────────────────
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
    gap: spacing.xs,
  },
  brandTitle: {
    fontSize: fontSizes.hero,
    fontFamily: fonts.extraBold,
    lineHeight: fontSizes.hero * 1.3,
    letterSpacing: -1,
    color: colors.primary,
    textShadowColor: 'rgba(68, 216, 241, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  brandSubtitle: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.onSurfaceVariant,
    letterSpacing: 4,
  },

  // ── Glass Form Card ───────────────────────────────────────
  formCard: {
    width: '100%',
    backgroundColor: colors.glass.darkFillStrong,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: radii.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  cardInner: {
    padding: spacing['2xl'],
    gap: spacing.xl,
    position: 'relative',
    zIndex: 1,
  },
  decorOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbTopRight: {
    width: 200,
    height: 200,
    top: -80,
    right: -80,
    backgroundColor: 'rgba(68, 216, 241, 0.12)',
  },
  orbBottomLeft: {
    width: 200,
    height: 200,
    bottom: -80,
    left: -80,
    backgroundColor: 'rgba(0, 218, 243, 0.06)',
  },

  // ── Card Header ───────────────────────────────────────────
  cardHeader: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardTitle: {
    fontSize: fontSizes.heading + 4,
    fontFamily: fonts.bold,
    lineHeight: (fontSizes.heading + 4) * 1.3,
    color: colors.onSurface,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: fontSizes.span,
    fontFamily: fonts.medium,
    color: colors.onSurfaceVariant,
  },

  // ── Input Fields ──────────────────────────────────────────
  fieldGroup: {
    gap: spacing.sm,
  },
  fieldLabel: {
    fontSize: fontSizes.micro + 2,
    fontFamily: fonts.extraBold,
    letterSpacing: 2,
    color: colors.primary,
    marginLeft: 2,
  },
  inputGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.subtle,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  nativeInput: {
    flex: 1,
    color: colors.onSurface,
    fontSize: fontSizes.span,
    fontFamily: fonts.medium,
    paddingVertical: spacing.lg,
  },
  eyeIcon: {
    width: 22,
    height: 22,
    tintColor: colors.primary,
    resizeMode: 'contain' as const,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    marginTop: 2,
    marginLeft: 2,
  },

  // ── Forgot Password ──────────────────────────────────────
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
  },
  forgotText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.medium,
    color: colors.onSurfaceVariant,
  },

  // ── CTA Button ────────────────────────────────────────────
  ctaButton: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    shadowColor: 'rgba(68, 216, 241, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
  ctaGradient: {
    paddingVertical: spacing.lg + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ctaText: {
    color: colors.onPrimary,
    fontSize: fontSizes.small,
    fontFamily: fonts.extraBold,
    letterSpacing: 3,
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  // ── Dev Info ──────────────────────────────────────────────
  devInfo: {
    backgroundColor: 'rgba(68, 216, 241, 0.08)',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(68, 216, 241, 0.15)',
  },
  devInfoText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.medium,
    color: colors.primary,
    textAlign: 'center',
  },

  // ── Footer ────────────────────────────────────────────────
  footer: {
    marginTop: spacing['3xl'],
    alignItems: 'center',
    gap: spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dividerLine: {
    width: 32,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  dividerLabel: {
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 2,
    color: colors.onSurfaceVariant,
  },
  footerLink: {
    fontSize: fontSizes.span,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
})
