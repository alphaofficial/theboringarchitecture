import { Seeder } from "@mikro-orm/seeder";
import crypto from "node:crypto";
import { User } from "../../app/models/User.js";
import { hash } from "../../lib/utilities/hash.js";

const ADMIN_EMAIL = "admin@example.com";
/**
 * Idempotently seeds the verified development administrator account.
 *
 * Existing data for `admin@example.com` is left unchanged.
 *
 * @extends {Seeder}
 */
export class DatabaseSeeder extends Seeder {
    administratorEmail = ADMIN_EMAIL;

    async run(em) {
        const existingAdmin = await em.findOne(User, { email: this.administratorEmail });
        if (existingAdmin) {
            return;
        }
        const secret = process.env.ADMIN_PASSWORD ?? crypto.randomUUID();
        const admin = new User("00000000-0000-4000-8000-000000000001", "Admin User", this.administratorEmail, await hash.make(secret));
        admin.emailVerifiedAt = new Date();
        await em.persistAndFlush(admin);
    }
}
