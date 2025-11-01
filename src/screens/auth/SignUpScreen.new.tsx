import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LinearGradient } from 'expo-linear-gradient'
import { useAppDispatch } from '@/stores/store'
import { userActions } from '@/stores/reducers'
import { ThemedText } from '@/components/ThemedText'
import { TextInput } from '@/components/TextInput'
import { SignUpSchema } from './signup.schema'
import { colors } from '@/themes'

type SignUpFormData = z.infer<typeof SignUpSchema>

export const SignUpScreenStyled: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    try {
      dispatch(userActions.userSignUp(data))
    } catch (error) {
      console.error('Sign up error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LinearGradient
      colors={['#f12711', '#f5af19', '#FFB323']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText style={styles.logo}>⚔️ VnPet</ThemedText>
            <ThemedText style={styles.title}>Start Your Journey!</ThemedText>
            <ThemedText style={styles.subtitle}>Create your trainer account</ThemedText>
          </View>

          <View style={styles.formCard}>
            <View style={styles.form}>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <ThemedText style={styles.label}>👤 Username</ThemedText>
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="none"
                      placeholder="Choose a unique username"
                      style={styles.input}
                    />
                    {errors.username && (
                      <ThemedText style={styles.errorText}>{errors.username.message}</ThemedText>
                    )}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <ThemedText style={styles.label}>📧 Email</ThemedText>
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholder="trainer@vnpet.com"
                      style={styles.input}
                    />
                    {errors.email && (
                      <ThemedText style={styles.errorText}>{errors.email.message}</ThemedText>
                    )}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <ThemedText style={styles.label}>🔒 Password</ThemedText>
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry
                      placeholder="Min 6 characters"
                      style={styles.input}
                    />
                    {errors.password && (
                      <ThemedText style={styles.errorText}>{errors.password.message}</ThemedText>
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
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <ThemedText style={styles.buttonText}>🚀 Create Account</ThemedText>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.benefitsBox}>
                <ThemedText style={styles.benefitsTitle}>🎁 New Trainer Benefits:</ThemedText>
                <ThemedText style={styles.benefitsText}>✓ 5 Hunt Tickets Daily</ThemedText>
                <ThemedText style={styles.benefitsText}>✓ 20 Battle Tickets Daily</ThemedText>
                <ThemedText style={styles.benefitsText}>✓ 1000 Coins to Start</ThemedText>
                <ThemedText style={styles.benefitsText}>✓ 50 Gems Bonus</ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>Already have an account? </ThemedText>
            <TouchableOpacity onPress={() => router.push('/sign-in')}>
              <ThemedText style={styles.linkText}>Sign In</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  form: {
    gap: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  benefitsBox: {
    backgroundColor: 'rgba(86, 171, 47, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(86, 171, 47, 0.3)',
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  benefitsText: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  linkText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
})
