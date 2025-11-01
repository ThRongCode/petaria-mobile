import { FIELD_TYPES, IFormField } from '@/constants/interface/field'
import { IUserSignInPayload, IUserSignUpPayload } from '@/stores/types'

export const SIGNIN_FIELDS: IFormField<IUserSignInPayload>[] = [
  {
    key: 'email',
    label: 'auth.email',
    fieldType: FIELD_TYPES.input,
    isRequire: true,
    disabled: false,
    componentProps: {
      autoCapitalize: 'none',
    },
  },
  {
    key: 'password',
    label: 'auth.password',
    fieldType: FIELD_TYPES.input,
    isRequire: true,
    disabled: false,
    componentProps: {
      secureTextEntry: true,
      autoCapitalize: 'none',
    },
  },
]

export const SIGNUP_FIELDS: IFormField<IUserSignUpPayload>[] = [
  {
    key: 'username',
    label: 'auth.email', // Use existing translation key, will show as "Email" placeholder
    fieldType: FIELD_TYPES.input,
    isRequire: true,
    disabled: false,
    componentProps: {
      autoCapitalize: 'words',
      placeholder: 'Username',
    },
  },
  {
    key: 'email',
    label: 'auth.email',
    fieldType: FIELD_TYPES.input,
    isRequire: true,
    disabled: false,
    componentProps: {
      autoCapitalize: 'none',
      keyboardType: 'email-address',
    },
  },
  {
    key: 'password',
    label: 'auth.password',
    fieldType: FIELD_TYPES.input,
    isRequire: true,
    disabled: false,
    componentProps: {
      secureTextEntry: true,
      autoCapitalize: 'none',
    },
  },
]
