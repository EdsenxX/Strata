import { useId, type TextareaHTMLAttributes } from 'react'
import { cn } from './cn'
import { FieldLabel } from './FieldLabel'
import { insetFieldClasses } from './TextField'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

export function TextArea({ label, id, className, required, ...props }: TextAreaProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <FieldLabel htmlFor={inputId} label={label} required={required} />
      <textarea
        id={inputId}
        required={required}
        rows={3}
        className={cn(insetFieldClasses, 'resize-none')}
        {...props}
      />
    </div>
  )
}
