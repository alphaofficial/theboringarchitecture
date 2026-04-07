import { Head, Link } from '@inertiajs/react';

interface Props {
	applicationName: string;
	message?: string;
	timestamp?: string;
	auth?: any;
	isAuthenticated?: boolean;
}

export default function Home(pageProps: Props) {
	const { applicationName, isAuthenticated } = pageProps;
	return (
		<>
			<Head>
				<title>Express Inertia — Fullstack starter for Express, Inertia & React</title>
				<meta
					name="description"
					content="A batteries-included fullstack starter: Express 5, Inertia.js, React 19, MikroORM, sessions, and Tailwind. Type-safe, production-ready, and one command to install."
				/>
				<meta property="og:title" content="Express Inertia — Fullstack starter" />
				<meta
					property="og:description"
					content="Express + Inertia + React + MikroORM. Auth, sessions, SSR, and tests out of the box."
				/>
				<meta property="og:type" content="website" />
			</Head>
			<div className="min-h-screen bg-white">
				<header className="absolute inset-x-0 top-0 z-50">
					<div className="mx-auto max-w-2xl lg:max-w-4xl">
						<nav className="flex items-center justify-between py-6" aria-label="Global">
							<div>
								<Link href="/">
									<span className="text-xl font-bold text-gray-900">{applicationName}</span>
								</Link>
							</div>
							{!isAuthenticated ? (
								<div>
									<Link href="/login" className="text-sm font-semibold leading-6 text-gray-900">
										Log in <span aria-hidden="true">&rarr;</span>
									</Link>
								</div>
							) : null}
						</nav>
					</div>
				</header>
				<div className="relative isolate px-6 pt-14 lg:px-8">
					<div className="mx-auto max-w-2xl py-20">
						<div className="text-center">
							<span className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
								v0.1 · early preview
							</span>
							<h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
								The fullstack starter for Express &amp; React
							</h1>
							<p className="mt-6 text-lg leading-8 text-gray-600">
								Server-rendered React without an API layer. Type-safe routes, sessions,
								auth, and MikroORM — wired together so you can ship features on day one.
							</p>

							<div className="mt-8 mx-auto max-w-xl rounded-md border border-gray-200 bg-gray-50 p-4 text-left">
								<p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Install</p>
								<pre className="mt-2 overflow-x-auto text-sm text-gray-900">
									<code>{`curl -fsSL https://raw.githubusercontent.com/alphaofficial/express-inertia/main/install.sh | bash -s my-app`}</code>
								</pre>
							</div>
							{!isAuthenticated ? (
								<div className="mt-10 flex items-center justify-center gap-x-6">
									<Link
										href="/register"
										className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
									>
										Get started
									</Link>
									<Link href="/login" className="text-sm font-semibold leading-6 text-gray-900">
										Sign in <span aria-hidden="true">→</span>
									</Link>
								</div>
							) : (
							<div className="mt-10 flex items-center justify-center">
								<Link href="/login" className="text-sm font-semibold leading-6 text-gray-900">
										 Go to app <span aria-hidden="true">→</span>
									</Link>
							</div>)}
						</div>
					</div>

					<div className="mx-auto max-w-2xl lg:max-w-4xl">
						<div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:grid-cols-2">
							<div>
								<h2 className="text-base font-semibold leading-7 text-gray-900">Everything you need</h2>
								<p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
									Batteries included
								</p>
								<p className="mt-6 text-lg leading-8 text-gray-600">
									Skip the boilerplate. Auth, sessions, ORM, migrations, and SSR are
									already wired up — write controllers, render React.
								</p>
								<dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600">
									<div className="relative pl-9">
										<dt className="inline font-semibold text-gray-900">
											<svg className="absolute left-1 top-1 h-5 w-5 text-gray-900" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
												<path fillRule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clipRule="evenodd" />
											</svg>
											Inertia SSR, no API layer.
										</dt>
										<dd className="inline"> Pass props from Express straight into React components — no fetch, no JSON glue.</dd>
									</div>
									<div className="relative pl-9">
										<dt className="inline font-semibold text-gray-900">
											<svg className="absolute left-1 top-1 h-5 w-5 text-gray-900" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
												<path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
											</svg>
											Auth &amp; sessions built in.
										</dt>
										<dd className="inline"> bcrypt password hashing, DB-backed sessions, guest/auth route guards, helpers on <code className="text-xs">req</code>.</dd>
									</div>
									<div className="relative pl-9">
										<dt className="inline font-semibold text-gray-900">
											<svg className="absolute left-1 top-1 h-5 w-5 text-gray-900" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
												<path d="M4.632 3.533A2 2 0 016.577 2h6.846a2 2 0 011.945 1.533l1.976 8.234A9.966 9.966 0 0010 12c-2.51 0-4.8.9-6.344 2.767L4.632 3.533z" />
												<path fillRule="evenodd" d="M2 13a8 8 0 1116 0 8 8 0 01-16 0zm8-3a3 3 0 100 6 3 3 0 000-6z" clipRule="evenodd" />
											</svg>
											MikroORM &amp; migrations.
										</dt>
										<dd className="inline"> SQLite by default, Postgres-ready. EntitySchema mappings, no decorators.</dd>
									</div>
									<div className="relative pl-9">
										<dt className="inline font-semibold text-gray-900">
											<svg className="absolute left-1 top-1 h-5 w-5 text-gray-900" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
												<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
											</svg>
											Production hardened.
										</dt>
										<dd className="inline"> Helmet, compression, health checks, graceful shutdown, structured logs, integration tests.</dd>
									</div>
								</dl>
							</div>
							<div className="flex items-center justify-center">
								<div className="rounded-xl bg-gray-50 p-2 ring-1 ring-inset ring-gray-200 lg:rounded-2xl lg:p-4">
									<div className="rounded-md bg-white p-6 shadow-md ring-1 ring-gray-200">
										<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Controller → React</h3>
										<pre className="mt-3 overflow-x-auto text-xs leading-5 text-gray-900">
											<code>{`// src/controllers/HomeController.ts
res.inertia('Home', {
  message: 'Hello from Express',
  user: await req.user(),
})

// src/views/pages/Home.tsx
export default function Home({ message, user }) {
  return <h1>{message}, {user?.name}</h1>
}`}</code>
										</pre>
										<p className="mt-4 text-xs text-gray-500">
											No REST endpoint. No fetch. Props flow straight from Express to React.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Tech stack row */}
				<section className="mx-auto max-w-2xl lg:max-w-4xl px-6 mt-24 lg:px-8">
					<p className="text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
						Built on the boring stack that scales
					</p>
					<ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-gray-600">
						<li>Express 5</li>
						<li aria-hidden="true" className="text-gray-300">·</li>
						<li>Inertia.js 2</li>
						<li aria-hidden="true" className="text-gray-300">·</li>
						<li>React 19</li>
						<li aria-hidden="true" className="text-gray-300">·</li>
						<li>MikroORM 6</li>
						<li aria-hidden="true" className="text-gray-300">·</li>
						<li>Vite 6</li>
						<li aria-hidden="true" className="text-gray-300">·</li>
						<li>Tailwind 3</li>
						<li aria-hidden="true" className="text-gray-300">·</li>
						<li>TypeScript 5</li>
					</ul>
				</section>

				{/* How it works */}
				<section className="mx-auto max-w-2xl lg:max-w-4xl px-6 mt-24 lg:px-8">
					<div className="text-center">
						<h2 className="text-base font-semibold leading-7 text-gray-900">How it works</h2>
						<p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
							From zero to running app in three steps
						</p>
					</div>
					<ol className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
						<li className="rounded-lg border border-gray-200 p-6">
							<div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-sm font-semibold text-gray-900">1</div>
							<h3 className="mt-4 text-base font-semibold text-gray-900">Install</h3>
							<p className="mt-2 text-sm leading-6 text-gray-600">
								One curl command scaffolds the project, generates a session secret,
								and runs migrations.
							</p>
						</li>
						<li className="rounded-lg border border-gray-200 p-6">
							<div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-sm font-semibold text-gray-900">2</div>
							<h3 className="mt-4 text-base font-semibold text-gray-900">Define a route</h3>
							<p className="mt-2 text-sm leading-6 text-gray-600">
								Add an Express controller and call <code className="text-xs">res.inertia(&apos;Page&apos;, props)</code>.
								No API endpoints, no client-side data fetching.
							</p>
						</li>
						<li className="rounded-lg border border-gray-200 p-6">
							<div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-sm font-semibold text-gray-900">3</div>
							<h3 className="mt-4 text-base font-semibold text-gray-900">Render React</h3>
							<p className="mt-2 text-sm leading-6 text-gray-600">
								Drop a TSX file in <code className="text-xs">src/views/pages</code>.
								Props arrive type-safe, the page is server-rendered, and Inertia handles
								client-side navigation.
							</p>
						</li>
					</ol>
				</section>

				{/* What's included */}
				<section className="mx-auto max-w-2xl lg:max-w-4xl px-6 mt-24 lg:px-8">
					<div className="text-center">
						<h2 className="text-base font-semibold leading-7 text-gray-900">What&apos;s in the box</h2>
						<p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
							No glue code required
						</p>
						<p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600">
							Every line below is wired up and tested. Delete what you don&apos;t need.
						</p>
					</div>
					<ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 text-sm leading-6 text-gray-700">
						{[
							'Email + password auth',
							'DB-backed sessions',
							'Route guards (auth / guest)',
							'MikroORM with migrations',
							'SQLite by default, Postgres ready',
							'Type-safe page registry',
							'Helmet security headers',
							'gzip compression',
							'Body size limits',
							'Health & readiness probes',
							'Graceful shutdown',
							'Structured Pino logs',
							'Configurable rate limiting',
							'XSS-safe page props',
							'Global Inertia error page',
							'Vite + Tailwind build pipeline',
							'Integration test suite',
							'Zod env validation',
						].map((item) => (
							<li key={item} className="flex items-start gap-x-2">
								<svg className="mt-0.5 h-5 w-5 flex-none text-gray-900" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
									<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
								</svg>
								<span>{item}</span>
							</li>
						))}
					</ul>
				</section>

				{/* FAQ */}
				<section className="mx-auto max-w-2xl lg:max-w-4xl px-6 mt-24 lg:px-8">
					<div className="text-center">
						<h2 className="text-base font-semibold leading-7 text-gray-900">FAQ</h2>
						<p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
							Questions you might be asking
						</p>
					</div>
					<dl className="mt-12 space-y-8">
						<div className="border-t border-gray-200 pt-6">
							<dt className="text-base font-semibold text-gray-900">Why not Next.js?</dt>
							<dd className="mt-2 text-sm leading-6 text-gray-600">
								Next.js is great when you want a meta-framework. Express Inertia is for
								teams who already know Express, want full control of the request lifecycle,
								and would rather render React from a controller than learn another router.
							</dd>
						</div>
						<div className="border-t border-gray-200 pt-6">
							<dt className="text-base font-semibold text-gray-900">Can I use Postgres instead of SQLite?</dt>
							<dd className="mt-2 text-sm leading-6 text-gray-600">
								Yes. The Postgres MikroORM driver is already installed — switch it on in
								<code className="text-xs"> src/database/orm.config.ts</code> and set your
								connection string.
							</dd>
						</div>
						<div className="border-t border-gray-200 pt-6">
							<dt className="text-base font-semibold text-gray-900">Is this production-ready?</dt>
							<dd className="mt-2 text-sm leading-6 text-gray-600">
								The starter ships with helmet, compression, health checks, graceful shutdown,
								structured logs, and an integration test suite. Add your features and deploy.
							</dd>
						</div>
						<div className="border-t border-gray-200 pt-6">
							<dt className="text-base font-semibold text-gray-900">Where do I deploy it?</dt>
							<dd className="mt-2 text-sm leading-6 text-gray-600">
								Anywhere that runs Node 20+. Fly.io, Railway, Render, a plain VPS, Docker —
								your choice. Point the liveness probe at <code className="text-xs">/healthz</code> and
								readiness at <code className="text-xs">/readyz</code>.
							</dd>
						</div>
					</dl>
				</section>

				{/* Bottom CTA */}
				<section className="mx-auto max-w-2xl lg:max-w-4xl px-6 mt-24 lg:px-8">
					<div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-12 text-center sm:px-12">
						<h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
							Ready to ship?
						</h2>
						<p className="mx-auto mt-3 max-w-xl text-base leading-7 text-gray-600">
							Scaffold a fresh app in under a minute. No accounts, no signup, no telemetry.
						</p>
						<div className="mt-6 mx-auto max-w-xl rounded-md border border-gray-200 bg-white p-4 text-left">
							<pre className="overflow-x-auto text-sm text-gray-900">
								<code>{`curl -fsSL https://raw.githubusercontent.com/alphaofficial/express-inertia/main/install.sh | bash -s my-app`}</code>
							</pre>
						</div>
						<div className="mt-6 flex items-center justify-center gap-x-6">
							<a
								href="https://github.com/alphaofficial/express-inertia"
								className="rounded-md bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
							>
								View on GitHub
							</a>
							<a
								href="https://github.com/alphaofficial/express-inertia#readme"
								className="text-sm font-semibold leading-6 text-gray-900"
							>
								Read the docs <span aria-hidden="true">→</span>
							</a>
						</div>
					</div>
				</section>

				<footer className="bg-white">
					<div className="mx-auto max-w-2xl lg:max-w-4xl mt-24 mb-8 px-6 lg:px-8">
						<div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-y-4">
							<p className="text-xs leading-5 text-gray-500">
								&copy; 2025 {applicationName}. Released under the MIT license.
							</p>
							<ul className="flex items-center gap-x-6 text-xs leading-5 text-gray-500">
								<li>
									<a href="https://github.com/alphaofficial/express-inertia" className="hover:text-gray-900">GitHub</a>
								</li>
								<li>
									<a href="https://github.com/alphaofficial/express-inertia#readme" className="hover:text-gray-900">Docs</a>
								</li>
								<li>
									<a href="https://github.com/alphaofficial/express-inertia/issues" className="hover:text-gray-900">Issues</a>
								</li>
							</ul>
						</div>
					</div>
				</footer>
			</div>
		</>
	);
}