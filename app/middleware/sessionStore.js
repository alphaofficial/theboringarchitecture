import { Store } from 'express-session';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { Session } from '../models/Session.js';
import variables from '../../config/variables.js';

const TOKEN_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';
/**
 * Generates a 24-character session-token segment without ambiguous characters.
 * @returns {Record<string, string|number|boolean|null>} Configured runtime interface.
 * @example
 * generateTokenSegment();
 */
export function generateTokenSegment() {
    const bytes = randomBytes(24);
    let out = '';
    for (let i = 0; i < bytes.length; i++) {
        out += TOKEN_ALPHABET[bytes[i] >> 3];
    }
    return out;
}
/**
 * Generates an opaque session token containing a public ID and private secret.
 * @returns {Record<string, string|number|boolean|null>} Configured runtime interface.
 * @example
 * generateSessionToken();
 */
export function generateSessionToken() {
    return `${generateTokenSegment()}.${generateTokenSegment()}`;
}
/**
 * Hashes the private portion of a session token for safe persistence.
 *
 * @param {string} secret Session signing secret.
 * @returns {Buffer} SHA-256 digest of the secret.
 */
function hashSecret(secret) {
    return createHash('sha256').update(secret).digest();
}

/**
 * Splits a session token into its database ID and private secret.
 *
 * @param {string} token Signed or random token submitted for verification.
 * @returns {{id: string, secret: string}|null} Parsed components, or `null` for malformed input.
 */
function parseToken(token) {
    const dot = token.indexOf('.');
    if (dot <= 0 || dot === token.length - 1)
        {return null;}
    return { id: token.slice(0, dot), secret: token.slice(dot + 1) };
}

/**
 * Compares a submitted session secret with a stored digest in constant time.
 *
 * @param {string} submitted Submitted signature.
 * @param {string} storedHex Stored hexadecimal signature.
 * @returns {boolean} Whether the submitted secret matches the stored digest.
 */
function secretMatches(submitted, storedHex) {
    const submittedHash = hashSecret(submitted);
    let storedBuf;
    try {
        storedBuf = Buffer.from(storedHex, 'hex');
    }
    catch {
        return false;
    }
    if (storedBuf.length !== submittedHash.length)
        {return false;}
    return timingSafeEqual(submittedHash, storedBuf);
}

/**
 * Persists Express sessions through MikroORM using split ID/secret tokens.
 *
 * Only the token ID and a SHA-256 digest of its secret are stored. Request IP
 * and user-agent metadata are captured when a session is first persisted.
 *
 * @extends {Store}
 */
export class SessionStore extends Store {
    orm;
    requestStore = new Map();
    constructor(orm) {
        super();
        this.orm = orm;
    }
    setRequestData(sessionId, ip, userAgent) {
        this.requestStore.set(sessionId, { ip, userAgent });
    }
    async get(sid, callback) {
        try {
            const parsed = parseToken(sid);
            if (!parsed)
                {return callback(null, null);}
            const em = this.orm.em.fork();
            const session = await em.findOne(Session, { id: parsed.id });
            if (!session)
                {return callback(null, null);}
            if (!secretMatches(parsed.secret, session.secret_hash)) {
                return callback(null, null);
            }
            if (SessionStore.isExpired(session)) {
                await em.nativeDelete(Session, { id: parsed.id });
                return callback(null, null);
            }
            callback(null, JSON.parse(session.payload));
            return undefined;
        }
        catch (error) {
            return callback(error);
        }
    }
    async set(sid, session, callback) {
        try {
            const parsed = parseToken(sid);
            if (!parsed)
                {throw new Error('Invalid session token format');}
            const em = this.orm.em.fork();
            const payload = JSON.stringify(session);
            const now = Math.floor(Date.now() / 1000);
            const requestData = this.requestStore.get(sid);
            const existing = await em.findOne(Session, { id: parsed.id });
            if (existing) {
                if (!secretMatches(parsed.secret, existing.secret_hash)) {
                    throw new Error('Session secret mismatch');
                }
                existing.payload = payload;
                existing.last_activity = now;
                existing.user_id = session.userId || undefined;
                await em.flush();
            }
            else {
                const record = em.create(Session, {
                    id: parsed.id,
                    secret_hash: hashSecret(parsed.secret).toString('hex'),
                    payload,
                    last_activity: now,
                    created_at: now,
                    user_id: session.userId || undefined,
                    ip_address: requestData?.ip || undefined,
                    user_agent: requestData?.userAgent || undefined,
                });
                await em.persistAndFlush(record);
            }
            callback?.();
            return undefined;
        }
        catch (error) {
            return callback?.(error);
        }
    }
    async destroy(sid, callback) {
        try {
            const parsed = parseToken(sid);
            if (!parsed) {
                this.requestStore.delete(sid);
                return callback?.();
            }
            const em = this.orm.em.fork();
            await em.nativeDelete(Session, { id: parsed.id });
            this.requestStore.delete(sid);
            callback?.();
            return undefined;
        }
        catch (error) {
            return callback?.(error);
        }
    }
    async touch(sid, _, callback) {
        try {
            const parsed = parseToken(sid);
            if (!parsed)
                {return callback?.();}
            const em = this.orm.em.fork();
            await em.nativeUpdate(Session, { id: parsed.id }, { last_activity: Math.floor(Date.now() / 1000) });
            return callback?.();
        }
        catch (error) {
            return callback?.(error);
        }
    }
    static isExpired(session) {
        const now = Math.floor(Date.now() / 1000);
        const maxAge = Math.floor(variables.SESSION_MAX_AGE / 1000);
        return (now - session.last_activity) > maxAge;
    }
}
