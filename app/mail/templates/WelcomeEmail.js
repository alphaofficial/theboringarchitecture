/**
 * Renders the HTML body for a new user's welcome email.
 *
 * @param {Object} data - Template data.
 * @param {string} data.name - Recipient display name.
 * @param {string} [data.appName='The Boring Architecture'] - Product name shown in the message.
 * @returns {string} Rendered welcome-email HTML.
 */
export function WelcomeEmail({ name, appName = 'The Boring Architecture' }) {
    return `
        <h1>Welcome to ${appName}, ${name}!</h1>
        <p>We're glad to have you on board.</p>
        <p>Get started by exploring the app at your own pace.</p>
        <p>If you have any questions, feel free to reach out.</p>
        <p>— The ${appName} Team</p>
    `;
}
