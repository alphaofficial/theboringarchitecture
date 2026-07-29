import { getPrimitiveRuntime, hasPrimitiveRuntime, registerPrimitiveRuntime } from '../../lib/runtime/primitiveRegistry.js';
const configure = (driver) => {
    if (hasPrimitiveRuntime('mail')) {
        return;
    }
    registerPrimitiveRuntime('mail', {
        driver,
    });
};
const send = async (to, subject, html) => {
    await getPrimitiveRuntime('mail').driver.sendMail({ to, subject, html });
};
export const Mailer = Object.freeze({
    configure,
    send,
});
