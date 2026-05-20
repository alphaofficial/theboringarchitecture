import fs from 'node:fs/promises';
import path from 'node:path';
import type { MikroORM } from '@mikro-orm/core';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PinoLogger } from '@/logger/pinoLogger';
import { Mailer } from '@/primitives/mail';
import { Queue } from '@/primitives/queue';
import { User } from '@/models/User';
import type TestAgent from 'supertest/lib/agent';

describe('auth requests', () => {
	const dbPath = path.resolve(process.cwd(), 'test-auth.db');
	let orm: MikroORM;
	let agentFactory: () => TestAgent;

	beforeAll(async () => {
		process.env.NODE_ENV = 'test';
		process.env.TESTS_RUN = '1';
		process.env.DB_PATH = dbPath;
		process.env.APP_URL = 'http://localhost:3000';

		vi.resetModules();
		const { bootstrapTestApp } = await import('./testApp');
		const boot = await bootstrapTestApp();
		orm = boot.orm;
		agentFactory = boot.agent;
	});

	beforeEach(async () => {
		await orm.getSchemaGenerator().clearDatabase();
		vi.restoreAllMocks();
	});

	afterAll(async () => {
		if (orm) {
			await orm.close(true);
		}
		await fs.rm(dbPath, { force: true });
		await fs.rm(`${dbPath}-shm`, { force: true });
		await fs.rm(`${dbPath}-wal`, { force: true });
	});

	it('registers a user through HTTP, starts a session, sends verification mail, and queues the welcome job', async () => {
		const infoSpy = vi.spyOn(PinoLogger, 'info').mockImplementation(() => undefined);
		const mailSpy = vi.spyOn(Mailer, 'send');
		const queueSpy = vi.spyOn(Queue, 'dispatch');
		const agent = agentFactory();

		const response = await agent
			.post('/register')
			.send({
				name: 'Integration User',
				email: 'integration@example.com',
				password: 'password123',
				password_confirmation: 'password123',
			})
			.expect(302);

		expect(response.headers.location).toBe('/verify-email');

		const verifyEmailPage = await agent
			.get('/verify-email')
			.expect(200);

		expect(verifyEmailPage.text).toContain('Verify your email');
		expect(verifyEmailPage.text).toContain('integration@example.com');

		const stored = await orm.em.fork().findOne(User, { email: 'integration@example.com' });
		expect(stored).not.toBeNull();
		expect(stored?.name).toBe('Integration User');
		expect(stored?.password).not.toBe('password123');

		expect(infoSpy).toHaveBeenCalledWith(expect.objectContaining({
			scope: 'Auth',
			message: 'User registered',
			params: { email: 'integration@example.com' },
		}));
		expect(mailSpy).toHaveBeenCalledTimes(1);
		expect(mailSpy.mock.calls[0]?.[0]).toBe('integration@example.com');
		expect(queueSpy).toHaveBeenCalledWith('sendWelcomeEmail', {
			to: 'integration@example.com',
			name: 'Integration User',
		});
	});

	it('rejects duplicate registrations through HTTP with the rendered validation error', async () => {
		await agentFactory()
			.post('/register')
			.send({
				name: 'Integration User',
				email: 'duplicate@example.com',
				password: 'password123',
				password_confirmation: 'password123',
			})
			.expect(302);

		const response = await agentFactory()
			.post('/register')
			.send({
				name: 'Another User',
				email: 'duplicate@example.com',
				password: 'password123',
				password_confirmation: 'password123',
			})
			.expect(200);

		expect(response.text).toContain('Email already taken');
		expect(await orm.em.fork().count(User, { email: 'duplicate@example.com' })).toBe(1);
	});

	it('authenticates valid credentials and rejects invalid ones through HTTP', async () => {
		await agentFactory()
			.post('/register')
			.send({
				name: 'Login User',
				email: 'login@example.com',
				password: 'password123',
				password_confirmation: 'password123',
			})
			.expect(302);

		const invalidLogin = await agentFactory()
			.post('/login')
			.send({
				email: 'login@example.com',
				password: 'wrong-password',
			})
			.expect(200);

		expect(invalidLogin.text).toContain('Invalid credentials');

		const agent = agentFactory();
		const validLogin = await agent
			.post('/login')
			.send({
				email: 'login@example.com',
				password: 'password123',
			})
			.expect(302);

		expect(validLogin.headers.location).toBe('/home');

		const dashboard = await agent.get('/home').expect(200);
		expect(dashboard.text).toContain('User Information');
		expect(dashboard.text).toContain('login@example.com');
	});
});
