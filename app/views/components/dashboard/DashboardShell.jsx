import { useState } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import {
    BarChart3,
    FileText,
    Info,
    LayoutDashboard,
    LogOut,
    Menu,
    Users,
    X,
} from 'lucide-react';
import Brand from '@/views/components/Brand.jsx';
import { Button } from '@/views/components/ui/button';
import { cn } from '@/views/lib/utils';

const mainNavigation = [
    { label: 'Dashboard', href: '/home', icon: LayoutDashboard, match: path => path === '/home' },
    { label: 'Users', href: '/users', icon: Users, match: path => path.startsWith('/users') },
    { label: 'About', href: '/about', icon: Info, match: path => path === '/about' },
];

const secondaryNavigation = [
    { label: 'Analytics', href: '/home#analytics', icon: BarChart3 },
    { label: 'Orders', href: '/home#orders', icon: FileText },
];

function SidebarLink({ item, currentPath, onNavigate }) {
    const Icon = item.icon;
    const isActive = item.match?.(currentPath) || false;

    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                    ? 'bg-surface-card text-foreground'
                    : 'text-muted-foreground hover:bg-surface-soft hover:text-foreground',
            )}
        >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
        </Link>
    );
}

/**
 * Authenticated application shell used by the example dashboard.
 *
 * @param {{title?: string, subtitle?: string, children: import('react').ReactNode}} props - Dashboard content.
 * @returns {import('react').ReactElement} Responsive dashboard shell.
 */
export default function DashboardShell({
    title = 'Dashboard',
    subtitle = 'Your product at a glance',
    children,
}) {
    const { props, url } = usePage();
    const { applicationName, user } = props;
    const currentPath = url.split('?')[0];
    const { post, processing } = useForm();
    const [mobileOpen, setMobileOpen] = useState(false);

    const initials = user?.name
        ?.split(' ')
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'U';

    const handleLogout = event => {
        event.preventDefault();
        post('/logout');
    };

    const sidebar = (
        <div className="flex h-full flex-col bg-background">
            <div className="flex h-16 items-center border-b border-border px-5">
                <Brand href="/home" name={applicationName} className="min-w-0 [&>span:last-child]:truncate" />
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-5">
                <nav className="grid gap-1" aria-label="Dashboard navigation">
                    {mainNavigation.map(item => (
                        <SidebarLink
                            key={item.label}
                            item={item}
                            currentPath={currentPath}
                            onNavigate={() => setMobileOpen(false)}
                        />
                    ))}
                </nav>

                <p className="mb-2 mt-8 px-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Workspace
                </p>
                <nav className="grid gap-1" aria-label="Workspace navigation">
                    {secondaryNavigation.map(item => (
                        <SidebarLink
                            key={item.label}
                            item={item}
                            currentPath={currentPath}
                            onNavigate={() => setMobileOpen(false)}
                        />
                    ))}
                </nav>
            </div>

            <div className="border-t border-border p-3">
                <div className="mb-2 flex items-center gap-3 rounded-md px-2 py-2">
                    <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground"
                        aria-hidden="true"
                    >
                        {initials}
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{user?.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                </div>
                <form onSubmit={handleLogout}>
                    <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start px-3 text-muted-foreground"
                        disabled={processing}
                    >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        Sign out
                    </Button>
                </form>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-surface-soft text-foreground">
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border lg:block">
                {sidebar}
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                        aria-label="Close navigation"
                    />
                    <aside className="relative h-full w-[min(20rem,86vw)] border-r border-border shadow-xl">
                        {sidebar}
                        <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            className="absolute right-3 top-3"
                            onClick={() => setMobileOpen(false)}
                            aria-label="Close navigation"
                        >
                            <X className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    </aside>
                </div>
            )}

            <div className="lg:pl-64">
                <header className="sticky top-0 z-20 flex h-16 items-center border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="mr-3 lg:hidden"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open navigation"
                    >
                        <Menu className="h-5 w-5" aria-hidden="true" />
                    </Button>
                    <div>
                        <p className="text-sm font-semibold text-foreground">{title}</p>
                        <p className="hidden text-xs text-muted-foreground sm:block">
                            {subtitle}
                        </p>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <span className="hidden text-sm text-muted-foreground sm:inline">
                            {user?.name}
                        </span>
                        <span
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-soft text-xs font-semibold"
                            aria-hidden="true"
                        >
                            {initials}
                        </span>
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
