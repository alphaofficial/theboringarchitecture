import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/views/lib/utils"

/**
 * Renders the Input UI primitive while forwarding supported element properties.
 * @param {string} props.className Additional CSS classes.
 * @param {string} props.type Input type.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} props Additional element properties.
 * @returns {import('react').ReactElement} Rendered Input element.
 * @example
 * <Input />
 */
function Input({
  className,
  type,
  ...props
}) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-md border border-input bg-background px-3.5 py-2 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:ring-1 focus-visible:ring-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-strong disabled:text-muted-foreground md:text-sm",
        className
      )}
      {...props} />
  );
}

/** Provides the Input public API for its configured application behavior. */
export { Input }
