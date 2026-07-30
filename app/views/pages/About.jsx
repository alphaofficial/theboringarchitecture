import { Head } from '@inertiajs/react';
import PageShell from '@/views/components/PageShell.jsx';
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
			<PageShell eyebrow={null} title={title} description={description}>
				<Card className="rounded-lg border border-border shadow-card">
					<CardHeader>
						<CardTitle className="text-[22px]">Stack</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="grid gap-3 md:grid-cols-2">
							{['Express routing', 'Inertia page responses', 'React views', 'JavaScript runtime code', 'Tailwind styles', 'Vite builds'].map(item => (<li key={item} className="rounded-md bg-surface-card px-4 py-3 text-sm text-foreground">{item}</li>))}
						</ul>
					</CardContent>
				</Card>
			</PageShell>
		</>);
}
