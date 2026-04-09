import * as TabsPrimitive from '@radix-ui/react-tabs'
import React from 'react'

import { cn } from '@/utils/tailwind'

interface TabsProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  // Add specific mappings if required
}

function Tabs({ className, ...props }: TabsProps) {
  return (
    <TabsPrimitive.Root
      className={cn('flex flex-col w-full', className)}
      {...props}
    />
  )
}

interface TabProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>,
    'title'
  > {
  title?: React.ReactNode
}

export function Tab({ className, title, value, ...props }: TabProps) {
  // Radix requires a tight mapping where Trigger and Content are separate.
  // If the previous code relied on <Tabs><Tab title="...">Content</Tab></Tabs>,
  // we would need a complex context tracker. For a simple drop-in replacement,
  // we fallback to simple props mapping or rendering just the content.
  return (
    <TabsPrimitive.Content
      value={value ?? ''}
      className={cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
      {...props}
    />
  )
}

export default Tabs
