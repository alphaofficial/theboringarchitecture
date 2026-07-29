import { EntitySchema } from "@mikro-orm/postgresql";
import { User } from "../User.js";
export const UserMapper = new EntitySchema({
    class: User,
    tableName: "users",
    properties: {
        id: { type: "string", primary: true },
        name: { type: "string" },
        email: { type: "string", unique: true },
        password: { type: "string" },
        emailVerifiedAt: { type: "Date", nullable: true },
        rememberToken: { type: "string", nullable: true },
        createdAt: {
            type: "Date",
            defaultRaw: "CURRENT_TIMESTAMP",
        },
        updatedAt: {
            type: "Date",
            defaultRaw: "CURRENT_TIMESTAMP",
            onUpdate: () => new Date(),
        },
    },
});
