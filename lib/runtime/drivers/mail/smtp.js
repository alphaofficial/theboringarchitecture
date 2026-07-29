import nodemailer from 'nodemailer';
import variables from '../../../../config/variables.js';
const getTransporter = (state) => {
    if (state.transporter) {
        return state.transporter;
    }
    if (!process.env.MAIL_HOST) {
        throw new Error('SMTP driver requires MAIL_HOST to be configured');
    }
    state.transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT ?? 587),
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });
    return state.transporter;
};
const sendMail = async (state, message) => {
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
 * @throws {Error} When the first message is sent without `MAIL_HOST` configured.
 */
export function createSmtpMailDriver() {
    const state = { transporter: null };
    return {
        sendMail: (message) => sendMail(state, message),
    };
}
