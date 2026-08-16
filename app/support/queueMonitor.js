/**
 * Return counts by queue job status.
 * @param {import('@mikro-orm/core').EntityManager} db Database entity manager.
 * @param {typeof import('../models/QueueJob.js').QueueJob} QueueJob Queuejob value.
 * @returns {Promise<Record<string, number>>} Queue job counts keyed by status.
 */
async function stats(db, QueueJob) {
    const statuses = ['pending', 'processing', 'failed', 'completed'];
    const entries = await Promise.all(statuses.map(async status => [status, await db.count(QueueJob, { status })]));
    return Object.fromEntries(entries);
}

/**
 * Load one queue job by id for operational inspection.
 * @param {import('@mikro-orm/core').EntityManager} db Database entity manager.
 * @param {typeof import('../models/QueueJob.js').QueueJob} QueueJob Queuejob value.
 * @param {string|number} id Record identifier.
 * @returns {Promise<import('../models/QueueJob.js').QueueJob|null>} Matching queue job, or null when it does not exist.
 */
async function show(db, QueueJob, id) { return db.findOne(QueueJob, { id }); }

/** Queue operational inspection facade. */
export const QueueMonitor = Object.freeze({ stats, show });
