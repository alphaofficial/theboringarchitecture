import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowRight, GitFork, Menu, X } from 'lucide-react';
import IDEMockup from '../components/Mockup.jsx';
import Brand from '@/views/components/Brand.jsx';
import SiteFooter from '@/views/components/SiteFooter.jsx';
import { Button } from '@/views/components/ui/button';
import { Card, CardContent } from '@/views/components/ui/card';

const INSTALL_CMD = 'curl -fsSL https://raw.githubusercontent.com/alphaofficial/theboringarchitecture/main/install.sh | bash';
const GITHUB_URL = 'https://github.com/alphaofficial/theboringarchitecture';
/**
 * Renders a button that copies text and briefly confirms success.
 *
 * Falls back to a hidden textarea when the Clipboard API is unavailable.
 *
 * @param {{text: string}} props - Text to copy.
 * @returns {import('react').ReactElement} The copy action.
 */
function CopyButton({ text }) {
	const [copied, setCopied] = useState(false);
	const handleCopy = async () => {
		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(text);
			}
			else {
				const ta = document.createElement('textarea');
				ta.value = text;
				ta.style.position = 'fixed';
				ta.style.opacity = '0';
				document.body.appendChild(ta);
				ta.select();
				document.execCommand('copy');
				document.body.removeChild(ta);
			}
			setCopied(true);
			setTimeout(() => setCopied(false), 1800);
		}
		catch {
		}
	};
	return <Button type="button" onClick={handleCopy} aria-label="Copy install command" variant="secondary" size="sm" className="shrink-0 gap-x-1.5">
		{copied ? (<>
			<svg className="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				<path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clipRule="evenodd" />
			</svg>
			Copied
		</>) : (<>
			<svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				<path d="M8 2a2 2 0 00-2 2v1H5a2 2 0 00-2 2v9a2 2 0 002 2h8a2 2 0 002-2v-1h1a2 2 0 002-2V4a2 2 0 00-2-2H8zm6 11V7a2 2 0 00-2-2H8V4h8v9h-2z" />
			</svg>
			Copy
		</>)}
	</Button>;
}
/**
 * Renders the product landing page and installation guide.
 *
 * @param {{
 *   applicationName: string,
 *   auth?: unknown,
 *   isAuthenticated?: boolean
 * }} pageProps - Shared application properties supplied by Inertia.
 * @returns {import('react').ReactElement} The public home page.
 */
export default function Home(pageProps) {
	const { applicationName, isAuthenticated } = pageProps;
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	return (<>
		<Head>
			<title>The Boring Architecture — A fullstack framework for Express, Inertia &amp; React</title>
			<meta name="description" content="Boring until complexity forces otherwise. Server-rendered React on top of Express — no API layer, no glue code, no meta-framework detour." />
			<meta property="og:title" content="The Boring Architecture — A fullstack framework for Express, Inertia & React" />
			<meta property="og:description" content="Server-rendered React on top of Express. Auth, sessions, ORM, migrations and SSR included." />
			<meta property="og:type" content="website" />
		</Head>

		<div className="min-h-screen overflow-x-hidden bg-background font-sans text-foreground antialiased">

			<header className="sticky top-0 z-40 border-b border-hairline bg-background/95 backdrop-blur">
				<div className="mx-auto flex h-16 max-w-content items-center justify-between px-6 lg:px-8">
					<Brand name={applicationName} data-testid="site-logo" />
					<nav className="hidden items-center gap-x-7 text-sm font-medium text-muted-foreground md:flex" data-testid="desktop-nav">
						<a href="#features" className="hover:text-foreground">Features</a>
						<a href="#how" className="hover:text-foreground">How it works</a>
						<a href={GITHUB_URL} className="hover:text-foreground">GitHub</a>
					</nav>
					<div className="hidden items-center gap-2 md:flex">
						{isAuthenticated ? (
							<Button asChild size="sm"><Link href="/home">Open dashboard</Link></Button>
						) : (
							<>
								<Button asChild variant="ghost" size="sm"><Link href="/login">Sign in</Link></Button>
								<Button asChild size="sm"><Link href="/register">Sign up free</Link></Button>
							</>
						)}
					</div>
					<button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-expanded={mobileMenuOpen} aria-label="Toggle navigation menu" data-testid="mobile-menu-button">
						{mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
					</button>
				</div>
				{mobileMenuOpen && (<nav className="border-t border-border bg-background px-6 py-4 md:hidden" data-testid="mobile-nav">
					<div className="mx-auto flex max-w-content flex-col gap-y-1 text-base font-medium text-foreground">
						<a href="#features" className="rounded-md px-3 py-3" onClick={() => setMobileMenuOpen(false)}>Features</a>
						<a href="#how" className="rounded-md px-3 py-3" onClick={() => setMobileMenuOpen(false)}>How it works</a>
						<a href={GITHUB_URL} className="rounded-md px-3 py-3" onClick={() => setMobileMenuOpen(false)}>GitHub</a>
						<div className="mt-4 grid gap-3 border-t border-border pt-5">
							{isAuthenticated ? (
								<Button asChild><Link href="/home">Open dashboard</Link></Button>
							) : (
								<>
									<Button asChild variant="outline"><Link href="/login">Sign in</Link></Button>
									<Button asChild><Link href="/register">Sign up free</Link></Button>
								</>
							)}
						</div>
					</div>
				</nav>)}
			</header>


			<section data-testid="hero-section">
				<div className="mx-auto max-w-content px-6 py-20 lg:px-8 lg:py-24">
					<div className="max-w-4xl">
						<h1 className="display-xl max-w-3xl text-foreground">
							Fullstack development, without the detour.
						</h1>
						<p className="mt-7 max-w-2xl text-lg leading-8 text-body">
						Express handles routing, React renders the views, Inertia connects the two. That&apos;s it.
					</p>

						<div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center" data-testid="hero-cta-group">
							<Button asChild size="lg" className="gap-x-2">
						<a href={GITHUB_URL}>
							<GitFork className="h-4 w-4" aria-hidden="true" />
							Get the starter
						</a>
						</Button>
							<Button asChild variant="outline" size="lg">
								<a href="#how">See how it works <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
							</Button>
						</div>
						<div className="mt-8 flex max-w-xl items-center gap-3 rounded-lg border border-border bg-surface-soft p-2 pl-4">
							<code className="min-w-0 flex-1 truncate font-mono text-[13px] text-foreground">{INSTALL_CMD}</code>
							<CopyButton text={INSTALL_CMD} />
						</div>
					</div>
				</div>
			</section>


			<section id="features" className="border-t border-border bg-surface-soft" data-testid="features-section">
				<div className="mx-auto max-w-content px-6 py-24 lg:px-8">
					<div className="mx-auto max-w-3xl text-center">
						<h2 className="display-lg text-foreground">
							Batteries included.
						</h2>
						<p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
							Everything you need to ship a production app, wired up and ready to go.
						</p>
					</div>
					<div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{FEATURES.map((f) => (<Card key={f.title} className="rounded-lg border border-border bg-background shadow-none">
							<CardContent className="flex gap-x-4 p-6">
							<span className="shrink-0">
								<FeatureIcon name={f.icon} />
							</span>
							<div className="min-w-0">
								<h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
								<p className="mt-1.5 text-sm leading-6 text-muted-foreground">{f.description}</p>
							</div>
							</CardContent>
						</Card>))}
					</div>
				</div>
			</section>


			<section id="how" className="border-t border-border bg-background" data-testid="how-it-works-section">
				<div className="mx-auto max-w-content px-6 py-24 lg:px-8">
					<div className="mx-auto max-w-3xl text-center">
						<h2 className="display-lg text-foreground">
							From zero to shipping in three steps.
						</h2>
					</div>

					<div className="hidden md:block">
						<IDEMockup />
					</div>

					<div className="mx-auto mt-16 max-w-6xl">
						{STEPS.map((step, i) => (<div key={step.title} className={`flex gap-6 ${i > 0 ? 'mt-10 border-t border-border pt-10' : ''}`}>
							<span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-sm font-semibold text-primary-foreground">
								{i + 1}
							</span>
							<div>
								<h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
								<p className="mt-2 text-base leading-7 text-muted-foreground">{step.description}</p>
							</div>
						</div>))}
					</div>
				</div>
			</section>


			<section className="border-t border-border bg-background" data-testid="bottom-cta-section">
				<div className="mx-auto max-w-content px-6 py-24 text-center lg:px-8">
					<div className="rounded-lg bg-surface-card px-6 py-12 sm:px-12">
					<h2 className="display-lg text-foreground">
						Ship something this weekend.
					</h2>
					<p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
						No accounts. No telemetry. No signup. Install, develop, deploy.
					</p>
					<div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
						<Button asChild className="gap-x-2">
						<a href={GITHUB_URL}>
							<svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
								<path d="M12 .5l3.09 6.26L22 7.77l-5 4.87L18.18 20 12 16.77 5.82 20 7 12.64 2 7.77l6.91-1.01L12 .5z" />
							</svg>
							Star on GitHub
						</a>
						</Button>
						<Button asChild variant="outline">
						<a href={`${GITHUB_URL}#readme`}>
							Read the docs &rarr;
						</a>
						</Button>
					</div>
					</div>
				</div>
			</section>

			<SiteFooter />
		</div>
	</>);
}
/**
 * Selects the decorative icon used by a landing-page feature.
 *
 * @param {{name: string}} props - Feature icon name.
 * @returns {import('react').ReactElement} The matching SVG icon.
 */
function FeatureIcon({ name }) {
	const icons = {
		react: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
			<path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
		</svg>),
		shield: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
			<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
		</svg>),
		database: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
			<ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 5v14c0 1.66-4.03 3-9 3s-9-1.34-9-3V5" /><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
		</svg>),
		queue: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
			<rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
		</svg>),
		mail: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
			<rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 4l-10 8L2 4" />
		</svg>),
		clock: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
			<circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
		</svg>),
		signal: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
			<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
		</svg>),
		cache: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
			<rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="10" x2="16" y2="10" />
		</svg>),
		folder: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
			<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" />
		</svg>),
		lock: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
			<rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
		</svg>),
		code: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
			<path d="M16 18l6-6-6-6" /><path d="M8 6l-6 6 6 6" />
		</svg>),
		wind: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
			<path d="M9.59 4.59A2 2 0 1111 8H2" /><path d="M12.59 19.41A2 2 0 1014 16H2" /><path d="M17.73 7.73A2.5 2.5 0 1119.5 12H2" />
		</svg>),
		gauge: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
			<path d="M12 12l4-8" /><circle cx="12" cy="12" r="10" /><path d="M4.93 7h14.14" />
		</svg>),
		check: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
			<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
		</svg>),
		validate: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
			<circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" />
		</svg>),
	};
	return (<span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground">
		{icons[name] ?? null}
	</span>);
}
const FEATURES = [
	{ title: 'Server-side rendering', description: 'Pages render on the server first, then hydrate into a full SPA. Fast initial loads, smooth navigation after.', icon: 'react' },
	{ title: 'Authentication', description: 'Registration, login, forgot password, password reset, and email verification — wired and ready to extend.', icon: 'shield' },
	{ title: 'Database & ORM', description: 'Schema-first mappings with migrations. SQLite by default, Postgres when you need it.', icon: 'database' },
	{ title: 'Background jobs', description: 'Dispatch async work and run it in a separate process. No external queue service required.', icon: 'queue' },
	{ title: 'Mailer', description: 'Send transactional email out of the box. Log driver for dev, SMTP for production, pluggable for anything else.', icon: 'mail' },
	{ title: 'Task scheduling', description: 'Cron-style recurring jobs. Define them in code, run them with one command.', icon: 'clock' },
	{ title: 'Event bus', description: 'In-process events that decouple your features without adding infrastructure.', icon: 'signal' },
	{ title: 'Cache', description: 'Simple key-value store. In-memory by default, pluggable for Redis or anything else.', icon: 'cache' },
	{ title: 'File storage', description: 'Store and retrieve files with a clean API. Local driver included, custom drivers welcome.', icon: 'folder' },
	{ title: 'Production hardened', description: 'Security headers, graceful shutdown, health probes, structured logs, body limits.', icon: 'lock' },
	{ title: 'JavaScript throughout', description: 'Write controllers, models, and React pages in JavaScript with one consistent project structure.', icon: 'code' },
	{ title: 'Fast tooling', description: 'Hot module replacement in dev, optimized bundles in production. No waiting around.', icon: 'wind' },
	{ title: 'Rate limiting', description: 'Opt-in per-route throttling. Off by default, env-configured, ready for production.', icon: 'gauge' },
	{ title: 'XSS protection', description: 'Page props are HTML-escaped end-to-end. Untrusted data is safe by default.', icon: 'check' },
	{ title: 'AI ready', description: 'Opinionated structure means AI assistants follow conventions instead of guessing. Less correction, more shipping.', icon: 'validate' },
];
const STEPS = [
	{ title: 'Install', description: 'One command scaffolds a full project — database, auth, sessions, migrations, and dev server.', code: 'curl -fsSL https://raw.githubusercontent.com/alphaofficial/theboringarchitecture/main/install.sh | bash' },
	{ title: 'Develop', description: 'Write controllers, models, and React pages with familiar MVC patterns. JavaScript end-to-end.' },
	{ title: 'Ship it', description: 'Your page is server-rendered and ready for production. Deploy anywhere Node runs.' },
];
