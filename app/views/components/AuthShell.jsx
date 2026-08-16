import { Link } from '@inertiajs/react';
import { Card, CardContent } from '@/views/components/ui/card';

/**
 * Wraps authentication forms in the Cal.com-style shadcn shell.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} root0 Component properties.
 * @param {string} root0.title Document title rendered for the Inertia page.
 * @param {string} root0.eyebrow Short contextual label displayed above the heading.
 * @param {string} root0.description Supporting copy displayed below the heading.
 * @param {import('react').ReactNode} root0.children Nested React content rendered inside the component.
 * @returns {import('react').ReactElement|string} Rendered React content.
 * @example
 * <AuthShell />
 */
export default function AuthShell({ title, eyebrow = 'The Boring Architecture', description, children }) {
    return (<main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen max-w-content items-center justify-center px-6 py-6 lg:px-8 lg:py-10">
            <section className="flex w-full items-center justify-center py-10">
                <Card className="w-full max-w-md rounded-lg border border-border shadow-card">
                    <CardContent className="p-8">
                        {eyebrow && <p className="text-[13px] font-medium text-muted-foreground">{eyebrow}</p>}
                        <h2 className={`display-sm text-foreground ${eyebrow ? 'mt-3' : ''}`}>{title}</h2>
                        {description && <div className="mt-3 text-body">{description}</div>}
                        <div className="mt-8">{children}</div>
                        <p className="mt-8 border-t border-border pt-6 text-center text-[13px] text-muted-foreground">
                            <Link href="/" className="font-medium text-foreground">Return home</Link>
                        </p>
                    </CardContent>
                </Card>
            </section>
        </div>
    </main>);
}
