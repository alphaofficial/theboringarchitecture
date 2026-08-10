/**
 * Mark the current session as recently password-confirmed.
 *
 * @param {import('express').Request} req Request with a session object.
 * @param {number} [timestamp] Milliseconds since epoch, injectable for tests.
 * @returns {void}
 */
function mark(req, timestamp = Date.now()) {
    req.session.passwordConfirmedAt = timestamp;
}

/**
 * Create middleware that requires a recent password confirmation before continuing.
 *
 * @param {{timeoutMs?: number, now?: () => number}} [options]
 * @returns {import('express').RequestHandler}
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
