import { Head, Link } from '@inertiajs/react';
import { Button } from '@/views/components/ui/button';
import { Card, CardContent } from '@/views/components/ui/card';

const titles = {
    404: 'Page not found',
    500: 'Server error',
};
/**
 * Renders a friendly HTTP error page with optional development diagnostics.
 * When a stack trace is present, the message and trace are shown in a
 * terminal-style panel.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} root0 Component properties.
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} root0.status Optional outcome message displayed after an account action.
 * @param {{to: string|string[], subject: string, html?: string, text?: string}} root0.message Error summary displayed to the user.
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} root0.stack Optional server stack trace displayed in development.
 * @returns {import('react').ReactElement|string} Rendered React content.
 * @example
 * <ErrorPage />
 */
export default function ErrorPage({ status = 500, message, stack }) {
    const title = titles[status] || 'Something went wrong';
    const isDev = Boolean(stack);
    return (<>
			<Head title={`${status} — ${title}`}/>
			<div className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
				<div className={isDev ? 'w-full max-w-3xl' : 'text-center max-w-md'}>
					<p className="text-sm font-semibold text-muted-foreground">{status}</p>
					<h1 className="display-md mt-2 text-foreground">
						{title}
					</h1>
					{isDev ? (<Card className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-surface-dark text-left shadow-card">
							<CardContent className="p-0">
							<div className="flex items-center gap-1.5 border-b border-gray-800 bg-[#2d2d2d] px-4 py-2.5">
								<span className="h-3 w-3 rounded-full bg-[#ff5f56]"/>
								<span className="h-3 w-3 rounded-full bg-[#ffbd2e]"/>
								<span className="h-3 w-3 rounded-full bg-[#27c93f]"/>
								<span className="ml-3 text-xs text-gray-400 font-mono">error</span>
							</div>
							<pre className="whitespace-pre-wrap break-words p-4 text-sm font-mono text-gray-100">
								<code>
									{message ? (<>
											<span className="text-red-400">$ </span>
											<span className="text-red-300">{message}</span>
											{'\n\n'}
										</>) : null}
									{stack ? <span className="text-gray-400">{stack}</span> : null}
								</code>
							</pre>
							</CardContent>
						</Card>) : (message && <p className="mt-4 text-body">{message}</p>)}
					<div className={`mt-8 ${isDev ? '' : 'text-center'}`}>
						<Button asChild>
							<Link href="/">Go home</Link>
						</Button>
					</div>
				</div>
			</div>
		</>);
}
