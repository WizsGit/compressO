import React from 'react'

import { cn } from '@/utils/tailwind'

interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
  value?: number | string
  onValueChange?: (value: number | undefined) => void
  label?: string
  labelPlacement?: string
  classNames?: any
  isDisabled?: boolean
}

function NumberInput({
  className,
  value,
  onValueChange,
  onChange,
  label,
  isDisabled,
  ...props
}: NumberInputProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-medium">{label}</label>}
      <input
        type="number"
        value={value}
        disabled={isDisabled || props.disabled}
        onChange={(e) => {
          if (onChange) onChange(e)
          if (onValueChange) {
            const val = e.target.value ? Number(e.target.value) : undefined
            onValueChange(val)
          }
        }}
        className={cn(
          'flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    </div>
  )
}

export default NumberInput
