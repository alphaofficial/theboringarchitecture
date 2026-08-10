# Data and productivity helpers

This project includes small helpers for common application data workflows. They stay close to plain JavaScript so controllers, jobs, seeders, and tests can use the same APIs.

## Storage ergonomics

`Storage` includes helpers for raw writes, text reads, appending, listing, and directory creation:

```js
import { Storage } from '../app/primitives/storage.js';

await Storage.put('exports/users.json', `${JSON.stringify(users)}\n`);
await Storage.append('logs/import.log', 'import complete\n');
const report = JSON.parse(await Storage.getText('exports/users.json'));
const files = await Storage.list('exports');
```

The local disk driver confines all paths to the configured storage root and encodes public URLs safely.

## Model factories

Factories are for tests and seed data, not runtime application code. This project uses MikroORM's `Factory` from `@mikro-orm/seeder`; `make:factory` only generates that starter file.

```js
import { Factory } from '@mikro-orm/seeder';
import { User } from '../app/models/User.js';

export class UserFactory extends Factory {
    model = User;

    definition(input = {}) {
        return { ...input };
    }
}
```

CLI generators are available for starter files:

```sh
npx boring make:factory User
npx boring make:seeder DemoData
npx boring db:seed
```

## API serialization

Use MikroORM serialization for entity output. Query pagination still happens with `db.findAndCount()`; serialization only shapes the records returned by that query.

```js
import { serialize } from '@mikro-orm/core';

const [users, total] = await db.findAndCount(User, {}, { limit: 25, offset: 0 });

return {
    data: serialize(users, { exclude: ['password', 'rememberToken'] }),
    meta: { total },
};
```
