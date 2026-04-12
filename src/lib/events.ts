import { EventEmitter } from 'node:events';

export interface HatchEvents {
    'user.registered': { id: string; email: string };
    'user.login': { id: string; email: string };
    'user.verified': { id: string; email: string };
}

class TypedEmitter extends EventEmitter {
    emit<K extends keyof HatchEvents>(event: K, payload: HatchEvents[K]): boolean {
        return super.emit(event as string, payload);
    }

    on<K extends keyof HatchEvents>(event: K, listener: (payload: HatchEvents[K]) => void): this {
        return super.on(event as string, listener);
    }

    off<K extends keyof HatchEvents>(event: K, listener: (payload: HatchEvents[K]) => void): this {
        return super.off(event as string, listener);
    }
}

export const emitter = new TypedEmitter();
