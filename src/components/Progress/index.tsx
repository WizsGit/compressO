import React from 'react'

import { cn } from '@/utils/tailwind'

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  classNames?: {
    base?: string
    svg?: string
    indicator?: string
    track?: string
    value?: string
  }
  isIndeterminate?: boolean
  strokeWidth?: number
}

function CircularProgress({
  value,
  classNames,
  className,
  ...props
}: CircularProgressProps) {
  if (value !== undefined) {
    return (
      <div
        className={cn(
          'relative inline-flex items-center justify-center',
          className,
        )}
        {...props}
      >
        <svg
          className={cn('w-10 h-10 transform -rotate-90', classNames?.svg)}
          viewBox="0 0 100 100"
        >
          <circle
            className="text-gray-200 stroke-current"
            strokeWidth="10"
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
          ></circle>
          <circle
            className={cn(
              'text-primary stroke-current transition-all duration-300',
              classNames?.indicator,
            )}
            strokeWidth="10"
            strokeLinecap="round"
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - value / 100)}`}
          ></circle>
        </svg>
      </div>
    )
  }
  return (
    <div
      className={cn(
        'animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-primary rounded-full',
        className,
      )}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default CircularProgress
