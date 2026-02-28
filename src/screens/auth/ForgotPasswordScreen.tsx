import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import { authApi } from '@/services/api'
import { ThemedText } from '@/components/ThemedText'
import { TextInput } from '@/components/TextInput'

// ── Validation Schemas ──────────────────────────────────────────
const EmailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
})

const ResetSchema = z
  .object({
    code: z.string().length(6, 'Reset code must be exactly 6 digits'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type EmailFormData = z.infer<typeof EmailSchema>
type ResetFormData = z.infer<typeof ResetSchema>

type Step = 'email' | 'reset' | 'success'

/**
 * ForgotPasswordScreen — Full forgot-password flow (API-first):
 *  1. Enter email → POST /auth/forgot-password
 *  2. Enter reset code + new password → POST /auth/reset-password
 *  3. Success confirmation → navigate to sign-in
 */
export const ForgotPasswordScreen: React.FC = () => {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailForReset, setEmailForReset] = useState('')

  // ── Email Form ──────────────────────────────────────────────
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(EmailSchema),
    defaultValues: { email: '' },
  })

  // ── Reset Form ──────────────────────────────────────────────
  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(ResetSchema),
    defaultValues: { code: '', newPassword: '', confirmPassword: '' },
  })

  const handleSendEmail = async (data: EmailFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authApi.forgotPassword(data.email)
      if (response.success) {
        setEmailForReset(data.email)
        setStep('reset')
      } else {
        setError('Failed to send reset email')
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (data: ResetFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authApi.resetPassword(emailForReset, data.code, data.newPassword)
      if (response.success) {
        setStep('success')
      } else {
        setError('Failed to reset password')
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
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
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          {/* ── Step 1: Email ── */}
          {step === 'email' && (
            <>
              <View style={styles.header}>
                <View style={styles.iconCircle}>
                  <Ionicons name="lock-open" size={36} color="#667eea" />
                </View>
                <ThemedText style={styles.title}>Forgot Password?</ThemedText>
                <ThemedText style={styles.subtitle}>
                  Enter your email and we'll send you a reset code
                </ThemedText>
              </View>

              <View style={styles.formCard}>
                <BlurView intensity={20} tint="dark" style={styles.blurCard}>
                  <View style={styles.cardBorder}>
                    <View style={styles.form}>
                      <Controller
                        control={emailForm.control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>📧 Email</ThemedText>
                            <View style={styles.inputWrapper}>
                              <TextInput
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholder="trainer@vnpet.com"
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                style={styles.input}
                                inputContainerStyle={styles.inputContainer}
                                inputStyle={styles.inputText}
                              />
                            </View>
                            {emailForm.formState.errors.email && (
                              <ThemedText style={styles.errorText}>
                                ⚠️ {emailForm.formState.errors.email.message}
                              </ThemedText>
                            )}
                          </View>
                        )}
                      />

                      {error && <ThemedText style={styles.apiError}>{error}</ThemedText>}

                      <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={emailForm.handleSubmit(handleSendEmail)}
                        disabled={isLoading}
                      >
                        <LinearGradient
                          colors={['#667eea', '#764ba2']}
                          style={styles.buttonGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          {isLoading ? (
                            <ActivityIndicator color="#fff" size="small" />
                          ) : (
                            <ThemedText style={styles.buttonText}>Send Reset Code</ThemedText>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </BlurView>
              </View>
            </>
          )}

          {/* ── Step 2: Reset Code + New Password ── */}
          {step === 'reset' && (
            <>
              <View style={styles.header}>
                <View style={styles.iconCircle}>
                  <Ionicons name="key" size={36} color="#56ab2f" />
                </View>
                <ThemedText style={styles.title}>Enter Reset Code</ThemedText>
                <ThemedText style={styles.subtitle}>
                  Check your email for the reset code, then choose a new password
                </ThemedText>
              </View>

              <View style={styles.formCard}>
                <BlurView intensity={20} tint="dark" style={styles.blurCard}>
                  <View style={styles.cardBorder}>
                    <View style={styles.form}>
                      <Controller
                        control={resetForm.control}
                        name="code"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>🔑 Reset Code</ThemedText>
                            <View style={styles.inputWrapper}>
                              <TextInput
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                autoCapitalize="none"
                                keyboardType="number-pad"
                                maxLength={6}
                                placeholder="6-digit code"
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                style={styles.input}
                                inputContainerStyle={styles.inputContainer}
                                inputStyle={styles.inputText}
                              />
                            </View>
                            {resetForm.formState.errors.code && (
                              <ThemedText style={styles.errorText}>
                                ⚠️ {resetForm.formState.errors.code.message}
                              </ThemedText>
                            )}
                          </View>
                        )}
                      />

                      <Controller
                        control={resetForm.control}
                        name="newPassword"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>🔒 New Password</ThemedText>
                            <View style={styles.inputWrapper}>
                              <TextInput
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                secureTextEntry
                                placeholder="Min 6 characters"
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                style={styles.input}
                                inputContainerStyle={styles.inputContainer}
                                inputStyle={styles.inputText}
                              />
                            </View>
                            {resetForm.formState.errors.newPassword && (
                              <ThemedText style={styles.errorText}>
                                ⚠️ {resetForm.formState.errors.newPassword.message}
                              </ThemedText>
                            )}
                          </View>
                        )}
                      />

                      <Controller
                        control={resetForm.control}
                        name="confirmPassword"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>🔒 Confirm Password</ThemedText>
                            <View style={styles.inputWrapper}>
                              <TextInput
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                secureTextEntry
                                placeholder="Re-enter new password"
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                style={styles.input}
                                inputContainerStyle={styles.inputContainer}
                                inputStyle={styles.inputText}
                              />
                            </View>
                            {resetForm.formState.errors.confirmPassword && (
                              <ThemedText style={styles.errorText}>
                                ⚠️ {resetForm.formState.errors.confirmPassword.message}
                              </ThemedText>
                            )}
                          </View>
                        )}
                      />

                      {error && <ThemedText style={styles.apiError}>{error}</ThemedText>}

                      <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={resetForm.handleSubmit(handleResetPassword)}
                        disabled={isLoading}
                      >
                        <LinearGradient
                          colors={['#56ab2f', '#a8e063']}
                          style={styles.buttonGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          {isLoading ? (
                            <ActivityIndicator color="#fff" size="small" />
                          ) : (
                            <ThemedText style={styles.buttonText}>Reset Password</ThemedText>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.resendButton}
                        onPress={() => {
                          setStep('email')
                          setError(null)
                        }}
                      >
                        <ThemedText style={styles.resendText}>← Back to email</ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </BlurView>
              </View>
            </>
          )}

          {/* ── Step 3: Success ── */}
          {step === 'success' && (
            <View style={styles.successContainer}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(86,171,47,0.15)' }]}>
                <Ionicons name="checkmark-circle" size={48} color="#56ab2f" />
              </View>
              <ThemedText style={styles.title}>Password Reset!</ThemedText>
              <ThemedText style={styles.subtitle}>
                Your password has been updated successfully. You can now sign in with your new
                password.
              </ThemedText>

              <TouchableOpacity style={styles.button} onPress={() => router.replace('/sign-in')}>
                <LinearGradient
                  colors={['#56ab2f', '#a8e063']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <ThemedText style={styles.buttonText}>🎯 Go to Sign In</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(102,126,234,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  formCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  blurCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardBorder: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  form: {
    padding: 24,
    gap: 20,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  inputWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  input: {
    backgroundColor: 'transparent',
  },
  inputContainer: {
    borderBottomWidth: 0,
    paddingHorizontal: 0,
  },
  inputText: {
    color: '#fff',
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
  },
  apiError: {
    color: '#FF6B6B',
    fontSize: 13,
    textAlign: 'center',
    backgroundColor: 'rgba(255,107,107,0.1)',
    padding: 10,
    borderRadius: 8,
  },
  button: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  successContainer: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
})
