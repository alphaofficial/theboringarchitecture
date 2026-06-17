import { PinoLogger } from '@/logger/pinoLogger';
import { Bus } from '@/primitives/bus';

const onAuthRegistered = (payload: unknown): void => {
	const { email } = payload as { email: string };
	PinoLogger.info({ scope: 'onAuthRegistered', message: 'User registered', email });
};

Bus.on('auth.registered', onAuthRegistered);
