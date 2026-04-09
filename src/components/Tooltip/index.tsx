import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import React from 'react'

import { blurCSS } from '@/ui/BackdropBlur'
import { getPlatform } from '@/utils/fs'
import { cn } from '@/utils/tailwind'

const { isWindows, isMacOS } = getPlatform()

interface TooltipProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
    'content'
  > {
  content: React.ReactNode
  children: React.ReactNode
  placement?: 'top' | 'right' | 'bottom' | 'left' | string
  isDisabled?: boolean
}

function Tooltip({
  content,
  children,
  className,
  placement,
  isDisabled,
  ...props
}: TooltipProps) {
  if (isDisabled) return <>{children}</>
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root delayDuration={400}>
        <TooltipPrimitive.Trigger asChild>
          <span>{children}</span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            className={cn(
              'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
              isMacOS || isWindows ? blurCSS : 'bg-white dark:bg-zinc-800',
              className,
            )}
            {...props}
            side={placement as any}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-current text-white dark:text-zinc-800" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

export default Tooltip
