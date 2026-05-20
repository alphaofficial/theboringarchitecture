import 'dotenv-defaults/config';
import { shutdown } from '@/primitives/shutdown';
import { startWorker } from '@/runtime/startWorker';

const disposables = startWorker();

process.on('SIGTERM', () => void shutdown('SIGTERM', [...disposables]));
process.on('SIGINT', () => void shutdown('SIGINT', [...disposables]));
