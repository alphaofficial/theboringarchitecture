import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva } from "class-variance-authority";

import { cn } from "@/views/lib/utils"

const badgeVariants = cva(
  "inline-flex min-h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-pill border border-transparent px-3 py-1 text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring [&>svg]:pointer-events-none [&>svg]:h-3 [&>svg]:w-3",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary:
          "bg-surface-card text-foreground",
        destructive:
          "bg-red-50 text-destructive",
        outline:
          "border-border bg-background text-foreground",
        ghost:
          "text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Renders the Badge UI primitive while forwarding supported element properties.
 * @param {string} props.className Additional CSS classes.
 * @param {string} props.variant Visual variant.
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} props.render Element or component used for rendering.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} props Additional element properties.
 * @returns {import('react').ReactElement} Rendered Badge element.
 * @example
 * <Badge />
 */
function Badge({
  className,
  variant = "default",
  render,
  ...props
}) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps({
      className: cn(badgeVariants({ variant }), className),
    }, props),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

/** Provides the Badge public API for its configured application behavior. */
export { Badge, badgeVariants }
