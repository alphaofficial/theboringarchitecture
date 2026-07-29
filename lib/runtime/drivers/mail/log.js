import { PinoLogger } from '../../../logger/pinoLogger.js';
const sendMail = async (message) => {
    PinoLogger.info({
        scope: 'sendMail',
        message: 'Sending email',
        to: message.to,
        subject: message.subject
    });
};
/**
 * Creates a development mail transport that logs message metadata.
 *
 * The transport intentionally does not send or log the HTML body.
 *
 * @returns {{
 *   sendMail: (message: {to: string, subject: string, html: string}) => Promise<void>
 * }} A non-delivering mail transport.
 */
export function createLogMailDriver() {
    return {
        sendMail,
    };
}
