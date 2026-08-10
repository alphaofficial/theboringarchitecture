import crypto from 'crypto';

function encode(value) { return Buffer.from(JSON.stringify(value)).toString('base64url'); }
function decode(value) { return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')); }
function sign(payload, secret) { return crypto.createHmac('sha256', secret).update(payload).digest('base64url'); }

/**
 * Build a signed URL with optional expiration metadata.
 *
 * @param {string} path Path or URL to protect.
 * @param {Record<string, unknown>} [params] Payload metadata stored in the signature token.
 * @param {{secret: string, expiresAt?: string|number|Date}} options Signing options.
 * @returns {string} URL containing `signed` and `signature` query parameters.
 */
function create(path, params = {}, { secret, expiresAt } = {}) {
    if (!secret) throw new Error('signed URL secret is required');
    const payload = encode({ path, params, expiresAt: expiresAt ? new Date(expiresAt).getTime() : null });
    const signature = sign(payload, secret);
    const separator = path.includes('?') ? '&' : '?';
    return `${path}${separator}signature=${signature}&signed=${payload}`;
}

/**
 * Verify a signed URL and return the decoded payload when valid.
 *
 * @param {string} url URL or request path containing signature query parameters.
 * @param {{secret: string, now?: number}} options Verification options.
 * @returns {{valid: boolean, reason?: string, path?: string, params?: Record<string, unknown>}}
 */
function verify(url, { secret, now = Date.now() } = {}) {
    if (!secret) throw new Error('signed URL secret is required');
    const parsed = new URL(url, 'http://signed.local');
    const payload = parsed.searchParams.get('signed');
    const signature = parsed.searchParams.get('signature');
    if (!payload || !signature) return { valid: false, reason: 'missing_signature' };
    if (sign(payload, secret) !== signature) return { valid: false, reason: 'invalid_signature' };
    const decoded = decode(payload);
    if (decoded.expiresAt && decoded.expiresAt < now) return { valid: false, reason: 'expired' };
    return { valid: true, path: decoded.path, params: decoded.params };
}

/**
 * Express middleware that rejects invalid or expired signed URLs.
 *
 * @param {{secret: string}} options Signing secret.
 * @returns {import('express').RequestHandler}
 */
function middleware({ secret }) {
    return (req, res, next) => {
        const result = verify(req.originalUrl || req.url, { secret });
        if (!result.valid) return res.status(403).json({ error: 'Invalid or expired signed URL' });
        req.signedUrl = result;
        next();
    };
}

/** Signed URL creation, verification, and Express middleware helpers. */
export const SignedUrl = Object.freeze({ create, verify, middleware });
