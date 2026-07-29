import variables from '../../config/variables.js';
import { PinoLogger } from '../../lib/logger/pinoLogger.js';
import { WelcomeEmail } from '../mail/templates/WelcomeEmail.js';
import { Mailer } from '../primitives/mail.js';

/**
 * @typedef {Object} SendWelcomeEmailPayload
 * @property {string} to - Recipient email address.
 * @property {string} name - Recipient display name.
 */

/**
 * Renders and sends the standard welcome email, then logs delivery metadata.
 *
 * @param {SendWelcomeEmailPayload} payload - Welcome-email recipient data.
 * @returns {Promise<void>} Resolves after the configured mail transport accepts the message.
 */
export async function sendWelcomeEmail(payload) {
    await Mailer.send(payload.to, `Welcome to ${variables.APP_NAME}`, WelcomeEmail({
        name: payload.name,
        appName: variables.APP_NAME,
    }));
    PinoLogger.info({
        scope: 'sendWelcomeEmail',
        message: 'Sending welcome email',
        to: payload.to,
        name: payload.name,
    });
}
