import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import React from 'react'

import { blurCSS } from '@/ui/BackdropBlur'
import { getPlatform } from '@/utils/fs'
import { cn } from '@/utils/tailwind'

const { isWindows, isMacOS } = getPlatform()

interface SelectProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
  label?: string
  placeholder?: string
  className?: string
  fullWidth?: boolean
  selectedKeys?: any[]
  onChange?: (e: any) => void
  labelPlacement?: string
  size?: string
  selectionMode?: string
  classNames?: any
  isDisabled?: boolean
}

function Select({
  className,
  label,
  placeholder,
  children,
  fullWidth,
  selectedKeys,
  onChange,
  isDisabled,
  value,
  onValueChange,
  ...props
}: SelectProps) {
  const currentValue =
    selectedKeys && selectedKeys.length > 0 ? selectedKeys[0] : value
  const handleChange = (v: string) => {
    if (onValueChange) onValueChange(v)
    if (onChange) onChange({ target: { value: v } })
  }

  return (
    <SelectPrimitive.Root
      value={currentValue}
      onValueChange={handleChange}
      disabled={isDisabled || props.disabled}
      {...props}
    >
      <SelectPrimitive.Trigger
        className={cn(
          'flex h-8 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            'relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80',
            isMacOS || isWindows ? blurCSS : 'bg-white dark:bg-zinc-800',
          )}
          position="popper"
          sideOffset={4}
        >
          <SelectPrimitive.Viewport className="p-1">
            {children}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

interface SelectItemProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>,
    'content'
  > {
  endContent?: React.ReactNode
}

export function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-gray-100 dark:hover:bg-zinc-700',
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

export default Select
