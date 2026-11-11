import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { LogIn } from 'lucide-react'
import { AUTH_TEXTS, ROUTES, VALIDATION_TEXTS } from '@shared/constants'
import { getErrorMessage } from '../api/client'
import { AuthLayout } from '../components/layout/AuthLayout'
import { BUTTON_SIZES, BUTTON_VARIANTS, Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ErrorBanner } from '../components/ui/ErrorBanner'
import { PasswordField } from '../components/ui/PasswordField'
import { RequiredFieldsNote } from '../components/ui/RequiredFieldsNote'
import { TextField } from '../components/ui/TextField'
import { useAuthStore } from '../stores/authStore'

export function LoginPage() {
  const login = useAuthStore((state) => state.login)
  const bootError = useAuthStore((state) => state.bootError)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  // Los errores de campos vacíos se muestran a partir del primer intento de envío.
  const [submitted, setSubmitted] = useState(false)

  const identifierError = submitted && !identifier.trim() ? VALIDATION_TEXTS.REQUIRED : undefined
  const passwordError = submitted && !password ? VALIDATION_TEXTS.REQUIRED : undefined

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    if (!identifier.trim() || !password) return
    setLoading(true)
    setError(null)
    try {
      await login({ identifier, password })
    } catch (caught) {
      setError(getErrorMessage(caught))
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Card className="p-8">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-extrabold">{AUTH_TEXTS.LOGIN_TITLE}</h1>
          <p className="text-sm text-muted">{AUTH_TEXTS.LOGIN_SUBTITLE}</p>
        </div>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <TextField
            label={AUTH_TEXTS.IDENTIFIER_LABEL}
            autoComplete="username"
            autoFocus
            required
            error={identifierError}
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
          />
          <PasswordField
            label={AUTH_TEXTS.PASSWORD_LABEL}
            autoComplete="current-password"
            required
            error={passwordError}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <RequiredFieldsNote />
          {(error ?? bootError) && <ErrorBanner message={error ?? bootError ?? ''} />}
          <Button
            type="submit"
            variant={BUTTON_VARIANTS.PRIMARY}
            size={BUTTON_SIZES.LG}
            loading={loading}
            icon={<LogIn className="size-4" />}
          >
            {AUTH_TEXTS.LOGIN_SUBMIT}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          {AUTH_TEXTS.NO_ACCOUNT}{' '}
          <Link to={ROUTES.REGISTER} className="font-semibold text-accent hover:underline">
            {AUTH_TEXTS.GO_TO_REGISTER}
          </Link>
        </p>
      </Card>
    </AuthLayout>
  )
}
