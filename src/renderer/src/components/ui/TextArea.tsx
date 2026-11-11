import { useId, type TextareaHTMLAttributes } from 'react'
import { cn } from './cn'
import { insetFieldClasses } from './TextField'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

export function TextArea({ label, id, className, ...props }: TextAreaProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={inputId} className="pl-1 text-xs font-semibold text-muted">
        {label}
      </label>
      <textarea id={inputId} rows={3} className={cn(insetFieldClasses, 'resize-none')} {...props} />
    </div>
  )
}
