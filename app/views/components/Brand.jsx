import { Link } from '@inertiajs/react';
import { cn } from '@/views/lib/utils';

/**
 * Renders the shared product wordmark.
 *
 * @param {{name?: string, inverse?: boolean, compact?: boolean, className?: string}} props - Wordmark options.
 * @returns {import('react').ReactElement} Linked brand mark and name.
 */
export default function Brand({
    name = 'The Boring Architecture',
    inverse = false,
    compact = false,
    className,
    ...props
}) {
    return (
        <Link
            href="/"
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
