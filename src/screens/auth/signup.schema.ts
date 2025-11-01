import { getString } from '@/locale/I18nConfig'
import { IUserSignUpPayload } from '@/stores/types'
import { ZodType, z } from 'zod'

export const SignUpSchema: ZodType<IUserSignUpPayload> = z.object({
  username: z
    .string({ required_error: getString('validations.required', { field: 'Username' }) })
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(20, { message: 'Username must be less than 20 characters' }),
  email: z
    .string({ required_error: getString('validations.required', { field: getString('auth.email') }) })
    .email({ message: getString('auth.validation.email') }),
  password: z
    .string({ required_error: getString('validations.required', { field: getString('auth.password') }) })
    .min(8, { message: getString('auth.validation.password') }),
})
