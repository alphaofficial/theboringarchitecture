import { cleanExpiredSessions } from '../core/session.js';
import { CronExpression, Scheduler } from '../../lib/primitives/scheduler.js';

Scheduler.on(CronExpression.EVERY_HOUR, cleanExpiredSessions, { distributed: true });
