import variables from '../../config/variables.js';
import { Bus } from '../../app/primitives/bus.js';
import { Cache } from '../../app/primitives/cache.js';
import { Mailer } from '../../app/primitives/mail.js';
import { Queue } from '../../app/primitives/queue.js';
import { Scheduler } from '../../app/primitives/scheduler.js';
import { Storage } from '../../app/primitives/storage.js';
import { NotificationCenter } from '../../app/primitives/notification.js';
import { createMemoryCacheDriver } from './drivers/cache/memory.js';
import { createInMemoryBusDriver } from './drivers/bus/inMemory.js';
import { createSmtpMailDriver } from './drivers/mail/smtp.js';
import { createDatabaseNotificationDriver } from './drivers/notification/database.js';
import { createSqliteQueueDriver } from './drivers/queue/sqlite.js';
import { createNodeCronSchedulerDriver } from './drivers/scheduler/nodeCron.js';
import { createLocalDiskDriver } from './drivers/storage/localDisk.js';

/**
 * @typedef {'bus'|'cache'|'mail'|'notification'|'queue'|'scheduler'|'storage'} PrimitiveName
 */

/**
 * Configures the requested application primitives with their default drivers.
 *
 * Omitting `primitives` configures every primitive. Each primitive's own
 * configuration guard makes repeated calls safe.
 *
 * @param {import('./context.js').ApplicationContext} ctx - Shared runtime dependencies.
 * @param {PrimitiveName[]} [primitives] - Subset to configure; omit for all primitives.
 * @returns {void}
 */
export function bootstrapPrimitives(ctx, primitives) {
    if (!primitives || primitives.length === 0) {
        Bus.configure(createInMemoryBusDriver(), ctx);
        Cache.configure(createMemoryCacheDriver());
        Storage.configure(createLocalDiskDriver(variables.STORAGE_PATH, variables.APP_URL));
        Mailer.configure(createSmtpMailDriver());
        NotificationCenter.configure(createDatabaseNotificationDriver(), ctx);
        Queue.configure(createSqliteQueueDriver(ctx.db), ctx);
        Scheduler.configure(createNodeCronSchedulerDriver(), ctx);
    }
    if (primitives?.includes("bus")) {
        Bus.configure(createInMemoryBusDriver(), ctx);
    }
    if (primitives?.includes("cache")) {
        Cache.configure(createMemoryCacheDriver());
    }
    if (primitives?.includes("mail")) {
        Mailer.configure(createSmtpMailDriver());
    }
    if (primitives?.includes("notification")) {
        NotificationCenter.configure(createDatabaseNotificationDriver(), ctx);
    }
    if (primitives?.includes("queue")) {
        Queue.configure(createSqliteQueueDriver(ctx.db), ctx);
    }
    if (primitives?.includes("scheduler")) {
        Scheduler.configure(createNodeCronSchedulerDriver(), ctx);
    }
    if (primitives?.includes("storage")) {
        Storage.configure(createLocalDiskDriver(variables.STORAGE_PATH, variables.APP_URL));
    }
}
