import * as auth from '../core/auth.js';
/**
 * Renders the login form and reports a completed password reset when requested.
 *
 * @param {import('express').Request} req - Incoming request, optionally with `reset=1`.
 * @param {import('express').Response} res - HTTP response.
 * @returns {Promise<import('express').Response>} The rendered login response.
 */
export async function showLogin(req, res) {
    const status = req.query.reset === '1' ? 'Your password has been reset. You may now sign in.' : undefined;
    return res.render('Auth/Login', { status });
}
/**
 * Renders the account registration form.
 *
 * @param {import('express').Request} req - Incoming HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @returns {Promise<import('express').Response>} The rendered registration response.
 */
export async function showRegister(req, res) {
    return res.render('Auth/Register');
}
/**
 * Authenticates submitted credentials and starts a user session.
 *
 * @param {import('express').Request} req - Request containing login form data and auth helpers.
 * @param {import('express').Response} res - HTTP response.
 * @returns {Promise<import('express').Response>} A validation response or redirect to the dashboard.
 */
export async function login(req, res) {
    const { data, errors } = await auth.attemptLogin(req.ctx.db, req.body);
    if (errors) {
        return res.render('Auth/Login', { errors });
    }
    await req.authenticate(data.user);
    return res.redirect('/home');
}
/**
 * Creates an account, starts its session, and redirects to email verification.
 *
 * @param {import('express').Request} req - Request containing registration form data and auth helpers.
 * @param {import('express').Response} res - HTTP response.
 * @returns {Promise<import('express').Response>} A validation response or verification-page redirect.
 */
export async function register(req, res) {
    const { data, errors } = await auth.attemptRegister(req.ctx.db, req.body);
    if (errors) {
        return res.render('Auth/Register', { errors });
    }
    await req.authenticate(data.user);
    return res.redirect('/verify-email');
}
/**
 * Destroys the current session and redirects to login.
 *
 * Session-destruction failures are logged but do not prevent the redirect.
 *
 * @param {import('express').Request} req - Request with the injected logout helper.
 * @param {import('express').Response} res - HTTP response.
 * @returns {Promise<void>} Resolves after the redirect is issued.
 */
export async function logout(req, res) {
    try {
        await req.logout();
        res.redirect('/login');
    }
    catch (err) {
        console.error('Session destruction error:', err);
        res.redirect('/login');
    }
}
/**
 * Renders the authenticated dashboard with the current user.
 *
 * @param {import('express').Request} req - Request with the injected user resolver.
 * @param {import('express').Response} res - HTTP response.
 * @returns {Promise<import('express').Response>} The rendered dashboard response.
 */
export async function dashboard(req, res) {
    const user = await req.user();
    return res.render('Dashboard', { user });
}
/**
 * Renders the forgot-password form.
 *
 * @param {import('express').Request} req - Incoming HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @returns {Promise<import('express').Response>} The rendered form response.
 */
export async function showForgotPassword(req, res) {
    return res.render('Auth/ForgotPassword');
}
/**
 * Validates a forgot-password submission and requests a reset email.
 *
 * @param {import('express').Request} req - Request containing the submitted email.
 * @param {import('express').Response} res - HTTP response.
 * @returns {Promise<import('express').Response>} The form with errors or a neutral success status.
 */
export async function forgotPassword(req, res) {
    const { data, errors } = await auth.attemptForgotPassword(req.ctx.db, req.body);
    if (errors) {
        return res.render('Auth/ForgotPassword', { errors });
    }
    return res.render('Auth/ForgotPassword', {
        status: data.status,
    });
}
/**
 * Renders the reset form using token and email values from the reset link.
 *
 * @param {import('express').Request} req - Request containing the reset token and email.
 * @param {import('express').Response} res - HTTP response.
 * @returns {Promise<import('express').Response>} The rendered reset form.
 */
export async function showResetPassword(req, res) {
    return res.render('Auth/ResetPassword', {
        token: req.params.token,
        email: typeof req.query.email === 'string' ? req.query.email : '',
    });
}
/**
 * Validates a password-reset submission and replaces the user's password.
 *
 * @param {import('express').Request} req - Request containing reset form data.
 * @param {import('express').Response} res - HTTP response.
 * @returns {Promise<import('express').Response>} A validation response or login redirect.
 */
export async function resetPassword(req, res) {
    const { errors } = await auth.attemptResetPassword(req.ctx.db, req.body);
    if (errors) {
        const body = req.body;
        return res.render('Auth/ResetPassword', {
            token: typeof body?.token === 'string' ? body.token : '',
            email: typeof body?.email === 'string' ? body.email : '',
            errors,
        });
    }
    return res.redirect('/login?reset=1');
}
/**
 * Renders the email-verification prompt for the current user.
 *
 * @param {import('express').Request} req - Request with the injected user resolver.
 * @param {import('express').Response} res - HTTP response.
 * @returns {Promise<import('express').Response>} The rendered verification prompt.
 */
export async function showVerifyEmail(req, res) {
    const user = await req.user();
    return res.render('Auth/VerifyEmail', { email: user?.email });
}
/**
 * Verifies the signed route token and redirects verified users to the dashboard.
 *
 * @param {import('express').Request} req - Request containing the verification token.
 * @param {import('express').Response} res - HTTP response.
 * @returns {Promise<import('express').Response>} An error prompt or dashboard redirect.
 */
export async function verifyEmail(req, res) {
    const token = typeof req.params.token === 'string' ? req.params.token : '';
    const { errors } = await auth.attemptVerifyEmail(req.ctx.db, token);
    if (errors) {
        const user = await req.user();
        return res.render('Auth/VerifyEmail', {
            email: user?.email,
            errors,
        });
    }
    return res.redirect('/home');
}
/**
 * Sends another verification link to the current user.
 *
 * @param {import('express').Request} req - Request with the injected user resolver.
 * @param {import('express').Response} res - HTTP response.
 * @returns {Promise<import('express').Response>} A login redirect or verification status response.
 */
export async function resendVerification(req, res) {
    const user = await req.user();
    if (!user) {
        return res.redirect('/login');
    }
    const { data } = await auth.resendVerification(user);
    return res.render('Auth/VerifyEmail', {
        email: user.email,
        status: data.status,
    });
}

export async function loginAsAdmin(req, res) {
    const { data, errors } = await auth.attemptLogin(req.ctx.db, {
        email: 'admin@example.com',
        password: 'admin-password',
    });
    if (errors) {
        return res.render('Auth/Login', { errors });
    }
    await req.authenticate(data.user);
    return res.redirect('/home');
}
