import Navigation from '@/views/components/Navigation.jsx';
import SiteFooter from '@/views/components/SiteFooter.jsx';

/**
 * Wraps authenticated and public app pages in the shared product shell.
 *
 * @param {{eyebrow?: string, title: string, description?: import('react').ReactNode, actions?: import('react').ReactNode, children: import('react').ReactNode}} props - Page shell content.
 * @returns {import('react').ReactElement} The page shell.
 */
export default function PageShell({ eyebrow = 'The Boring Architecture', title, description, actions, children }) {
    return (<div className="flex min-h-screen flex-col bg-background text-foreground">
        <Navigation />
        <main className="mx-auto w-full max-w-content flex-1 px-6 py-12 lg:px-8 lg:py-16">
            <section className="mb-8 grid gap-8 rounded-lg bg-surface-card p-8 md:grid-cols-[1fr_auto] md:items-end lg:p-10">
                <div>
                    <p className="text-[13px] font-medium text-muted-foreground">{eyebrow}</p>
                    <h1 className="display-lg mt-3 text-foreground">{title}</h1>
                    {description && <div className="mt-4 max-w-2xl text-base leading-6 text-body">{description}</div>}
                </div>
                {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
            </section>
            {children}
        </main>
        <SiteFooter />
    </div>);
}
