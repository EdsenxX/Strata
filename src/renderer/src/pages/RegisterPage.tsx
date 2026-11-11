import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router'
import { UserPlus } from 'lucide-react'
import {
  AUTH_TEXTS,
  FIELD_LIMITS,
  PASSWORD_POLICY,
  REGISTER_FIELDS,
  ROUTES,
  type RegisterField
} from '@shared/constants'
import type { RegisterInput } from '@shared/types'
import { hasErrors, validateRegistration, type RegisterErrors } from '@shared/validation'
import { getErrorMessage } from '../api/client'
import { AuthLayout } from '../components/layout/AuthLayout'
import { BUTTON_SIZES, BUTTON_VARIANTS, Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ErrorBanner } from '../components/ui/ErrorBanner'
import { PasswordChecklist } from '../components/ui/PasswordChecklist'
import { PasswordField } from '../components/ui/PasswordField'
import { TextField } from '../components/ui/TextField'
import { useAuthStore } from '../stores/authStore'

const EMPTY_FORM: RegisterInput = {
  firstNames: '',
  paternalLastName: '',
  maternalLastName: '',
  email: '',
  username: '',
  password: '',
  passwordConfirmation: ''
}

export function RegisterPage() {
  const register = useAuthStore((state) => state.register)
  const [form, setForm] = useState<RegisterInput>(EMPTY_FORM)
  // Los errores por campo se muestran a partir del primer intento de envío.
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const errors: RegisterErrors = submitted ? validateRegistration(form) : {}

  const bind = (field: RegisterField) => ({
    value: form[field],
    error: errors[field],
    onChange: (event: ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }))
  })

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    setServerError(null)
    if (hasErrors(validateRegistration(form))) return
    setLoading(true)
    try {
      await register(form)
    } catch (caught) {
      setServerError(getErrorMessage(caught))
      setLoading(false)
    }
  }

  return (
    <AuthLayout wide>
      <Card className="p-8">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-extrabold">{AUTH_TEXTS.REGISTER_TITLE}</h1>
          <p className="text-sm text-muted">{AUTH_TEXTS.REGISTER_SUBTITLE}</p>
        </div>
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            className="sm:col-span-2"
            label={AUTH_TEXTS.FIRST_NAMES_LABEL}
            autoComplete="given-name"
            autoFocus
            maxLength={FIELD_LIMITS.PERSON_NAME_MAX}
            {...bind(REGISTER_FIELDS.FIRST_NAMES)}
          />
          <TextField
            label={AUTH_TEXTS.PATERNAL_LAST_NAME_LABEL}
            autoComplete="family-name"
            maxLength={FIELD_LIMITS.PERSON_NAME_MAX}
            {...bind(REGISTER_FIELDS.PATERNAL_LAST_NAME)}
          />
          <TextField
            label={AUTH_TEXTS.MATERNAL_LAST_NAME_LABEL}
            maxLength={FIELD_LIMITS.PERSON_NAME_MAX}
            {...bind(REGISTER_FIELDS.MATERNAL_LAST_NAME)}
          />
          <TextField
            label={AUTH_TEXTS.EMAIL_LABEL}
            type="email"
            autoComplete="email"
            maxLength={FIELD_LIMITS.EMAIL_MAX}
            {...bind(REGISTER_FIELDS.EMAIL)}
          />
          <TextField
            label={AUTH_TEXTS.USERNAME_LABEL}
            autoComplete="username"
            maxLength={FIELD_LIMITS.USERNAME_MAX}
            {...bind(REGISTER_FIELDS.USERNAME)}
          />
          <PasswordField
            label={AUTH_TEXTS.PASSWORD_LABEL}
            autoComplete="new-password"
            maxLength={PASSWORD_POLICY.MAX_LENGTH}
            {...bind(REGISTER_FIELDS.PASSWORD)}
          />
          <PasswordField
            label={AUTH_TEXTS.PASSWORD_CONFIRMATION_LABEL}
            autoComplete="new-password"
            maxLength={PASSWORD_POLICY.MAX_LENGTH}
            {...bind(REGISTER_FIELDS.PASSWORD_CONFIRMATION)}
          />
          <div className="sm:col-span-2">
            <PasswordChecklist password={form.password} />
          </div>
          {serverError && (
            <div className="sm:col-span-2">
              <ErrorBanner message={serverError} />
            </div>
          )}
          <Button
            type="submit"
            className="sm:col-span-2"
            variant={BUTTON_VARIANTS.PRIMARY}
            size={BUTTON_SIZES.LG}
            loading={loading}
            icon={<UserPlus className="size-4" />}
          >
            {AUTH_TEXTS.REGISTER_SUBMIT}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          {AUTH_TEXTS.HAS_ACCOUNT}{' '}
          <Link to={ROUTES.LOGIN} className="font-semibold text-accent hover:underline">
            {AUTH_TEXTS.GO_TO_LOGIN}
          </Link>
        </p>
      </Card>
    </AuthLayout>
  )
}
