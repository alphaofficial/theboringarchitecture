import nodemailer from 'nodemailer';
import variables from '../../../../config/variables.js';
import { PinoLogger } from '../../../logger/pinoLogger.js';
const requiredConfiguration = ['MAIL_HOST', 'MAIL_USER', 'MAIL_PASS'];
const missingConfiguration = () => requiredConfiguration.filter((key) => !variables[key]);
const getTransporter = (state) => {
    if (state.transporter) {
        return state.transporter;
    }
    state.transporter = nodemailer.createTransport({
        host: variables.MAIL_HOST,
        port: variables.MAIL_PORT,
        auth: {
            user: variables.MAIL_USER,
            pass: variables.MAIL_PASS,
        },
    });
    return state.transporter;
};
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
 *
 * @returns {{
 *   sendMail: (message: {to: string, subject: string, html: string}) => Promise<void>
 * }} An SMTP-backed mail transport.
 * Missing SMTP configuration causes sends to log a warning and resolve without delivery.
 */
export function createSmtpMailDriver() {
    const state = { transporter: null };
    return {
        sendMail: (message) => sendMail(state, message),
    };
}
