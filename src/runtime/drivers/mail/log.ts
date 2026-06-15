import { PinoLogger } from '@/logger/pinoLogger';
import type { MailMessage, MailTransport } from '@/primitives/mail';

export function createLogMailDriver(): MailTransport {
	return {
		async sendMail(message: MailMessage): Promise<void> {
			PinoLogger.info({
				scope: 'mail',
				message: `[LOG DRIVER] To: ${message.to} | Subject: ${message.subject}`,
				params: { html: message.html },
			});
		},
	};
}
