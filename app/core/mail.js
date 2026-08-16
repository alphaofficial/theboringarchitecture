import variables from '../../config/variables.js';
import { PinoLogger } from '../../lib/logger/pinoLogger.js';
import { WelcomeEmail } from '../mail/templates/WelcomeEmail.js';
import { Mailer } from '../../lib/primitives/mail.js';
import { MailTemplate } from '../support/mailTemplate.js';

MailTemplate.define('welcome', ({ name, appName }) => ({
    subject: `Welcome to ${appName}`,
    html: WelcomeEmail({ name, appName }),
}));

/**
 * @typedef SendWelcomeEmailPayload
 * @property {string} to - Recipient email address.
 * @property {string} name - Recipient display name.
 */

/**
 * Renders and sends the standard welcome email, then logs delivery metadata.
 * @param {Record<string, string|number|boolean|null|undefined>} payload Job, event, or notification data to process.
 * @returns {Record<string, string|number|boolean|null>} Rule configuration.
 * @example
 * sendWelcomeEmail(payload);
 */
export async function sendWelcomeEmail(payload) {
    const message = MailTemplate.render('welcome', {
        name: payload.name,
        appName: variables.APP_NAME,
    });
    await Mailer.send(payload.to, message.subject, message.html);
    PinoLogger.info({
        scope: 'sendWelcomeEmail',
        message: 'Sending welcome email',
        to: payload.to,
        name: payload.name,
    });
}
