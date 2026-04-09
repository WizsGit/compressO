import React from 'react'

import { cn } from '@/utils/tailwind'

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  color?: 'current' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
}

function Spinner({
  className,
  size = 'md',
  color = 'current',
  ...props
}: SpinnerProps) {
  return (
    <div
      className={cn(
        'inline-block border-2 border-current border-t-transparent rounded-full animate-spin',
        size === 'sm' && 'w-4 h-4',
        size === 'md' && 'w-6 h-6 border-4',
        size === 'lg' && 'w-8 h-8 border-4',
        color === 'primary' && 'text-primary',
        color === 'secondary' && 'text-secondary',
        color === 'current' && 'text-current',
        className,
      )}
      role="status"
      aria-label="loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default Spinner
