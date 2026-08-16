import { getPrimitiveRuntime, hasPrimitiveRuntime, registerPrimitiveRuntime } from '../../lib/runtime/primitiveRegistry.js';

/**
 * Configures the mail driver.
 *
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} driver Primitive driver implementation.
 * @returns {void} No return value.
 */
const configure = (driver) => {
    if (hasPrimitiveRuntime('mail')) {
        return;
    }
    registerPrimitiveRuntime('mail', {
        driver,
    });
};

/**
 * Sends an email message.
 *
 * @param {string} to Recipient email address.
 * @param {string} subject Message subject.
 * @param {string} html HTML message body.
 * @returns {Promise<void>} Resolves when finished.
 */
const send = async (to, subject, html) => {
    await getPrimitiveRuntime('mail').driver.sendMail({ to, subject, html });
};

/** Provides the Mailer public API for its configured application behavior. */
export const Mailer = Object.freeze({
    configure,
    send,
});
