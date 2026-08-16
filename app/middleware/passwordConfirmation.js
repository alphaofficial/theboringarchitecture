/**
 * Mark the current session as recently password-confirmed.
 *
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {number} [timestamp] Confirmation time in milliseconds since the Unix epoch.
 * @returns {void} Nothing.
 */
function mark(req, timestamp = Date.now()) {
    req.session.passwordConfirmedAt = timestamp;
}

/**
 * Create middleware that requires a recent password confirmation before continuing.
 *
 * @param {{timeoutMs?: number, now?: () => number}} [options] Freshness window and clock provider.
 * @returns {import('express').RequestHandler} Middleware that rejects stale confirmations.
 */
function requireFresh({ timeoutMs = 15 * 60 * 1000, now = Date.now } = {}) {
    return (req, res, next) => {
        const confirmedAt = req.session?.passwordConfirmedAt;
        if (confirmedAt && now() - confirmedAt <= timeoutMs) return next();
        if (req.accepts?.('html')) return res.redirect('/confirm-password');
        return res.status(423).json({ error: 'Password confirmation required' });
    };
}

/** Session password-confirmation helpers for sensitive form actions. */
export const PasswordConfirmation = Object.freeze({ mark, requireFresh });
