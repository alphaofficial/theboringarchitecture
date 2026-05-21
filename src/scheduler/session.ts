import { cleanExpiredSessions } from '@/core/session';
import { Scheduler } from '@/primitives/scheduler';

Scheduler.on('0 * * * *', cleanExpiredSessions);
