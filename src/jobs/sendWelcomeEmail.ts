import { PinoLogger } from '../logger/pinoLogger';

interface SendWelcomeEmailPayload {
	to: string;
	name?: string;
}

export async function sendWelcomeEmail(payload: unknown): Promise<void> {
	const { to, name } = payload as SendWelcomeEmailPayload;
	PinoLogger.info('job:sendWelcomeEmail', `Sending welcome email to ${to}`, { to, name });
}
