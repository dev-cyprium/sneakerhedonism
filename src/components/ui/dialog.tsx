'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { motion } from 'framer-motion'
import { XIcon } from 'lucide-react'

import { cn } from '@/utilities/cn'

type DialogContextValue = {
  open: boolean
  closing: boolean
  onCloseComplete: () => void
}

const DialogContext = React.createContext<DialogContextValue>({
  open: false,
  closing: false,
  onCloseComplete: () => {},
})

function Dialog({
  open: controlledOpen,
  onOpenChange,
  defaultOpen,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false)
  const [closing, setClosing] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const handleCloseComplete = React.useCallback(() => {
    setClosing(false)
    if (!isControlled) setInternalOpen(false)
    onOpenChange?.(false)
  }, [isControlled, onOpenChange])

  const handleOpenChange = React.useCallback(
    (value: boolean) => {
      if (value) {
        setClosing(false)
        if (!isControlled) setInternalOpen(true)
        onOpenChange?.(true)
      } else {
        setClosing(true)
      }
    },
    [isControlled, onOpenChange],
  )

  return (
    <DialogContext.Provider value={{ open, closing, onCloseComplete: handleCloseComplete }}>
      <DialogPrimitive.Root
        data-slot="dialog"
        {...props}
        open={closing ? true : (isControlled ? controlledOpen : internalOpen)}
        defaultOpen={defaultOpen}
        onOpenChange={handleOpenChange}
      />
    </DialogContext.Provider>
  )
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

const overlayVariants = {
  open: { opacity: 1 },
  closed: { opacity: 0 },
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  const { open, closing } = React.useContext(DialogContext)
  const isVisible = open && !closing

  return (
    <DialogPrimitive.Overlay asChild {...props}>
      <motion.div
        data-slot="dialog-overlay"
        className={cn('fixed inset-0 z-50 bg-black/50', className)}
        variants={overlayVariants}
        initial="closed"
        animate={isVisible ? 'open' : 'closed'}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      />
    </DialogPrimitive.Overlay>
  )
}

const contentVariants = {
  open: { opacity: 1, scale: 1 },
  closed: { opacity: 0, scale: 0.88 },
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  const { open, closing, onCloseComplete } = React.useContext(DialogContext)
  const isVisible = open && !closing

  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content asChild {...props}>
        <motion.div
          data-slot="dialog-content"
          className={cn(
            'bg-background max-h-[90vh] lg:max-h-[95vh] overflow-y-auto fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg sm:max-w-lg',
            className,
          )}
          variants={contentVariants}
          initial="closed"
          animate={isVisible ? 'open' : 'closed'}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onAnimationComplete={(definition) => {
            if (definition === 'closed' && closing) {
              onCloseComplete()
            }
          }}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </motion.div>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
