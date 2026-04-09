import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import React from 'react'

import { blurCSS } from '@/ui/BackdropBlur'
import { getPlatform } from '@/utils/fs'
import { cn } from '@/utils/tailwind'

const { isWindows, isMacOS } = getPlatform()

interface DropdownProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root> {
  placement?: string
}
function Dropdown(props: DropdownProps) {
  return <DropdownMenuPrimitive.Root {...props} />
}

interface DropdownTriggerProps
  extends React.ComponentPropsWithoutRef<
    typeof DropdownMenuPrimitive.Trigger
  > {}
export function DropdownTrigger({ className, ...props }: DropdownTriggerProps) {
  return (
    <DropdownMenuPrimitive.Trigger
      className={cn('outline-none cursor-pointer', className)}
      {...props}
    />
  )
}

interface DropdownMenuProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> {
  variant?: string
  onAction?: (key: any) => void
}
export function DropdownMenu({ className, ...props }: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        className={cn(
          'z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 text-popover-foreground shadow-md animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          isMacOS || isWindows ? blurCSS : 'bg-white dark:bg-zinc-800',
          className,
        )}
        sideOffset={4}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

interface DropdownItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> {
  startContent?: React.ReactNode
}
export function DropdownItem({
  className,
  children,
  startContent,
  ...props
}: DropdownItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 dark:hover:bg-zinc-700 dark:focus:bg-zinc-700 focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      {startContent}
      {children}
    </DropdownMenuPrimitive.Item>
  )
}

export default Dropdown
