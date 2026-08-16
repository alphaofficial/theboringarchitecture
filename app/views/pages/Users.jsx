import { Head, Link } from '@inertiajs/react';
import DashboardShell from '@/views/components/dashboard/DashboardShell.jsx';
import { Badge } from '@/views/components/ui/badge';
import { Card, CardContent } from '@/views/components/ui/card';

/**
 * Renders links to all users in the example directory.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} root0 Component properties.
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} root0.users User records displayed in the directory.
 * @returns {import('react').ReactElement|string} Rendered React content.
 * @example
 * <Users />
 */
export default function Users({ users }) {
    return (<>
			<Head title="Users"/>
			<DashboardShell title="Users" subtitle="Manage your customer directory">
				<div className="mx-auto max-w-[1440px]">
					<section className="mb-6">
						<p className="text-sm font-medium text-muted-foreground">Directory</p>
						<h1 className="mt-1 font-display text-3xl font-semibold tracking-[-0.8px] text-foreground">Users</h1>
						<p className="mt-2 text-body">Browse the example directory and open a user profile.</p>
					</section>
					<div className="grid gap-4">
					{users.map(user => (<Card key={user.id} className="rounded-lg border border-border shadow-card">
							<CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-center gap-4">
									<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-card text-[13px] font-semibold text-foreground" aria-hidden="true">
										{user.name.split(' ').map(part => part[0]).join('').slice(0, 2)}
									</span>
									<div>
									<h3 className="text-lg font-semibold tracking-[-0.02em]">
										<Link href={`/users/${user.id}`} className="text-foreground hover:underline">
											{user.name}
										</Link>
									</h3>
									<p className="mt-1 text-body">{user.email}</p>
									</div>
								</div>
								<Badge variant="secondary">User #{user.id}</Badge>
							</CardContent>
						</Card>))}
					</div>
				</div>
			</DashboardShell>
		</>);
}
