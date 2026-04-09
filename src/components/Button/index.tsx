import React from 'react'

import { cn } from '@/utils/tailwind'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | string
  variant?:
    | 'solid'
    | 'bordered'
    | 'light'
    | 'flat'
    | 'faded'
    | 'shadow'
    | 'ghost'
    | string
  size?: 'sm' | 'md' | 'lg' | string
  isIconOnly?: boolean
  fullWidth?: boolean
  isLoading?: boolean
  isDisabled?: boolean
  onPress?: (e: any) => void
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      variant = 'flat',
      size = 'md',
      className,
      isIconOnly,
      fullWidth,
      isLoading,
      isDisabled,
      onPress,
      onClick,
      ...rest
    } = props

    return (
      <button
        ref={ref}
        disabled={isDisabled || rest.disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-opacity hover:opacity-80 active:scale-95 disabled:pointer-events-none disabled:opacity-50 select-none',
          size === 'sm' && 'h-8 px-3 text-xs',
          size === 'md' && 'h-10 px-4 text-sm',
          size === 'lg' && 'h-12 px-6 text-base',
          isIconOnly && '!px-0 w-10 min-w-10',
          variant === 'flat' && 'bg-primary/20 text-primary',
          variant === 'solid' && 'bg-primary text-white',
          variant === 'light' &&
            'bg-transparent text-primary hover:bg-primary/10',
          ['bg-transparent', 'border', 'border-gray-200'].includes(variant) &&
            variant === 'bordered',
          fullWidth && 'w-full',
          className,
        )}
        onClick={onPress || onClick}
        {...rest}
      />
    )
  },
)
Button.displayName = 'Button'

export default Button
