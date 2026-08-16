# Architecture

## Shape

- Express handles HTTP, middleware, routing, and controller actions.
- Inertia connects server controllers to React page components.
- React pages live under `app/views/pages`.
- SSR renders the first document when `.ssr/ssr.mjs` is available.
- Later Inertia visits return page names and props as JSON.
- Keep one app pipeline; do not add a parallel API layer by default.

## Directories

- `app/controllers` holds route actions.
- `app/core` holds app use cases and domain workflows.
- `app/events` registers event listeners as side effects.
- `app/jobs` registers queue handlers as side effects.
- `app/mail/templates` renders mail subjects and HTML.
- `app/middleware` holds Express middleware.
- `app/models` holds plain models and MikroORM mappings.
- `app/primitives` exposes runtime-backed app services.
- `app/requests` holds request validation modules.
- `app/router` owns route registration and app routing.
- `app/scheduler` registers scheduled work as side effects.
- `app/support` holds pure app helpers and facades.
- `config` holds environment-backed app configuration.
- `db/migrations` holds generated MikroORM migrations.
- `db/seeder` holds database seeders.
- `lib/runtime` wires primitive drivers and process boot.
- `test` holds Vitest coverage for app behavior.

## Import direction

- Controllers may import core, middleware, primitives, and support.
- Core code may import models, primitives, support, and config.
- Support code should stay pure unless a dependency is explicit.
- Primitives expose facades and delegate to registered drivers.
- Runtime code may import app modules to bootstrap the process.
- Models should not import controllers, routes, middleware, or views.
- Views should receive props; they should not reach into server runtime.
- Avoid circular imports; move shared code into `app/support` or `lib`.

## Runtime primitives

- Use primitives for services with drivers or lifecycle.
- Keep transport concerns inside primitive drivers.
- Keep request and domain helpers outside primitives.
- Configure drivers through runtime bootstrap, not call sites.
- Use existing primitives before adding a new abstraction.
- Add a primitive only when runtime replacement is a real need.

## Facades

- Prefer named object facades for public app helpers.
- Define internal functions, then export `Object.freeze({ ... })`.
- Use domain names such as `Router`, `Validation`, and `Policy`.
- Do not export loose helper buckets for public APIs.
- Keep examples using the same facade shape as the code.
- Add JSDoc to public facade functions.

## Routing

- Register routes in `app/router/route.js`.
- Import controllers as PascalCase namespaces.
- Use plain `get` and `post` when a route needs no name.
- Use route names only when code generates URLs from them.
- Use groups to share middleware, prefixes, or name prefixes.
- Use resource routes only when conventional actions fit the feature.

## Controllers

- Controllers translate HTTP requests into app work.
- Keep controllers thin and readable.
- Validate input before using it.
- Use `req.validated` for request middleware output.
- Render pages with `res.render(page, props)`.
- Return redirects or JSON only when the route calls for it.

## Models and database

- Models are plain JavaScript domain objects.
- MikroORM mappings live beside models under `app/models/mappings`.
- Use app-facing `db` names in examples and docs.
- Use `db.findAndCount` for query pagination.
- Use MikroORM serialization for entity output.
- Generate migrations with the project ORM command.
- Do not hand-write migrations.
- Do not change ORM config as a shortcut for a feature.

## Validation and authorization

- Put reusable validation rules in `app/support/validation.js`.
- Use request modules for named request validation.
- Request modules should register by convention when loaded.
- Put named ability checks in `app/support/authorization.js`.
- Use policies when authorization belongs to a subject.
- Keep fake request shapes out of tests and examples.

## Events, jobs, and schedules

- Events announce internal app facts.
- Notifications deliver user-facing messages through channels.
- Jobs handle queued background work.
- Scheduler modules register recurring jobs.
- Convention-loaded modules may register handlers as side effects.
- Side effects should be registration only.

## Mail and notifications

- Mail templates render subject and HTML.
- `Mailer` sends already-rendered mail through the configured driver.
- Do not make `Mailer` own template lookup or rendering.
- Use notifications for recipient, channel, and read-state workflows.
- Keep the event bus separate from user-facing delivery.

## Comments

- Prefer clear code over comments.
- Use comments to explain rules, contracts, and non-obvious choices.
- Do not comment obvious syntax or restate function names.
- Public facade functions should have JSDoc.
- Match existing JSDoc style with `@param` and `@returns`.
- Keep comments short and useful for agents and maintainers.
- Every exported item must have a comment

## Testing

- Use Vitest for unit and behavior coverage.
- Add regression tests for every fixed bug.
- Test real project usage, not invented shortcuts.
- Route tests should use real route params and middleware behavior.
- CLI tests should verify generated files and no overwrites.
- Run `npm test` before calling a code change ready.
- Run `npm run build` when views, routes, or public APIs change.

## Structure

- Empty line after each code block
- 
