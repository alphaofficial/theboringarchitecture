import { sendWelcomeEmail } from '../core/mail.js';
import { Queue } from '../../lib/primitives/queue.js';

Queue.on('sendWelcomeEmail', (_ctx, payload) => sendWelcomeEmail(payload));
