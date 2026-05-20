import { PinoLogger } from '@/logger/pinoLogger';
import { Bus } from '@/primitives/bus';

Bus.on('auth.registered', (payload) => {
	const { email } = payload as { email: string };
	return PinoLogger.info({ scope: 'Auth', message: 'User registered', params: { email } });
});
