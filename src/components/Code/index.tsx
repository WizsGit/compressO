import React from 'react'

import { cn } from '@/utils/tailwind'

interface CodeProps extends React.HTMLAttributes<HTMLElement> {}

function Code({ className, ...props }: CodeProps) {
  return (
    <code
      className={cn(
        'px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-sm font-mono text-primary',
        className,
      )}
      {...props}
    />
  )
}

export default Code
