import { Head, Link } from '@inertiajs/react';
import PageShell from '@/views/components/PageShell.jsx';
import { Button } from '@/views/components/ui/button';
import { Card, CardContent } from '@/views/components/ui/card';
/**
 * Renders details for one example directory user.
 *
 * @param {{user: {id: number, name: string, email: string}}} props - User selected by the route.
 * @returns {import('react').ReactElement} The user detail page.
 */
export default function User({ user }) {
    return (<>
			<Head title={`User: ${user.name}`}/>
			<PageShell title={user.name} description="User profile details from the example directory." actions={<Button asChild variant="outline"><Link href="/users">← Back to Users</Link></Button>}>
				<Card className="rounded-lg border border-border shadow-card">
					<CardContent className="p-6">
						<div className="mb-6 sm:hidden">
							<Link href="/users" className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline">
								← Back to Users
							</Link>
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="rounded-md bg-surface-card p-4">
								<span className="text-sm font-medium text-muted-foreground">Email:</span>
								<span className="mt-2 block text-sm font-semibold text-foreground">{user.email}</span>
							</div>
							<div className="rounded-md bg-surface-card p-4">
								<span className="text-sm font-medium text-muted-foreground">User ID:</span>
								<span className="mt-2 block text-sm font-semibold text-foreground">{user.id}</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</PageShell>
		</>);
}
