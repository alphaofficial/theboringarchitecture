/**
 * Persisted Express session protected by a hashed token secret.
 *
 * @property {string} id - Public session-token identifier.
 * @property {string} secret_hash - Hexadecimal SHA-256 digest of the private token segment.
 * @property {string} [user_id] - Authenticated user identifier.
 * @property {string} [ip_address] - Client IP captured at creation.
 * @property {string} [user_agent] - Client user agent captured at creation.
 * @property {string} payload - Serialized Express session data.
 * @property {number} last_activity - Last activity time in Unix seconds.
 * @property {number} created_at - Creation time in Unix seconds.
 */
export class Session {
    id;
    secret_hash;
    user_id;
    ip_address;
    user_agent;
    payload;
    last_activity;
    created_at;
}
