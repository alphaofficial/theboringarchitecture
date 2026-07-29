/**
 * Persistent application account and authentication state.
 *
 * @property {string} id - Stable user identifier.
 * @property {string} name - User's display name.
 * @property {string} email - Unique login email.
 * @property {string} password - Password hash; never plaintext.
 * @property {Date} [emailVerifiedAt] - Time the email address was verified.
 * @property {string} [rememberToken] - Optional long-lived authentication token.
 * @property {Date} createdAt - Account creation time.
 * @property {Date} updatedAt - Last account update time.
 */
export class User {
    id;
    name;
    email;
    password;
    emailVerifiedAt;
    rememberToken;
    createdAt = new Date();
    updatedAt = new Date();
    constructor(id, name, email, password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
    }
}
