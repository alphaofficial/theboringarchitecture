import "dotenv-defaults/config.js";
import { Migrator } from "@mikro-orm/migrations";
import { SqliteDriver } from "@mikro-orm/sqlite";
import { env } from "./variables.js";
const mikroOrmOptions = {
    entities: ["app/models/mappings/*.map.js"],
    dbName: env("DB_PATH"),
    driver: SqliteDriver,
    pool: {
        afterCreate: (conn, done) => {
            conn.exec('PRAGMA journal_mode=WAL;');
            conn.exec('PRAGMA synchronous=NORMAL;');
            conn.exec('PRAGMA busy_timeout=5000;');
            done(null, conn);
        }
    },
    migrations: {
        path: "db/migrations",
            },
    resultCache: {
        global: 0,
    },
    extensions: [Migrator],
    allowGlobalContext: process.env.NODE_ENV === "test",
    seeder: {
        path: "db/seeder",
                defaultSeeder: "DatabaseSeeder",
        emit: "js",
    },
};
export default {
    ...mikroOrmOptions,
};
