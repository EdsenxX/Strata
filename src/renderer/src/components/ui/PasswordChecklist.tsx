import { Check, X } from 'lucide-react'
import { AUTH_TEXTS, PASSWORD_RULE_LABELS } from '@shared/constants'
import { evaluatePassword } from '@shared/validation'
import { cn } from './cn'

/** Checklist en vivo de los requisitos de contraseña robusta. */
export function PasswordChecklist({ password }: { password: string }) {
  const rules = evaluatePassword(password)
  return (
    <div className="rounded-neu-sm p-4 shadow-neu-inset-sm" aria-live="polite">
      <p className="mb-2 text-xs font-semibold text-muted">{AUTH_TEXTS.PASSWORD_CHECKLIST_TITLE}</p>
      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {rules.map((rule) => (
          <li
            key={rule.id}
            className={cn(
              'flex items-center gap-2 text-xs transition-colors',
              rule.passed ? 'text-success' : 'text-muted'
            )}
          >
            <span
              className={cn(
                'flex size-5 items-center justify-center rounded-full',
                rule.passed ? 'shadow-neu-inset-sm' : 'shadow-neu-sm'
              )}
            >
              {rule.passed ? <Check className="size-3" /> : <X className="size-3" />}
            </span>
            {PASSWORD_RULE_LABELS[rule.id]}
          </li>
        ))}
      </ul>
    </div>
  )
}
