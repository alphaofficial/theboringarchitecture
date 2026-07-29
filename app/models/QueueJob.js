/**
 * Durable background job and its processing/lock state.
 *
 * @property {string} id - Stable job identifier.
 * @property {string} name - Registered handler name.
 * @property {string} payload - JSON-serialized handler payload.
 * @property {string} status - Current `pending`, `running`, `done`, or `failed` state.
 * @property {number} attempts - Number of failed processing attempts.
 * @property {number} availableAt - Earliest processing time in Unix milliseconds.
 * @property {number|null} [lockedAt] - Time the job was claimed.
 * @property {string|null} [lockedBy] - Worker currently owning the job.
 * @property {string|null} [lastError] - Most recent serialized failure.
 * @property {number} createdAt - Creation time in Unix milliseconds.
 * @property {number} updatedAt - Last state-change time in Unix milliseconds.
 */
export class QueueJob {
    id;
    name;
    payload;
    status = 'pending';
    attempts = 0;
    availableAt;
    lockedAt;
    lockedBy;
    lastError;
    createdAt;
    updatedAt;
    constructor(id, name, payload, now) {
        this.id = id;
        this.name = name;
        this.payload = payload;
        this.availableAt = now;
        this.createdAt = now;
        this.updatedAt = now;
    }
}
