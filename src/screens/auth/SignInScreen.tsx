import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { useAppDispatch } from '@/stores/store'
import { userActions } from '@/stores/reducers'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { TextInput } from '@/components/TextInput'
import { SignInSchema } from './signin.schema'
import { colors, fonts, spacing, radii } from '@/themes'

type SignInFormData = z.infer<typeof SignInSchema>

export const SignInScreen: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)

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
    if (__DEV__) console.log('🔐 Sign in attempt:', { email: data.email })
    setIsLoading(true)
    try {
      dispatch(userActions.userLogin(data))
      if (__DEV__) console.log('✅ Dispatched userLogin action')
      // Navigation will be handled by Redux saga after successful login
      // Don't set loading to false here - let saga handle it
    } catch (error) {
      console.error('❌ Login error:', error)
      setIsLoading(false)
    }
  }

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
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo/Title Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[colors.primaryContainer, colors.primary]}
                style={styles.logoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ThemedText style={styles.logoText}>🎮</ThemedText>
              </LinearGradient>
            </View>
            <ThemedText style={styles.title}>VnPet Trainer</ThemedText>
            <ThemedText style={styles.subtitle}>Sign in to continue your journey</ThemedText>
          </View>

          {/* Form Card with Glassmorphism */}
          <View style={styles.formCard}>
            <BlurView intensity={20} tint="dark" style={styles.blurCard}>
              <View style={styles.cardBorder}>
                <View style={styles.form}>
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={styles.inputContainer}>
                        <ThemedText style={styles.label}>📧 Email</ThemedText>
                        <View style={styles.inputWrapper}>
                          <TextInput
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="trainer@vnpet.com"
                            placeholderTextColor="rgba(255, 255, 255, 0.4)"
                            style={styles.input}
                            inputContainerStyle={styles.inputInner}
                            inputStyle={styles.inputText}
                          />
                        </View>
                        {errors.email && (
                          <ThemedText style={styles.errorText}>⚠️ {errors.email.message}</ThemedText>
                        )}
                      </View>
                    )}
                  />

                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={styles.inputContainer}>
                        <ThemedText style={styles.label}>🔒 Password</ThemedText>
                        <View style={styles.inputWrapper}>
                          <TextInput
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            secureTextEntry
                            placeholder="Enter your password"
                            placeholderTextColor="rgba(255, 255, 255, 0.4)"
                            style={styles.input}
                            inputContainerStyle={styles.inputInner}
                            inputStyle={styles.inputText}
                          />
                        </View>
                        {errors.password && (
                          <ThemedText style={styles.errorText}>⚠️ {errors.password.message}</ThemedText>
                        )}
                      </View>
                    )}
                  />

                  <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={[colors.primaryContainer, colors.primary]}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {isLoading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator color={colors.onPrimary} size="small" />
                          <ThemedText style={styles.buttonText}>Signing in...</ThemedText>
                        </View>
                      ) : (
                        <ThemedText style={styles.buttonText}>🎯 Sign In</ThemedText>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Dev Info */}
                  {__DEV__ && (
                    <View style={styles.devInfo}>
                      <ThemedText style={styles.devInfoText}>
                        🧪 Dev Mode: Credentials pre-filled
                      </ThemedText>
                    </View>
                  )}

                  {/* Forgot Password */}
                  <TouchableOpacity
                    style={styles.forgotPasswordButton}
                    onPress={() => router.push('/forgot-password')}
                  >
                    <ThemedText style={styles.forgotPasswordText}>Forgot password?</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>New trainer? </ThemedText>
            <TouchableOpacity onPress={() => router.push('/sign-up')}>
              <ThemedText style={styles.linkText}>Create Account →</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  formCard: {
    marginBottom: spacing['2xl'],
  },
  blurCard: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  cardBorder: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: spacing['2xl'],
  },
  form: {
    gap: spacing['2xl'],
  },
  inputContainer: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  input: {
    padding: spacing.lg,
    fontSize: 16,
    color: colors.onSurface,
  },
  inputInner: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  inputText: {
    color: colors.onSurface,
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: spacing.xs,
  },
  button: {
    borderRadius: radii.md,
    overflow: 'hidden',
    marginTop: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  devInfo: {
    backgroundColor: 'rgba(68, 216, 241, 0.1)',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(68, 216, 241, 0.2)',
  },
  devInfoText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.primary,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  linkText: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  forgotPasswordButton: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
})
