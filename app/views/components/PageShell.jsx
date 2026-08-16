import Navigation from '@/views/components/Navigation.jsx';

/**
 * Wraps authenticated and public app pages in the shared product shell.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} root0 Component properties.
 * @param {string} root0.eyebrow Short contextual label displayed above the heading.
 * @param {string} root0.title Document title rendered for the Inertia page.
 * @param {string} root0.description Supporting copy displayed below the heading.
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} root0.actions Action controls displayed alongside the heading.
 * @param {import('react').ReactNode} root0.children Nested React content rendered inside the component.
 * @returns {import('react').ReactElement|string} Rendered React content.
 * @example
 * <PageShell />
 */
export default function PageShell({ eyebrow = 'The Boring Architecture', title, description, actions, children }) {
    return (<div className="flex min-h-screen flex-col bg-background text-foreground">
        <Navigation />
        <main className="mx-auto w-full max-w-content flex-1 px-6 py-12 lg:px-8 lg:py-16">
            <section className="mb-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                    {eyebrow && <p className="text-[13px] font-medium text-muted-foreground">{eyebrow}</p>}
                    <h1 className="display-md text-foreground">{title}</h1>
                    {description && <div className="mt-3 max-w-2xl text-body">{description}</div>}
                </div>
                {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
            </section>
            {children}
        </main>
    </div>);
}
