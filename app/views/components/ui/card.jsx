import { cn } from "@/views/lib/utils"

/**
 * Renders the Card UI primitive while forwarding supported element properties.
 * @param {string} props.className Additional CSS classes.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} props Additional element properties.
 * @returns {import('react').ReactElement} Rendered Card element.
 * @example
 * <Card />
 */
function Card({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col overflow-hidden rounded-lg bg-card text-card-foreground",
        className
      )}
      {...props} />
  );
}

/**
 * Renders the CardHeader UI primitive while forwarding supported element properties.
 * @param {string} props.className Additional CSS classes.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} props Additional element properties.
 * @returns {import('react').ReactElement} Rendered CardHeader element.
 * @example
 * <CardHeader />
 */
function CardHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min items-start gap-1.5 px-6 pt-6",
        className
      )}
      {...props} />
  );
}

/**
 * Renders the CardTitle UI primitive while forwarding supported element properties.
 * @param {string} props.className Additional CSS classes.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} props Additional element properties.
 * @returns {import('react').ReactElement} Rendered CardTitle element.
 * @example
 * <CardTitle />
 */
function CardTitle({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-display text-lg font-semibold tracking-[-0.3px]",
        className
      )}
      {...props} />
  );
}

/**
 * Renders the CardDescription UI primitive while forwarding supported element properties.
 * @param {string} props.className Additional CSS classes.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} props Additional element properties.
 * @returns {import('react').ReactElement} Rendered CardDescription element.
 * @example
 * <CardDescription />
 */
function CardDescription({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-body", className)}
      {...props} />
  );
}

/**
 * Renders the CardAction UI primitive while forwarding supported element properties.
 * @param {string} props.className Additional CSS classes.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} props Additional element properties.
 * @returns {import('react').ReactElement} Rendered CardAction element.
 * @example
 * <CardAction />
 */
function CardAction({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props} />
  );
}

/**
 * Renders the CardContent UI primitive while forwarding supported element properties.
 * @param {string} props.className Additional CSS classes.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} props Additional element properties.
 * @returns {import('react').ReactElement} Rendered CardContent element.
 * @example
 * <CardContent />
 */
function CardContent({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 pb-6 pt-4", className)}
      {...props} />
  );
}

/**
 * Renders the CardFooter UI primitive while forwarding supported element properties.
 * @param {string} props.className Additional CSS classes.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} props Additional element properties.
 * @returns {import('react').ReactElement} Rendered CardFooter element.
 * @example
 * <CardFooter />
 */
function CardFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center border-t bg-surface-soft px-6 py-4",
        className
      )}
      {...props} />
  );
}

/** Provides the Card public API for its configured application behavior. */
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
