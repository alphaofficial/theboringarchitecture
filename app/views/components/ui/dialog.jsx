"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { XIcon } from "lucide-react"
import { cn } from "@/views/lib/utils"
import { Button } from "@/views/components/ui/button"

/**
 * Renders the Dialog UI primitive while forwarding supported element properties.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} props Additional element properties.
 * @returns {import('react').ReactElement} Rendered Dialog element.
 * @example
 * <Dialog />
 */
function Dialog({
  ...props
}) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

/**
 * Renders the DialogTrigger UI primitive while forwarding supported element properties.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} props Additional element properties.
 * @returns {import('react').ReactElement} Rendered DialogTrigger element.
 * @example
 * <DialogTrigger />
 */
function DialogTrigger({
  ...props
}) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

/**
 * Renders the DialogPortal UI primitive while forwarding supported element properties.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} props Additional element properties.
 * @returns {import('react').ReactElement} Rendered DialogPortal element.
 * @example
 * <DialogPortal />
 */
function DialogPortal({
  ...props
}) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

/**
 * Renders the DialogClose UI primitive while forwarding supported element properties.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} props Additional element properties.
 * @returns {import('react').ReactElement} Rendered DialogClose element.
 * @example
 * <DialogClose />
 */
function DialogClose({
  ...props
}) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

/**
 * Renders the DialogOverlay UI primitive while forwarding supported element properties.
 * @param {string} props.className Additional CSS classes.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} props Additional element properties.
 * @returns {import('react').ReactElement} Rendered DialogOverlay element.
 * @example
 * <DialogOverlay />
 */
function DialogOverlay({
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props} />
  );
}

/**
 * Renders the DialogContent UI primitive while forwarding supported element properties.
 * @param {string} props.className Additional CSS classes.
 * @param {import('react').ReactNode} props.children Nested content.
 * @param {boolean} props.showCloseButton Whether to display the close button.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} props Additional element properties.
 * @returns {import('react').ReactElement} Rendered DialogContent element.
 * @example
 * <DialogContent />
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}>
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button variant="ghost" className="absolute top-2 right-2" size="icon-sm" />
            }>
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

/**
 * Renders the DialogHeader UI primitive while forwarding supported element properties.
 * @param {string} props.className Additional CSS classes.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} props Additional element properties.
 * @returns {import('react').ReactElement} Rendered DialogHeader element.
 * @example
 * <DialogHeader />
 */
function DialogHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props} />
  );
}

/**
 * Renders the DialogFooter UI primitive while forwarding supported element properties.
 * @param {string} props.className Additional CSS classes.
 * @param {boolean} props.showCloseButton Whether to display the close button.
 * @param {import('react').ReactNode} props.children Nested content.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} props Additional element properties.
 * @returns {import('react').ReactElement} Rendered DialogFooter element.
 * @example
 * <DialogFooter />
 */
function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}>
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

/**
 * Renders the DialogTitle UI primitive while forwarding supported element properties.
 * @param {string} props.className Additional CSS classes.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} props Additional element properties.
 * @returns {import('react').ReactElement} Rendered DialogTitle element.
 * @example
 * <DialogTitle />
 */
function DialogTitle({
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("font-heading text-base font-medium", className)}
      {...props} />
  );
}

/**
 * Renders the DialogDescription UI primitive while forwarding supported element properties.
 * @param {string} props.className Additional CSS classes.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} props Additional element properties.
 * @returns {import('react').ReactElement} Rendered DialogDescription element.
 * @example
 * <DialogDescription />
 */
function DialogDescription({
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props} />
  );
}

/** Provides the Dialog public API for its configured application behavior. */
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
