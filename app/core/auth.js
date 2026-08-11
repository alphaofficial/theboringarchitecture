import crypto from 'crypto';
import variables from '../../config/variables.js';
import { User } from '../models/User.js';
import { PasswordReset } from '../models/PasswordReset.js';
import { Session } from '../models/Session.js';
import { hash } from '../../lib/utilities/hash.js';
import { Bus } from '../primitives/bus.js';
import { Queue } from '../primitives/queue.js';
import { Mailer } from '../primitives/mail.js';
import { MailTemplate } from '../support/mailTemplate.js';
import { validate } from '../support/validation.js';

MailTemplate.define('auth.verifyEmail', ({ introHtml, verifyUrl }) => ({
    subject: 'Verify your email address',
    html: `
        ${introHtml}
        <p><a href="${verifyUrl}">Click here to verify your email address</a></p>
        <p>If you did not create an account, please ignore this email.</p>
    `,
}));

MailTemplate.define('auth.passwordReset', ({ resetUrl, expiryMinutes }) => ({
    subject: 'Password Reset Request',
    html: `
        <p>You requested a password reset for your account.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>This link expires in ${expiryMinutes} minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
    `,
}));

/**
 * Field-level validation messages keyed by input name.
 *
 * @typedef {Record<string, string[]>} AuthErrors
 */

/**
 * Success-or-validation-error result returned by authentication operations.
 *
 * @template T
 * @typedef {{data: T, errors: null}|{data: null, errors: AuthErrors}} AuthResult
 */

/**
 * Claims stored in a signed email-verification token.
 *
 * @typedef {Object} VerificationPayload
 * @property {string} id - User identifier.
 * @property {string} email - Email address being verified.
 * @property {number} iat - Token issue time in Unix milliseconds.
 */

/**
 * Normalizes an unknown form value to a trimmed string.
 *
 * @param {unknown} value - Submitted form value.
 * @returns {string} The trimmed value, or an empty string for non-string input.
 */
function readString(value) {
    return typeof value === 'string' ? value.trim() : '';
}
/**
 * Performs the application's lightweight email-format check.
 *
 * @param {string} value - Email candidate.
 * @returns {boolean} Whether the value resembles an email address.
 */
function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
/**
 * Checks whether a validation error bag contains any fields.
 *
 * @param {AuthErrors} errors - Validation errors keyed by field.
 * @returns {boolean} Whether at least one field failed validation.
 */
function hasErrors(errors) {
    return Object.keys(errors).length > 0;
}
/**
 * Parses and validates login form input.
 *
 * @param {unknown} body - Untrusted request body.
 * @returns {{email: string, password: string, errors: AuthErrors}} Normalized credentials and validation errors.
 */
function readLogin(body) {
    const data = body;
    const email = readString(data?.email);
    const password = readString(data?.password);
    const errors = {};
    if (!isEmail(email)) {
        errors.email = ['Invalid email address'];
    }
    if (!password) {
        errors.password = ['Password is required'];
    }
    return { email, password, errors };
}
/**
 * Parses and validates registration form input.
 *
 * @param {unknown} body - Untrusted request body.
 * @returns {{name: string, email: string, password: string, errors: AuthErrors}} Normalized account data and validation errors.
 */
function readRegister(body) {
    const data = body;
    const name = readString(data?.name);
    const email = readString(data?.email);
    const password = readString(data?.password);
    const passwordConfirmation = readString(data?.password_confirmation);
    const errors = {};
    if (!name) {
        errors.name = ['Name is required'];
    }
    if (!isEmail(email)) {
        errors.email = ['Invalid email address'];
    }
    if (password.length < 8) {
        errors.password = ['Password must be at least 8 characters'];
    }
    if (passwordConfirmation.length < 8) {
        errors.password_confirmation = ['Password confirmation must be at least 8 characters'];
    }
    else if (password !== passwordConfirmation) {
        errors.password_confirmation = ["Passwords don't match"];
    }
    return { name, email, password, errors };
}
/**
 * Parses and validates a forgot-password request.
 *
 * @param {unknown} body - Untrusted request body.
 * @returns {{email: string, errors: AuthErrors}} Normalized email and validation errors.
 */
function readForgotPassword(body) {
    const data = body;
    const email = readString(data?.email);
    const errors = {};
    if (!isEmail(email)) {
        errors.email = ['Invalid email address'];
    }
    return { email, errors };
}
/**
 * Parses and validates password-reset form input.
 *
 * @param {unknown} body - Untrusted request body.
 * @returns {{token: string, email: string, password: string, errors: AuthErrors}} Normalized reset data and validation errors.
 */
function readResetPassword(body) {
    const data = body;
    const token = readString(data?.token);
    const email = readString(data?.email);
    const password = readString(data?.password);
    const passwordConfirmation = readString(data?.password_confirmation);
    const errors = {};
    if (!token) {
        errors.token = ['Token is required'];
    }
    if (!isEmail(email)) {
        errors.email = ['Invalid email address'];
    }
    if (password.length < 8) {
        errors.password = ['Password must be at least 8 characters'];
    }
    if (passwordConfirmation.length < 8) {
        errors.password_confirmation = ['Password confirmation must be at least 8 characters'];
    }
    else if (password !== passwordConfirmation) {
        errors.password_confirmation = ["Passwords don't match"];
    }
    return { token, email, password, errors };
}
/**
 * Validates an email-verification token's signature and configured lifetime.
 *
 * @param {string} token - Signed verification token.
 * @returns {AuthResult<{payload: VerificationPayload}>} Verified claims or a user-facing token error.
 */
function readVerificationToken(token) {
    const payload = verifyVerificationToken(token);
    if (!payload) {
        return { data: null, errors: { email: ['This verification link is invalid.'] } };
    }
    const expiryMs = variables.EMAIL_VERIFICATION_EXPIRY * 60 * 1000;
    if (Date.now() - payload.iat > expiryMs) {
        return { data: null, errors: { email: ['This verification link has expired. Please request a new one.'] } };
    }
    return { data: { payload }, errors: null };
}
/**
 * Creates an HMAC-signed email-verification token.
 *
 * @param {string} userId - User identifier to bind to the token.
 * @param {string} email - Email address to bind to the token.
 * @returns {string} Base64url claims followed by a hexadecimal SHA-256 signature.
 */
export function makeVerificationToken(userId, email) {
    const payload = Buffer.from(JSON.stringify({ id: userId, email, iat: Date.now() })).toString('base64url');
    const sig = crypto.createHmac('sha256', variables.APP_KEY).update(payload).digest('hex');
    return `${payload}.${sig}`;
}
/**
 * Verifies an email-verification token's signature and decodes its claims.
 *
 * This checks integrity and payload decoding only; expiration is enforced by
 * the higher-level verification flow.
 *
 * @param {string} token - Signed verification token.
 * @returns {VerificationPayload|null} Decoded claims, or `null` when invalid.
 */
export function verifyVerificationToken(token) {
    const dot = token.lastIndexOf('.');
    if (dot < 0)
        return null;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expected = crypto.createHmac('sha256', variables.APP_KEY).update(payload).digest('hex');
    const sigBuf = Buffer.from(sig, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        return null;
    }
    try {
        return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    }
    catch {
        return null;
    }
}
/**
 * Authenticates a user and publishes `auth.loggedIn` on success.
 *
 * @param {import('@mikro-orm/core').EntityManager} database - Entity manager used to find the account.
 * @param {string} email - Account email address.
 * @param {string} password - Plaintext password to verify.
 * @returns {Promise<User|null>} The authenticated user, or `null` for invalid credentials.
 */
export async function loginUser(database, email, password) {
    const user = await database.findOne(User, { email });
    if (!user) {
        return null;
    }
    if (!(await hash.check(password, user.password))) {
        return null;
    }
    Bus.publish('auth.loggedIn', { id: user.id, email: user.email });
    return user;
}
/**
 * Sends a user an email containing a signed verification link.
 *
 * @param {Pick<User, 'id'|'email'>} user - Recipient and token identity.
 * @param {string} introHtml - Trusted HTML inserted before the verification link.
 * @returns {Promise<void>} Resolves after the configured mail transport accepts the message.
 */
export async function sendVerificationEmail(user, introHtml) {
    const token = makeVerificationToken(user.id, user.email);
    const verifyUrl = `${variables.APP_URL}/verify-email/${token}`;
    const message = MailTemplate.render('auth.verifyEmail', { introHtml, verifyUrl });
    await Mailer.send(user.email, message.subject, message.html);
}
/**
 * Creates a new account and publishes `auth.registered`.
 *
 * @param {import('@mikro-orm/core').EntityManager} database - Entity manager used to persist the account.
 * @param {string} name - Display name for the new user.
 * @param {string} email - Unique account email.
 * @param {string} password - Validated plaintext password.
 * @returns {Promise<AuthResult<{user: User}>>} The created user or an email-conflict error.
 */
export async function registerUser(database, name, email, password) {
    const existingUser = await database.findOne(User, { email });
    if (existingUser) {
        return { data: null, errors: { email: ['Email already taken'] } };
    }
    const hashedPassword = await hash.make(password);
    const user = new User(crypto.randomUUID(), name, email, hashedPassword);
    await database.persistAndFlush(user);
    Bus.publish('auth.registered', { id: user.id, email: user.email });
    return { data: { user }, errors: null };
}
/**
 * Replaces any existing reset token and emails a new password-reset link.
 *
 * Unknown email addresses are ignored to avoid disclosing registered accounts.
 *
 * @param {import('@mikro-orm/core').EntityManager} database - Entity manager used for user and reset records.
 * @param {string} email - Account email address.
 * @returns {Promise<void>} Resolves after the request is ignored or the email is sent.
 */
export async function requestPasswordReset(database, email) {
    const user = await database.findOne(User, { email });
    if (!user) {
        return;
    }
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHmac('sha256', variables.APP_KEY).update(rawToken).digest('hex');
    await database.nativeDelete(PasswordReset, { email });
    const reset = database.create(PasswordReset, { email, tokenHash, createdAt: new Date() });
    await database.persistAndFlush(reset);
    const resetUrl = `${variables.APP_URL}/reset-password/${rawToken}?email=${encodeURIComponent(email)}`;
    const message = MailTemplate.render('auth.passwordReset', {
        resetUrl,
        expiryMinutes: variables.PASSWORD_RESET_EXPIRY,
    });
    await Mailer.send(email, message.subject, message.html);
}
/**
 * Replaces a password using a valid, unexpired reset token.
 *
 * A successful reset consumes the token and invalidates all sessions for the user.
 *
 * @param {import('@mikro-orm/core').EntityManager} database - Entity manager used for reset, user, and session records.
 * @param {string} token - Raw reset token from the emailed link.
 * @param {string} email - Email address associated with the reset request.
 * @param {string} password - Validated new plaintext password.
 * @returns {Promise<AuthResult<Record<string, never>>>} Empty success data or a token error.
 */
export async function resetUserPassword(database, token, email, password) {
    const tokenHash = crypto.createHmac('sha256', variables.APP_KEY).update(token).digest('hex');
    const reset = await database.findOne(PasswordReset, { email, tokenHash });
    if (!reset) {
        return { data: null, errors: { token: ['This password reset link is invalid.'] } };
    }
    const expiryMs = variables.PASSWORD_RESET_EXPIRY * 60 * 1000;
    if (Date.now() - reset.createdAt.getTime() > expiryMs) {
        await database.nativeDelete(PasswordReset, { email });
        return { data: null, errors: { token: ['This password reset link has expired. Please request a new one.'] } };
    }
    const user = await database.findOne(User, { email });
    if (!user) {
        return { data: null, errors: { token: ['This password reset link is invalid.'] } };
    }
    user.password = await hash.make(password);
    await database.nativeDelete(PasswordReset, { email });
    await database.nativeDelete(Session, { user_id: user.id });
    await database.flush();
    return { data: {}, errors: null };
}
/**
 * Marks the matching user's email as verified and publishes `auth.verified`.
 *
 * The operation is idempotent for users who are already verified.
 *
 * @param {import('@mikro-orm/core').EntityManager} database - Entity manager used to update the user.
 * @param {VerificationPayload} payload - Trusted claims from a verified token.
 * @returns {Promise<AuthResult<{user: User}>>} The verified user or an invalid-link error.
 */
export async function verifyUserEmail(database, payload) {
    const user = await database.findOne(User, { id: payload.id, email: payload.email });
    if (!user) {
        return { data: null, errors: { email: ['This verification link is invalid.'] } };
    }
    if (!user.emailVerifiedAt) {
        user.emailVerifiedAt = new Date();
        await database.flush();
        Bus.publish('auth.verified', { id: user.id, email: user.email });
    }
    return { data: { user }, errors: null };
}
/**
 * Validates submitted login data and authenticates the matching user.
 *
 * @param {import('@mikro-orm/core').EntityManager} database - Entity manager used for authentication.
 * @param {unknown} body - Untrusted request body.
 * @returns {Promise<AuthResult<{user: User}>>} The authenticated user or field-level errors.
 */
export async function attemptLogin(database, body) {
    const { email, password, errors } = readLogin(body);
    if (hasErrors(errors)) {
        return { data: null, errors };
    }
    const user = await loginUser(database, email, password);
    if (!user) {
        return { data: null, errors: { email: ['Invalid credentials'] } };
    }
    return { data: { user }, errors: null };
}
/**
 * Validates registration data, creates the account, and triggers welcome flows.
 *
 * @param {import('@mikro-orm/core').EntityManager} database - Entity manager used to create the account.
 * @param {unknown} body - Untrusted request body.
 * @returns {Promise<AuthResult<{user: User}>>} The created user or field-level errors.
 */
export async function attemptRegister(database, body) {
    const { name, email, password, errors } = readRegister(body);
    if (hasErrors(errors)) {
        return { data: null, errors };
    }
    const result = await registerUser(database, name, email, password);
    if (result.errors) {
        return result;
    }
    await sendVerificationEmail(result.data.user, `<p>Welcome to ${variables.APP_NAME}!</p>`);
    await Queue.dispatch('sendWelcomeEmail', {
        to: result.data.user.email,
        name: result.data.user.name,
    });
    return result;
}
/**
 * Validates a forgot-password request and requests a reset link.
 *
 * @param {import('@mikro-orm/core').EntityManager} database - Entity manager used for reset records.
 * @param {unknown} body - Untrusted request body.
 * @returns {Promise<AuthResult<{status: string}>>} A neutral success message or field-level errors.
 */
export async function attemptForgotPassword(database, body) {
    const { email, errors } = readForgotPassword(body);
    if (hasErrors(errors)) {
        return { data: null, errors };
    }
    await requestPasswordReset(database, email);
    return { data: { status: 'We have emailed your password reset link!' }, errors: null };
}
/**
 * Validates reset form data and attempts to replace the user's password.
 *
 * @param {import('@mikro-orm/core').EntityManager} database - Entity manager used for the reset.
 * @param {unknown} body - Untrusted request body.
 * @returns {Promise<AuthResult<Record<string, never>>>} Empty success data or validation/token errors.
 */
export async function attemptResetPassword(database, body) {
    const { token, email, password, errors } = readResetPassword(body);
    if (hasErrors(errors)) {
        return { data: null, errors };
    }
    return resetUserPassword(database, token, email, password);
}
/**
 * Validates and consumes an email-verification token.
 *
 * @param {import('@mikro-orm/core').EntityManager} database - Entity manager used to update the user.
 * @param {string} token - Signed verification token.
 * @returns {Promise<AuthResult<{user: User}|{payload: VerificationPayload}>>} The verified user or a token error.
 */
export async function attemptVerifyEmail(database, token) {
    const verification = readVerificationToken(token);
    if (verification.errors) {
        return verification;
    }
    return verifyUserEmail(database, verification.data.payload);
}
/**
 * Sends a fresh verification link unless the user is already verified.
 *
 * @param {Pick<User, 'id'|'email'|'emailVerifiedAt'>} user - Current user and verification state.
 * @returns {Promise<AuthResult<{status: string}>>} A status suitable for display to the user.
 */
export async function resendVerification(user) {
    if (user.emailVerifiedAt) {
        return { data: { status: 'Your email is already verified.' }, errors: null };
    }
    await sendVerificationEmail(user, '<p>Please verify your email address.</p>');
    return { data: { status: 'A new verification link has been sent to your email address.' }, errors: null };
}
export async function updateUserProfile(database, user, body) {
    const result = validate(body, {
        name: 'required|string|max:255',
        email: 'required|email|max:255',
    });
    if (!result.valid) return { data: null, errors: result.errors };

    const email = String(result.data.email);
    const existingUser = await database.findOne(User, { email });
    if (existingUser && existingUser.id !== user.id) {
        return { data: null, errors: { email: ['Email already taken'] } };
    }

    const emailChanged = user.email !== email;
    user.name = String(result.data.name);
    user.email = email;
    if (emailChanged) user.emailVerifiedAt = null;
    await database.flush();
    if (emailChanged) await sendVerificationEmail(user, '<p>Please verify your new email address.</p>');
    return { data: { user, status: emailChanged ? 'Profile updated. Please verify your new email address.' : 'Profile updated.' }, errors: null };
}

export async function updateUserPassword(database, user, body) {
    const result = validate(body, {
        current_password: 'required',
        password: 'required|min:8|confirmed',
    });
    if (!result.valid) return { data: null, errors: result.errors };
    if (!(await hash.check(String(result.data.current_password), user.password))) {
        return { data: null, errors: { current_password: ['Current password is incorrect'] } };
    }
    user.password = await hash.make(String(result.data.password));
    await database.nativeDelete(Session, { user_id: user.id });
    await database.flush();
    return { data: { status: 'Password updated. Please sign in again.' }, errors: null };
}

export async function deleteUserAccount(database, user, body) {
    const result = validate(body, { password: 'required' });
    if (!result.valid) return { data: null, errors: result.errors };
    if (!(await hash.check(String(result.data.password), user.password))) {
        return { data: null, errors: { password: ['Password is incorrect'] } };
    }
    await database.nativeDelete(Session, { user_id: user.id });
    await database.removeAndFlush(user);
    return { data: { status: 'Account deleted.' }, errors: null };
}

/**
 * Logs the payload received for an `auth.registered` event.
 *
 * @param {import('../../lib/runtime/context.js').ApplicationContext} ctx - Shared application dependencies.
 * @param {unknown} payload - Published registration event payload.
 * @returns {void}
 */
export function onAuthRegistered(ctx, payload) {
    ctx.logger.info({ scope: 'onAuthRegistered', message: 'User registered', payload });
}
;
