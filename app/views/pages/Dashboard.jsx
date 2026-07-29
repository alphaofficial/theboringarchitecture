import { Link, usePage } from '@inertiajs/react';
import PageShell from '@/views/components/PageShell.jsx';
import { Button } from '@/views/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/views/components/ui/card';
/**
 * Renders account details and quick actions for the current user.
 *
 * @returns {import('react').ReactElement} The authenticated dashboard page.
 */
export default function Dashboard() {
    const { props } = usePage();
    const { user } = props;
    return (<PageShell title="Dashboard" description="Account details and quick actions for the current user.">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
                <Card className="rounded-lg border border-border shadow-card">
                    <CardHeader>
                        <CardTitle className="text-[22px]">User Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="rounded-md bg-surface-card p-4">
                                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                                <dd className="mt-2 text-sm font-semibold text-foreground">{user?.name}</dd>
                            </div>
                            <div className="rounded-md bg-surface-card p-4">
                                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                                <dd className="mt-2 text-sm font-semibold text-foreground">{user?.email}</dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>

                <Card className="rounded-lg border border-border shadow-card">
                    <CardHeader>
                        <CardTitle className="text-[22px]">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/users">View Users</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </PageShell>);
}
