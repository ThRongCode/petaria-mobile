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
import { colors, metrics } from '@/themes'

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
    defaultValues: {
      email: 'test@vnpet.com',
      password: 'password123',
    },
  })

  const onSubmit = async (data: SignInFormData) => {
    console.log('🔐 Sign in attempt:', { email: data.email })
    setIsLoading(true)
    try {
      dispatch(userActions.userLogin(data))
      console.log('✅ Dispatched userLogin action')
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
          {/* Logo/Title Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
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
                      colors={['#56ab2f', '#a8e063']}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {isLoading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator color="#fff" size="small" />
                          <ThemedText style={styles.buttonText}>Signing in...</ThemedText>
                        </View>
                      ) : (
                        <ThemedText style={styles.buttonText}>🎯 Sign In</ThemedText>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Dev Info */}
                  <View style={styles.devInfo}>
                    <ThemedText style={styles.devInfoText}>
                      🧪 Dev Mode: Credentials pre-filled
                    </ThemedText>
                  </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667eea',
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
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  formCard: {
    marginBottom: 24,
  },
  blurCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardBorder: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  inputWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  input: {
    padding: 14,
    fontSize: 16,
    color: '#fff',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#56ab2f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  devInfo: {
    backgroundColor: 'rgba(86, 171, 47, 0.15)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(86, 171, 47, 0.3)',
  },
  devInfoText: {
    fontSize: 12,
    color: '#a8e063',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  linkText: {
    fontSize: 15,
    color: '#a8e063',
    fontWeight: 'bold',
  },
})
