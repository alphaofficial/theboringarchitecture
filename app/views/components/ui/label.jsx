import { createElement } from "react"
import { cn } from "@/views/lib/utils"

/**
 * Renders the Label UI primitive while forwarding supported element properties.
 * @param {string} props.className Additional CSS classes.
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} props.htmlFor Identifier of the labelled control.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} props Additional element properties.
 * @returns {import('react').ReactElement} Rendered Label element.
 * @example
 * <Label />
 */
function Label({
  className,
  htmlFor,
  ...props
}) {
  return createElement("label", {
      "data-slot": "label",
      htmlFor,
      className: cn(
        "flex items-center gap-2 text-sm font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      ),
      ...props,
  });
}

/** Provides the Label public API for its configured application behavior. */
export { Label }
