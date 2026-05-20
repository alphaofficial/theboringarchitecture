import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	test: {
		environment: 'node',
		include: ['test/integration/**/*.spec.ts'],
		exclude: ['test/integration/playwright/**'],
		setupFiles: ['test/integration/setup.ts'],
		fileParallelism: false,
		clearMocks: true,
		restoreMocks: true,
	},
});
