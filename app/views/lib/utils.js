import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/** Merges conditional class names and resolves conflicting Tailwind utilities.
 * @param {Array} inputs Class-name values merged into a single Tailwind-compatible string.
 * @returns {Record<string, string|number|boolean|null>} Configured runtime interface.
 * @example
 * cn(inputs);
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
