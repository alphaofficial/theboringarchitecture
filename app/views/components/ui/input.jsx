import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/views/lib/utils"

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

export { Input }
