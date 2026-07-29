/**
 * Single-use password-reset record keyed by account email.
 *
 * @property {string} email - Email address that requested the reset.
 * @property {string} tokenHash - HMAC digest of the emailed reset token.
 * @property {Date} createdAt - Time used to enforce reset-token expiry.
 */
export class PasswordReset {
    email;
    tokenHash;
    createdAt = new Date();
}
