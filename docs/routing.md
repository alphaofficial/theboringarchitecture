# Routing

The app router is still an Express Router. This file documents optional routing features that are available when an endpoint actually needs them: named routes, route groups, route name prefixes, and resource routes.

```js
import { Router } from './routing.js';
import * as AuthController from '../controllers/auth.js';
import * as DocsController from '../controllers/docs.js';
import { auth, guest } from '../middleware/auth.js';

const route = Router.create();

route.get('/login', guest, AuthController.showLogin);
route.group({ middleware: [auth] }, authenticated => {
    authenticated.get('/settings', AuthController.showSettings);
});

route.name('docs.show').get('/docs/:page', DocsController.show);
const helpUrl = route.url('docs.show', { page: 'routing' });
```

Use names only for routes that have URL-generation call sites. Existing endpoints can keep plain `get`/`post` registrations; route groups still reduce repeated middleware or prefixes without adding names.

## Named routes

Route names are optional. You still define the path when registering the route:

```js
route.name('profile.show').get('/profiles/:profile', profile.show);
route.get('/healthz', health.show); // unnamed routes still work
```

The name is useful later when controllers, redirects, tests, or views generate a URL without repeating `/profiles/:profile`. If the path changes, call sites using the route name keep working.

## Generating URLs to named routes

```js
route.url('profile.show', { profile: 42 });
// /profiles/42

route.url('profile.show', { profile: 42 }, { query: { tab: 'security' } });
// /profiles/42?tab=security
```

Install `route.urls()` only when handlers or views need URL generation:

```js
app.use(route.urls());
app.use(route);

// in a handler
req.routeUrl('profile.show', { profile: user.id });
res.locals.routeUrl('profile.show', { profile: user.id });
```

## Route groups

`route.group()` applies shared middleware, route prefixes, and route name prefixes to routes declared inside the callback. Groups can be nested.

```js
route.group({ prefix: '/settings', middleware: [auth] }, settings => {
    settings.get('/', profile.edit);
    settings.post('/profile', profile.update);
});
```

## Route name prefixes

Use the `name` group option only when child routes are named and those names are used for URL generation:

```js
route.group({ prefix: '/admin', name: 'admin.' }, admin => {
    admin.name('dashboard').get('/dashboard', dashboard.index);
});

route.url('admin.dashboard');
// /admin/dashboard
```

## Resource routes

`route.resource(name, controller, options)` maps conventional controller actions onto REST-shaped endpoints.

| Action | Method | Path | Name |
| --- | --- | --- | --- |
| `index` | GET | `/posts` | `posts.index` |
| `create` | GET | `/posts/create` | `posts.create` |
| `store` | POST | `/posts` | `posts.store` |
| `show` | GET | `/posts/:post` | `posts.show` |
| `edit` | GET | `/posts/:post/edit` | `posts.edit` |
| `update` | PUT/PATCH | `/posts/:post` | `posts.update` |
| `destroy` | DELETE | `/posts/:post` | `posts.destroy` |

Only controller methods that exist are registered. Use `only` or `except` to constrain the surface area, `middleware` for resource-wide middleware, and `param` when the parameter name should not be derived from the resource name.

```js
route.resource('posts', postsController, {
    only: ['index', 'show'],
    middleware: [auth],
    param: 'post',
});
```
