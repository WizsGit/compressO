import React from 'react'

import { cn } from '@/utils/tailwind'

interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical'
}

function Divider({
  className,
  orientation = 'horizontal',
  ...props
}: DividerProps) {
  return (
    <hr
      className={cn(
        'shrink-0 bg-zinc-200 dark:bg-zinc-800 border-none',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className,
      )}
      {...props}
    />
  )
}

export default Divider
