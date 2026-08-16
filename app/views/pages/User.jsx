import { Head, Link } from '@inertiajs/react';
import DashboardShell from '@/views/components/dashboard/DashboardShell.jsx';
import { Button } from '@/views/components/ui/button';
import { Card, CardContent } from '@/views/components/ui/card';

/**
 * Renders details for one example directory user.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} root0 Component properties.
 * @param {import('../models/User.js').User} root0.user Authenticated user displayed or managed by the page.
 * @returns {import('react').ReactElement|string} Rendered React content.
 * @example
 * <User />
 */
export default function User({ user }) {
    return (<>
			<Head title={`User: ${user.name}`}/>
			<DashboardShell title="Users" subtitle="Customer profile">
				<div className="mx-auto max-w-[1440px]">
					<section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">User profile</p>
							<h1 className="mt-1 font-display text-3xl font-semibold tracking-[-0.8px] text-foreground">{user.name}</h1>
							<p className="mt-2 text-body">User profile details from the example directory.</p>
						</div>
						<Button asChild variant="outline"><Link href="/users">← Back to Users</Link></Button>
					</section>
					<Card className="rounded-lg border border-border shadow-card">
					<CardContent className="p-6">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="rounded-md bg-surface-card p-4">
								<span className="font-medium text-muted-foreground">Email:</span>
								<span className="mt-2 block font-semibold text-foreground">{user.email}</span>
							</div>
							<div className="rounded-md bg-surface-card p-4">
								<span className="font-medium text-muted-foreground">User ID:</span>
								<span className="mt-2 block font-semibold text-foreground">{user.id}</span>
							</div>
						</div>
					</CardContent>
					</Card>
				</div>
			</DashboardShell>
		</>);
}
