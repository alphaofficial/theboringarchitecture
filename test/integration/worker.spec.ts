import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('worker module', () => {
	let initialSigintListeners: NodeJS.SignalsListener[] = [];
	let initialSigtermListeners: NodeJS.SignalsListener[] = [];

	beforeEach(() => {
		vi.resetModules();
		process.env.NODE_ENV = 'test';
		process.env.TESTS_RUN = '1';
		process.env.DATABASE_URL = '';
		initialSigintListeners = process.listeners('SIGINT');
		initialSigtermListeners = process.listeners('SIGTERM');
	});

	afterEach(async () => {
		try {
			const { Queue } = await import('@/primitives/queue');
			await Queue.stop();
		} catch {}

		try {
			const { Scheduler } = await import('@/primitives/scheduler');
			Scheduler.stop();
		} catch {}

		const { clearPrimitiveRuntime } = await import('@/runtime/primitiveRegistry');
		clearPrimitiveRuntime();

		for (const listener of process.listeners('SIGINT')) {
			if (!initialSigintListeners.includes(listener)) {
				process.removeListener('SIGINT', listener);
			}
		}

		for (const listener of process.listeners('SIGTERM')) {
			if (!initialSigtermListeners.includes(listener)) {
				process.removeListener('SIGTERM', listener);
			}
		}

		vi.doUnmock('@/runtime/loadRelativeDirectory');
		vi.restoreAllMocks();
	});

	it('starts queue and scheduler through the worker boot module', async () => {
		const loadRelativeDirectory = vi.fn();
		vi.doMock('@/runtime/loadRelativeDirectory', () => ({
			loadRelativeDirectory,
		}));

		const { PinoLogger } = await import('@/logger/pinoLogger');
		const warnSpy = vi.spyOn(PinoLogger, 'warn').mockImplementation(() => undefined);
		const infoSpy = vi.spyOn(PinoLogger, 'info').mockImplementation(() => undefined);

		const [{ startWorker }, { Queue }, { Scheduler }, primitiveRegistry] = await Promise.all([
			import('@/runtime/startWorker'),
			import('@/primitives/queue'),
			import('@/primitives/scheduler'),
			import('@/runtime/primitiveRegistry'),
		]);
		startWorker();

		await Promise.all([
			import('@/jobs/sendWelcomeEmail'),
			import('@/scheduler/session'),
		]);

		const queueRuntime = primitiveRegistry.getPrimitiveRuntime<{ handlers: Map<string, unknown> }>('queue');

		expect(queueRuntime.handlers.has('sendWelcomeEmail')).toBe(true);
		expect(Scheduler.getRegisteredTasks()).toEqual(
			expect.arrayContaining([{ expression: '0 * * * *' }]),
		);
		expect(loadRelativeDirectory).toHaveBeenCalledWith('jobs');
		expect(loadRelativeDirectory).toHaveBeenCalledWith('scheduler');

		await expect(Queue.dispatch('sendSmoke', { ok: true })).resolves.toBeUndefined();

		expect(warnSpy).toHaveBeenCalledWith(expect.objectContaining({
			scope: 'queue',
			message: 'DATABASE_URL not set — queue worker is disabled',
		}));
		expect(warnSpy).toHaveBeenCalledWith(expect.objectContaining({
			scope: 'queue',
			message: 'DATABASE_URL not set — job dispatch is a no-op',
			params: { jobName: 'sendSmoke' },
		}));
		expect(infoSpy).toHaveBeenCalledWith(expect.objectContaining({
			scope: 'scheduler',
			message: 'Scheduler started with 0 task(s)',
			params: { tasks: [] },
		}));
	});
});
