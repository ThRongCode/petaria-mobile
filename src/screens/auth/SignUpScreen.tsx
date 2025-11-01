import React, { useCallback } from 'react'
import { Image, StyleSheet } from 'react-native'
import { ThemedText, ThemedView } from '@/components'
import { Images, metrics } from '@/themes'
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
    <ThemedView style={styles.container}>
      <Image source={Images.sts} style={styles.logo} />
      <ThemedText type="title" style={styles.title}>
        {getString('auth.signUp')}
      </ThemedText>
      <Form<IUserSignUpPayload> fields={SIGNUP_FIELDS} control={control} />
      <ButtonPrimary onPress={() => handleSubmit(onSubmit)()}>
        {getString('auth.signUp')}
      </ButtonPrimary>
      <Link href={RouteKeys.SignIn} style={styles.link}>
        <ThemedText type="link">Already have an account? Sign In</ThemedText>
      </Link>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: metrics.medium,
  },
  title: {
    marginTop: metrics.small,
    marginBottom: metrics.large,
  },
  logo: {
    width: metrics.logoHeight,
    height: metrics.logoHeight,
  },
  link: {
    marginTop: metrics.medium,
    paddingVertical: metrics.small,
  },
})
