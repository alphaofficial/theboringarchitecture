import nodemailer from 'nodemailer';
import variables from '../../../../config/variables.js';
import { PinoLogger } from '../../../logger/pinoLogger.js';

const requiredConfiguration = ['MAIL_HOST', 'MAIL_USER', 'MAIL_PASS'];
/**
 * Missing configuration.
 *
 * @returns {string[]} Names of required mail settings that are not configured.
 */
const missingConfiguration = () => requiredConfiguration.filter((key) => !variables[key]);
/**
 * Get transporter.
 *
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @returns {import('nodemailer').Transporter} Cached or newly configured SMTP transporter.
 */
const getTransporter = (state) => {
    if (state.transporter) {
        return state.transporter;
    }
    const runtime = state;
    runtime.transporter = nodemailer.createTransport({
        host: variables.MAIL_HOST,
        port: variables.MAIL_PORT,
        auth: {
            user: variables.MAIL_USER,
            pass: variables.MAIL_PASS,
        },
    });
    return runtime.transporter;
};
/**
 * Sends a rendered mail message.
 *
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @param {{to: string|string[], subject: string, html?: string, text?: string}} message Mail message fields.
 * @returns {Promise<void>} Resolves when the operation completes.
 */
const sendMail = async (state, message) => {
    const missing = missingConfiguration();
    if (missing.length > 0) {
        PinoLogger.warn({
            scope: 'sendMail',
            message: 'SMTP is not configured; skipping email',
            missing,
        });
        return;
    }
    await getTransporter(state).sendMail({
        from: variables.MAIL_FROM,
        to: message.to,
        subject: message.subject,
        html: message.html,
    });
};
/**
 * Creates an SMTP mail transport with a lazily initialized Nodemailer client.
 * @returns {{sendMail: (message: {to: string, subject: string, html: string}) => Promise<void>}} Mail driver that sends rendered messages through the configured SMTP server.
 * @example
 * const mail = createSmtpMailDriver();
 * await mail.sendMail({
 *     to: 'user@example.com',
 *     subject: 'Welcome',
 *     html: '<p>Welcome aboard.</p>',
 * });
 */
export function createSmtpMailDriver() {
    const state = { transporter: null };
    return {
        sendMail: (message) => sendMail(state, message),
    };
}
