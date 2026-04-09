import * as Dialog from '@radix-ui/react-dialog'
import React from 'react'

import { BackdropBlurContent } from '@/ui/BackdropBlur'
import { getPlatform } from '@/utils/fs'
import { cn } from '@/utils/tailwind'

const { isWindows, isMacOS } = getPlatform()

interface ModalProps
  extends React.ComponentPropsWithoutRef<typeof Dialog.Root> {
  isOpen?: boolean
  onClose?: () => void
  motionVariant?: 'zoomIn' | 'bottomToTop'
}
function Modal({
  isOpen,
  onOpenChange,
  onClose,
  children,
  ...props
}: ModalProps) {
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange?.(open)
        if (!open) onClose?.()
      }}
      {...props}
    >
      {children}
    </Dialog.Root>
  )
}

interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export function ModalHeader({ className, ...props }: ModalHeaderProps) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
}

interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {}
export function ModalBody({ className, ...props }: ModalBodyProps) {
  return <div className={cn('p-6 pt-0', className)} {...props} />
}

interface ModalContentProps
  extends React.ComponentPropsWithoutRef<typeof Dialog.Content> {}
export function ModalContent({
  className,
  children,
  ...props
}: ModalContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <Dialog.Content
        className={cn(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white dark:bg-zinc-900 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full',
          isMacOS || isWindows
            ? 'bg-transparent/80 dark:bg-transparent/80'
            : '',
          className,
        )}
        {...props}
      >
        {children}
        {isMacOS || isWindows ? <BackdropBlurContent /> : null}
      </Dialog.Content>
    </Dialog.Portal>
  )
}

interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export function ModalFooter({ className, ...props }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end p-6 pt-0 space-x-2',
        className,
      )}
      {...props}
    />
  )
}

export default Modal
