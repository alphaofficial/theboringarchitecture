import { getPrimitiveRuntime, hasPrimitiveRuntime, registerPrimitiveRuntime } from '@/runtime/primitiveRegistry';

export interface MailMessage {
	to: string;
	subject: string;
	html: string;
}

export interface MailTransport {
	sendMail(message: MailMessage): Promise<void>;
}

interface MailRuntime {
	driver: MailTransport;
}

/**
 * Mail primitive for selecting a transport and sending outbound mail.
 */
export class Mailer {
	private static runtimeKey = 'mail';

	static configure(driver: MailTransport): void {
		if (hasPrimitiveRuntime(Mailer.runtimeKey)) {
			return;
		}

		registerPrimitiveRuntime<MailRuntime>(Mailer.runtimeKey, {
			driver,
		});
	}

	private static runtime(): MailRuntime {
		return getPrimitiveRuntime<MailRuntime>(Mailer.runtimeKey);
	}

	private static driver(): MailTransport {
		return Mailer.runtime().driver;
	}

	static async send(to: string, subject: string, html: string): Promise<void> {
		await Mailer.driver().sendMail({ to, subject, html });
	}
}
