/** Return counts by queue job status. */
async function stats(db, QueueJob) {
    const statuses = ['pending', 'processing', 'failed', 'completed'];
    const entries = await Promise.all(statuses.map(async status => [status, await db.count(QueueJob, { status })]));
    return Object.fromEntries(entries);
}

/** Load one queue job by id for operational inspection. */
async function show(db, QueueJob, id) { return db.findOne(QueueJob, { id }); }

/** Queue operational inspection facade. */
export const QueueMonitor = Object.freeze({ stats, show });
