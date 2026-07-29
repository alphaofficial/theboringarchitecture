import { Seeder } from "@mikro-orm/seeder";
import { User } from "../../app/models/User.js";
import { hash } from "../../lib/utilities/hash.js";
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin-password";
/**
 * Idempotently seeds the verified development administrator account.
 *
 * Existing data for `admin@example.com` is left unchanged.
 *
 * @extends {Seeder}
 */
export class DatabaseSeeder extends Seeder {
    async run(em) {
        const existingAdmin = await em.findOne(User, { email: ADMIN_EMAIL });
        if (existingAdmin) {
            return;
        }
        const admin = new User("00000000-0000-4000-8000-000000000001", "Admin User", ADMIN_EMAIL, await hash.make(ADMIN_PASSWORD));
        admin.emailVerifiedAt = new Date();
        await em.persistAndFlush(admin);
    }
}
