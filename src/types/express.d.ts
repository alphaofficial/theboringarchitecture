import { MikroORM } from '@mikro-orm/core';
import { User } from '@/models/User';
import { PinoLogger } from '@/logger/pinoLogger';
import { AppContext } from '@/runtime/context';

declare module 'express-serve-static-core' {
	interface Request {
		ctx: AppContext;
		orm: MikroORM;
		database: MikroORM['em'];
		logger: typeof PinoLogger;
		user(): Promise<User | null>;
		user_id(): User['id'] | null;
		is_authenticated(): boolean;
		is_guest(): boolean;
		authenticate(user: User): Promise<void>;
		logout(): Promise<void>;
	}
}
