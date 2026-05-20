import { sendWelcomeEmail } from '@/core/mail';
import { Queue } from '@/primitives/queue';

Queue.on('sendWelcomeEmail', sendWelcomeEmail);
