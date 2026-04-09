import * as SliderPrimitive from '@radix-ui/react-slider'
import React from 'react'

import { cn } from '@/utils/tailwind'

interface SliderProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    'onChange'
  > {
  label?: React.ReactNode | boolean
  onChange?: (value: number | number[]) => void
  size?: 'sm' | 'md' | 'lg' | string
  marks?: any[]
  classNames?: any
  getValue?: (value: any) => React.ReactNode
  renderValue?: (props: any) => React.ReactNode
  isDisabled?: boolean
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      label,
      onChange,
      isDisabled,
      size,
      marks,
      classNames,
      getValue,
      renderValue,
      ...props
    },
    ref,
  ) => (
    <div className={cn('flex flex-col w-full gap-2', className)}>
      {label && <label className="text-sm font-medium">{label}</label>}
      <SliderPrimitive.Root
        ref={ref}
        className="relative flex w-full touch-none select-none items-center"
        onValueChange={onChange}
        disabled={isDisabled || props.disabled}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
    </div>
  ),
)
Slider.displayName = SliderPrimitive.Root.displayName

export default Slider
