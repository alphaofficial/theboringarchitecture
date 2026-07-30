import { Head, Link } from '@inertiajs/react';
import PageShell from '@/views/components/PageShell.jsx';
import { Badge } from '@/views/components/ui/badge';
import { Card, CardContent } from '@/views/components/ui/card';
/**
 * Renders links to all users in the example directory.
 *
 * @param {{users: Array<{id: number, name: string, email: string}>}} props - Directory entries.
 * @returns {import('react').ReactElement} The user listing page.
 */
export default function Users({ users }) {
    return (<>
			<Head title="Users"/>
			<PageShell title="Users" description="Browse the example directory and open a user profile.">
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
			</PageShell>
		</>);
}
