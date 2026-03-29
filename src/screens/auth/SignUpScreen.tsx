/**
 * Sign Up Screen — "Lapis Glassworks" redesign
 */

import React, { useCallback } from 'react'
import { Image, StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { ThemedText } from '@/components'
import { Images } from '@/themes'
import { getString } from '@/locale/I18nConfig'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/form'
import { SIGNUP_FIELDS } from './constants'
import { ButtonPrimary } from 'rn-base-component'
import { useAppDispatch } from '@/stores/store'
import { userActions } from '@/stores/reducers'
import { IUserSignUpPayload } from '@/stores/types'
import { SignUpSchema } from './signup.schema'
import { Link } from 'expo-router'
import { RouteKeys } from '@/routes/RouteKeys'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'

export const SignUpScreen: React.FC = () => {
  const dispatch = useAppDispatch()
  const { control, handleSubmit } = useForm<IUserSignUpPayload>({
    defaultValues: {},
    mode: 'onChange',
    resolver: zodResolver(SignUpSchema),
  })

  const onSubmit = useCallback(
    (data: IUserSignUpPayload) => {
      dispatch(userActions.userSignUp(data))
    },
    [dispatch],
  )

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.surfaceContainerLowest, colors.surface, '#0A1628']}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo + Title */}
          <View style={styles.heroSection}>
            <Image source={Images.sts} style={styles.logo} />
            <ThemedText style={styles.title}>{getString('auth.signUp')}</ThemedText>
            <ThemedText style={styles.subtitle}>Create your VnPeteria account</ThemedText>
          </View>

          {/* Glass form card */}
          <View style={styles.formCard}>
            <Form<IUserSignUpPayload> fields={SIGNUP_FIELDS} control={control} />

            <ButtonPrimary onPress={() => handleSubmit(onSubmit)()}>
              {getString('auth.signUp')}
            </ButtonPrimary>
          </View>

          <Link href={RouteKeys.SignIn} style={styles.link}>
            <ThemedText style={styles.linkText}>Already have an account? <ThemedText style={styles.linkAccent}>Sign In</ThemedText></ThemedText>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceContainerLowest },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },

  // ── Hero ──────────────────────────────────────────────────
  heroSection: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { width: 70, height: 70, marginBottom: spacing.md },
  title: {
    fontSize: fontSizes.heading,
    fontFamily: fonts.extraBold,
    color: colors.primary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: fontSizes.span,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },

  // ── Form Card ─────────────────────────────────────────────
  formCard: {
    width: '100%',
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.glass.innerGlow,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },

  // ── Link ──────────────────────────────────────────────────
  link: { marginTop: spacing.xl, paddingVertical: spacing.sm },
  linkText: { fontSize: fontSizes.span, fontFamily: fonts.regular, color: colors.onSurfaceVariant },
  linkAccent: { color: colors.primary, fontFamily: fonts.bold },
})