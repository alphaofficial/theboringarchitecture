import { Link } from '@inertiajs/react';
import { cn } from '@/views/lib/utils';

/**
 * Renders the shared product wordmark.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} root0 Component properties.
 * @param {string} root0.name Display name used to personalize the generated content.
 * @param {string} root0.href Destination followed when the brand link is activated.
 * @param {boolean} root0.inverse Whether to use colors suitable for a dark background.
 * @param {boolean} root0.compact Whether to render the condensed brand treatment.
 * @param {string} root0.className Additional CSS classes applied to the rendered element.
 * @returns {import('react').ReactElement|string} Rendered React content.
 * @example
 * <Brand />
 */
export default function Brand({
    name = 'The Boring Architecture',
    href = '/',
    inverse = false,
    compact = false,
    className,
    ...props
}) {
    return (
        <Link
            href={href}
            className={cn(
                'inline-flex items-center gap-2.5 font-display text-[17px] font-semibold tracking-[-0.4px]',
                inverse ? 'text-white' : 'text-ink',
                className,
            )}
            {...props}
        >
            <span
                className={cn(
                    'relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                    inverse ? 'bg-white text-ink' : 'bg-primary text-primary-foreground',
                )}
                aria-hidden="true"
            >
                <span className="absolute left-[7px] top-[7px] h-[7px] w-[7px] rounded-[2px] bg-current" />
                <span className="absolute bottom-[7px] right-[7px] h-[10px] w-[10px] rounded-[3px] border-2 border-current" />
            </span>
            <span className={compact ? 'hidden sm:inline' : ''}>{name}</span>
        </Link>
    );
}
