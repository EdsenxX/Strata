import { useState, type ComponentProps } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { AUTH_TEXTS } from '@shared/constants'
import { BUTTON_SIZES, BUTTON_VARIANTS, Button } from './Button'
import { TextField } from './TextField'

type PasswordFieldProps = Omit<ComponentProps<typeof TextField>, 'type' | 'trailing'>

/** Campo de contraseña con botón para mostrar/ocultar. */
export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const toggleLabel = visible ? AUTH_TEXTS.HIDE_PASSWORD : AUTH_TEXTS.SHOW_PASSWORD
  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
        <Button
          iconOnly
          size={BUTTON_SIZES.SM}
          variant={BUTTON_VARIANTS.GHOST}
          aria-label={toggleLabel}
          title={toggleLabel}
          icon={visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          onClick={() => setVisible((current) => !current)}
        />
      }
    />
  )
}
