import { Children, cloneElement, isValidElement } from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva } from "class-variance-authority";

import { cn } from "@/views/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md border text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-[#e5e7eb] disabled:text-[#6b7280] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
  {
    variants: {
      variant: {
        default: "border-primary bg-primary text-primary-foreground active:bg-primary-active",
        outline:
          "border-border bg-background text-foreground active:bg-surface-soft",
        secondary:
          "border-border bg-secondary text-secondary-foreground active:bg-surface-soft",
        ghost:
          "border-transparent bg-transparent text-foreground active:bg-surface-soft",
        destructive:
          "border-transparent bg-destructive text-white active:bg-red-600",
        link: "h-auto border-transparent bg-transparent p-0 text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-2 px-5",
        xs: "h-8 gap-1.5 px-3 text-xs",
        sm: "h-9 gap-1.5 px-4 text-sm",
        lg: "h-11 gap-2 px-6 text-sm",
        icon: "h-9 w-9 rounded-full",
        "icon-xs": "h-8 w-8 rounded-full [&_svg]:size-3.5",
        "icon-sm": "h-9 w-9 rounded-full",
        "icon-lg": "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * Renders the Button UI primitive while forwarding supported element properties.
 * @param {string} props.className Additional CSS classes.
 * @param {string} props.variant Visual variant.
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} props.size Control size.
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} props.asChild Whether to render through the child slot.
 * @param {import('react').ReactNode} props.children Nested content.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} props Additional element properties.
 * @returns {import('react').ReactElement} Rendered Button element.
 * @example
 * <Button />
 */
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  ...props
}) {
  const classes = cn(buttonVariants({ variant, size, className }));

  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) {
      return null;
    }
    return cloneElement(child, {
      ...props,
      className: cn(classes, child.props.className),
    });
  }

  return (
    <ButtonPrimitive
      data-slot="button"
      className={classes}
      {...props}>
      {children}
    </ButtonPrimitive>
  );
}

/** Provides the Button public API for its configured application behavior. */
export { Button, buttonVariants }
