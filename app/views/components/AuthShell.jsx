import { Link } from '@inertiajs/react';
import { Check } from 'lucide-react';
import Brand from '@/views/components/Brand.jsx';
import { Card, CardContent } from '@/views/components/ui/card';

/**
 * Wraps authentication forms in the Cal.com-style shadcn shell.
 *
 * @param {{title: string, eyebrow?: string, description?: import('react').ReactNode, children: import('react').ReactNode}} props - Auth shell content.
 * @returns {import('react').ReactElement} The authentication shell.
 */
export default function AuthShell({ title, eyebrow = 'The Boring Architecture', description, children }) {
    return (<main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto grid min-h-screen max-w-content grid-cols-1 px-6 py-6 lg:grid-cols-[1fr_0.95fr] lg:gap-14 lg:px-8 lg:py-10">
            <section className="flex flex-col justify-between rounded-xl bg-surface-card p-8 lg:p-12">
                <Brand />
                <div className="py-16 lg:py-0">
                    <p className="text-[13px] font-medium text-muted-foreground">Express + Inertia + React</p>
                    <h1 className="display-lg mt-4 max-w-lg text-foreground">Boring until complexity forces otherwise.</h1>
                    <p className="mt-5 max-w-md text-base leading-6 text-body">A fullstack starter with server-rendered React, sessions, auth, ORM, migrations, and a direct path to production.</p>
                </div>
                <div className="grid gap-3 rounded-lg border border-border bg-background p-5 text-sm text-body">
                    {['Server-rendered React', 'Session-backed authentication', 'Production-ready primitives'].map(item => (
                        <div key={item} className="flex items-center gap-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-card text-ink">
                                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                            </span>
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            </section>
            <section className="flex items-center justify-center py-10">
                <Card className="w-full max-w-md rounded-lg border border-border shadow-card">
                    <CardContent className="p-8">
                        <p className="text-[13px] font-medium text-muted-foreground">{eyebrow}</p>
                        <h2 className="display-sm mt-3 text-foreground">{title}</h2>
                        {description && <div className="mt-3 text-sm leading-6 text-body">{description}</div>}
                        <div className="mt-8">{children}</div>
                        <p className="mt-8 border-t border-border pt-6 text-center text-[13px] text-muted-foreground">
                            <Link href="/" className="font-medium text-foreground">Return to the homepage</Link>
                        </p>
                    </CardContent>
                </Card>
            </section>
        </div>
    </main>);
}
