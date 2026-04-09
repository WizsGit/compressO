import * as SwitchPrimitive from '@radix-ui/react-switch'
import React from 'react'

import { cn } from '@/utils/tailwind'

interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  size?: 'sm' | 'md' | 'lg'
  isSelected?: boolean
  isDisabled?: boolean
  onValueChange?: (isSelected: boolean) => void
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(
  (
    {
      className,
      size = 'sm',
      isSelected,
      checked,
      isDisabled,
      disabled,
      onValueChange,
      onCheckedChange,
      ...props
    },
    ref,
  ) => (
    <SwitchPrimitive.Root
      disabled={isDisabled ?? disabled}
      checked={isSelected ?? checked}
      onCheckedChange={(c) => {
        onCheckedChange?.(c)
        onValueChange?.(c)
      }}
      className={cn(
        'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-zinc-700',
        size === 'sm' && 'h-4 w-8',
        size === 'md' && 'h-6 w-11',
        size === 'lg' && 'h-8 w-14',
        className,
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0',
          size === 'sm' && 'h-3 w-3 data-[state=checked]:translate-x-4',
          size === 'md' && 'h-5 w-5 data-[state=checked]:translate-x-5',
          size === 'lg' && 'h-7 w-7 data-[state=checked]:translate-x-6',
        )}
      />
    </SwitchPrimitive.Root>
  ),
)
Switch.displayName = SwitchPrimitive.Root.displayName

export default Switch
