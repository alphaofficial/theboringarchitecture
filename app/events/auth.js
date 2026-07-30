import { Bus } from '../primitives/bus.js';
import { onAuthRegistered } from '../core/auth.js';

Bus.on('auth.registered', (ctx, payload) => onAuthRegistered(ctx, payload));
