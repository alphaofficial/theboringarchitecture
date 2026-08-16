/**
 * Renders the HTML body for a new user's welcome email.
 * @param {Record<string, string|number|boolean|import('react').ReactNode|undefined>} root0 Component props.
 * @param {string} root0.name Display name used to personalize the generated content.
 * @param {string} root0.appName Application name.
 * @returns {import('react').ReactElement|string} Rendered React content.
 * @example
 * WelcomeEmail();
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
