import { Head } from '@inertiajs/react';
import DashboardShell from '@/views/components/dashboard/DashboardShell.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/views/components/ui/card';

/**
 * Renders the authenticated overview and technology stack.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} root0 Component properties.
 * @param {string} root0.title Document title rendered for the Inertia page.
 * @param {string} root0.description Supporting copy displayed below the heading.
 * @returns {import('react').ReactElement|string} Rendered React content.
 * @example
 * <About />
 */
export default function About({ title, description }) {
    return (<>
			<Head title="About"/>
			<DashboardShell title="About" subtitle="Starter application details">
				<div className="mx-auto max-w-[1440px]">
					<section className="mb-6">
						<p className="text-sm font-medium text-muted-foreground">Application</p>
						<h1 className="mt-1 font-display text-3xl font-semibold tracking-[-0.8px] text-foreground">{title}</h1>
						<p className="mt-2 max-w-2xl text-body">{description}</p>
					</section>
					<Card className="rounded-lg border border-border shadow-card">
					<CardHeader>
						<CardTitle className="text-[22px]">Stack</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="grid gap-3 md:grid-cols-2">
							{['Express routing', 'Inertia page responses', 'React views', 'JavaScript runtime code', 'Tailwind styles', 'Vite builds'].map(item => (<li key={item} className="rounded-md bg-surface-card px-4 py-3 text-body">{item}</li>))}
						</ul>
					</CardContent>
					</Card>
				</div>
			</DashboardShell>
		</>);
}
