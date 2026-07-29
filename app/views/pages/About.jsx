import { Head } from '@inertiajs/react';
import PageShell from '@/views/components/PageShell.jsx';
import { Badge } from '@/views/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/views/components/ui/card';
/**
 * Renders the public overview and technology stack.
 *
 * @param {{title: string, description: string}} props - Server-provided page content.
 * @returns {import('react').ReactElement} The About page.
 */
export default function About({ title, description }) {
    return (<>
			<Head title="About"/>
			<PageShell title={title} description={description}>
				<Card className="rounded-lg border border-border shadow-card">
					<CardHeader>
						<div className="flex items-center justify-between gap-4">
							<CardTitle className="text-[22px]">Technology Stack</CardTitle>
							<Badge variant="secondary">Modern monolith</Badge>
						</div>
					</CardHeader>
					<CardContent>
						<ul className="grid gap-3 md:grid-cols-2">
							{['Express.js - Web framework', 'Inertia.js - Modern monolith approach', 'React - Frontend library', 'JavaScript - Direct runtime code', 'Tailwind CSS - Styling', 'Vite - Build tool'].map(item => (<li key={item} className="rounded-md bg-surface-card px-4 py-3 text-sm text-foreground">{item}</li>))}
						</ul>
					</CardContent>
				</Card>
			</PageShell>
		</>);
}
