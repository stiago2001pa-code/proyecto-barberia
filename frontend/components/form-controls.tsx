import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react"
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  hint?: string
}

export function FormInput({ id, label, hint, className, ...props }: FormInputProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input id={id} className={cn("h-11 bg-background/70", className)} {...props} />
      {hint ? <FieldDescription>{hint}</FieldDescription> : null}
    </Field>
  )
}

type FormTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string
  label: string
  hint?: string
}

export function FormTextarea({ id, label, hint, className, ...props }: FormTextareaProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea id={id} className={cn("min-h-24 bg-background/70", className)} {...props} />
      {hint ? <FieldDescription>{hint}</FieldDescription> : null}
    </Field>
  )
}

export interface FormOption {
  value: string
  label: string
}

type FormSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string
  label: string
  options: FormOption[]
  placeholder?: string
  hint?: string
}

export function FormSelect({
  id,
  label,
  options,
  placeholder,
  hint,
  className,
  ...props
}: FormSelectProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <select
        id={id}
        className={cn(
          "flex h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <FieldDescription>{hint}</FieldDescription> : null}
    </Field>
  )
}
