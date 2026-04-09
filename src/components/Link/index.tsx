import React from 'react'

import { cn } from '@/utils/tailwind'

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  isExternal?: boolean
}

function Link({ className, isExternal, ...props }: LinkProps) {
  return (
    <a
      className={cn('text-primary hover:underline', className)}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      {...props}
    />
  )
}

export default Link
