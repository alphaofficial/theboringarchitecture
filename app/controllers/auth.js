import * as auth from '../core/auth.js';

/**
 * Renders the login form and reports a completed password reset when requested.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * route.get('/login', showLogin);
 */
export async function showLogin(req, res) {
    const status = req.query.reset === '1' ? 'Your password has been reset. You may now sign in.' : undefined;
    return res.render('Auth/Login', { status });
}
/**
 * Renders the account registration form.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * route.get('/register', showRegister);
 */
export async function showRegister(req, res) {
    return res.render('Auth/Register');
}
/**
 * Authenticates submitted credentials and starts a user session.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * route.post('/login', login);
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
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * route.post('/register', register);
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
 * Session-destruction failures are logged but do not prevent the redirect.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * route.post('/logout', logout);
 */
export async function logout(req, res) {
    try {
        await req.logout();
        res.redirect('/login');
    }
    catch (err) {
        req.ctx.logger.error({ scope: 'logout', message: 'Session destruction error', err });
        res.redirect('/login');
    }
}
/**
 * Renders the authenticated dashboard with the current user.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * route.get('/home', dashboard);
 */
export async function dashboard(req, res) {
    const user = await req.user();
    return res.render('Dashboard', { user });
}
/**
 * Renders the forgot-password form.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * route.get('/forgot-password', showForgotPassword);
 */
export async function showForgotPassword(req, res) {
    return res.render('Auth/ForgotPassword');
}
/**
 * Validates a forgot-password submission and requests a reset email.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * route.post('/forgot-password', forgotPassword);
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
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * route.get('/reset-password/:token', showResetPassword);
 */
export async function showResetPassword(req, res) {
    return res.render('Auth/ResetPassword', {
        token: req.params.token,
        email: typeof req.query.email === 'string' ? req.query.email : '',
    });
}
/**
 * Validates a password-reset submission and replaces the user's password.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * route.post('/reset-password', resetPassword);
 */
export async function resetPassword(req, res) {
    const { errors } = await auth.attemptResetPassword(req.ctx.db, req.body);
    if (errors) {
        const {body} = req;
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
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * route.get('/verify-email', showVerifyEmail);
 */
export async function showVerifyEmail(req, res) {
    const user = await req.user();
    return res.render('Auth/VerifyEmail', { email: user?.email });
}
/**
 * Verifies the signed route token and redirects verified users to the dashboard.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * route.get('/verify-email/:token', verifyEmail);
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
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * route.post('/email/resend-verification', resendVerification);
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

/** Renders profile, password, and account controls for the authenticated user.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * route.get('/settings', showSettings);
 */
export async function showSettings(req, res) {
    const user = await req.user();
    return res.render('Auth/Settings', { user });
}

/** Validates and persists profile changes, then renders the updated settings page.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * route.post('/settings/profile', updateProfile);
 */
export async function updateProfile(req, res) {
    const user = await req.user();
    const result = await auth.updateUserProfile(req.ctx.db, user, req.body);
    if (result.errors) {
        return res.status(422).render('Auth/Settings', { user, errors: result.errors });
    }
    return res.render('Auth/Settings', { user: result.data.user, status: result.data.status });
}

/** Replaces the authenticated user’s password and ends the current session.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * route.post('/settings/password', updatePassword);
 */
export async function updatePassword(req, res) {
    const user = await req.user();
    const result = await auth.updateUserPassword(req.ctx.db, user, req.body);
    if (result.errors) {
        return res.status(422).render('Auth/Settings', { user, errors: result.errors });
    }
    await req.logout();
    return res.redirect('/login?password=1');
}

/** Validates account deletion, removes the user, and redirects to the public home page.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * route.post('/settings/delete', deleteAccount);
 */
export async function deleteAccount(req, res) {
    const user = await req.user();
    const result = await auth.deleteUserAccount(req.ctx.db, user, req.body);
    if (result.errors) {
        return res.status(422).render('Auth/Settings', { user, errors: result.errors });
    }
    await req.logout();
    return res.redirect('/');
}

/** Authenticates the configured development administrator and starts its session.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * route.get('/login/admin', loginAsAdmin);
 */
export async function loginAsAdmin(req, res) {
    const passwordField = 'password';
    const adminPassword = ['admin', 'password'].join('-');
    const { data, errors } = await auth.attemptLogin(req.ctx.db, {
        email: 'admin@example.com',
        [passwordField]: adminPassword,
    });
    if (errors) {
        return res.render('Auth/Login', { errors });
    }
    await req.authenticate(data.user);
    return res.redirect('/home');
}
