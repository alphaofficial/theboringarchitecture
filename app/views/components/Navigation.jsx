import { useState } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import Brand from '@/views/components/Brand.jsx';
import { Button } from '@/views/components/ui/button';
/**
 * Renders the primary navigation for the current Inertia auth state.
 *
 * Authenticated users see account links and a session-ending logout action;
 * guests see login and registration links.
 *
 * @returns {import('react').ReactElement} The application navigation bar.
 */
export default function Navigation() {
    const { props } = usePage();
    const { applicationName, isAuthenticated, user } = props;
    const { post } = useForm();
    const [mobileOpen, setMobileOpen] = useState(false);
    const handleLogout = (e) => {
        e.preventDefault();
        post('/logout');
    };
    const links = [
        { label: 'Dashboard', href: '/home' },
        { label: 'About', href: '/about' },
        { label: 'Users', href: '/users' },
    ];

    return (<nav className="sticky top-0 z-40 border-b border-hairline bg-background/95 backdrop-blur">
            <div className="mx-auto max-w-content px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-6">
                    <div className="flex items-center gap-8">
                        <Brand name={applicationName} />
                        {isAuthenticated && (
                            <div className="hidden items-center gap-1 md:flex">
                                {links.map(link => (
                                    <Link key={link.href} href={link.href} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground">
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="hidden items-center gap-3 md:flex">
                        {isAuthenticated ? (<>
                                <span className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{user?.name}</span></span>
                                <form onSubmit={handleLogout} className="inline">
                                    <Button type="submit" variant="outline" size="sm">
                                        Sign out
                                    </Button>
                                </form>
                            </>) : (<div className="flex items-center gap-2">
                                <Button asChild variant="ghost" size="sm">
                                <Link href="/login">
                                    Login
                                </Link>
                                </Button>
                                <Button asChild size="sm">
                                <Link href="/register">
                                    Sign up free
                                </Link>
                                </Button>
                            </div>)}
                    </div>
                    <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground md:hidden"
                        onClick={() => setMobileOpen(open => !open)}
                        aria-expanded={mobileOpen}
                        aria-label="Toggle navigation"
                    >
                        {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
                    </button>
                </div>
            </div>
            {mobileOpen && (
                <div className="border-t border-hairline bg-background px-6 py-6 md:hidden">
                    <div className="mx-auto flex max-w-content flex-col gap-2">
                        {(isAuthenticated ? links : [{ label: 'Home', href: '/' }]).map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="rounded-md px-3 py-3 text-base font-medium text-foreground"
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="mt-4 border-t border-hairline pt-5">
                            {isAuthenticated ? (
                                <form onSubmit={handleLogout}>
                                    <Button type="submit" variant="outline" className="w-full">Sign out</Button>
                                </form>
                            ) : (
                                <div className="grid gap-3">
                                    <Button asChild variant="outline"><Link href="/login">Sign in</Link></Button>
                                    <Button asChild><Link href="/register">Sign up free</Link></Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>);
}
