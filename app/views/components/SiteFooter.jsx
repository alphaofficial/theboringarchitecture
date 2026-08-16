import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import Brand from '@/views/components/Brand.jsx';

const GITHUB_URL = 'https://github.com/alphaofficial/theboringarchitecture';

/**
 * Closes a page with the design system's single dark surface.
 * @returns {import('react').ReactElement|string} Rendered React content.
 * @example
 * <SiteFooter />
 */
export default function SiteFooter() {
    const { props } = usePage();
    const { applicationName, isAuthenticated } = props;
    const year = new Date().getFullYear();

    const groups = [
        {
            title: 'Product',
            links: [
                { label: 'Features', href: '/#features' },
                { label: 'How it works', href: '/#how' },
            ],
        },
        {
            title: 'Account',
            links: isAuthenticated
                ? [{ label: 'Your dashboard', href: '/home' }]
                : [
                    { label: 'Sign in', href: '/login' },
                    { label: 'Create account', href: '/register' },
                ],
        },
        {
            title: 'Resources',
            links: [
                { label: 'GitHub', href: GITHUB_URL, external: true },
                { label: 'Documentation', href: `${GITHUB_URL}#readme`, external: true },
            ],
        },
    ];

    return (
        <footer className="bg-surface-dark text-[#a1a1aa]">
            <div className="mx-auto max-w-content px-6 py-14 lg:px-8 lg:py-16">
                <div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.1fr_2fr]">
                    <div>
                        <Brand name={applicationName} inverse />
                        <p className="mt-5 max-w-xs text-sm">
                            A deliberately straightforward fullstack foundation for Express, Inertia, and React.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
                        {groups.map(group => (
                            <div key={group.title}>
                                <h2 className="font-sans text-sm font-semibold text-white">{group.title}</h2>
                                <ul className="mt-4 space-y-3 text-sm">
                                    {group.links.map(link => (
                                        <li key={`${group.title}-${link.label}`}>
                                            {link.external ? (
                                                <a className="inline-flex items-center gap-1 text-[#a1a1aa]" href={link.href}>
                                                    {link.label}
                                                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                                                </a>
                                            ) : (
                                                <Link className="text-[#a1a1aa]" href={link.href}>{link.label}</Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-3 pt-6 text-[13px] sm:flex-row sm:items-center sm:justify-between">
                    <p>&copy; {year} {applicationName}. MIT licensed.</p>
                </div>
            </div>
        </footer>
    );
}
