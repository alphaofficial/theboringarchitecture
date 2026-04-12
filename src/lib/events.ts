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

const instance = new TypedEmitter();

export class Emitter {
    static emit<K extends keyof HatchEvents>(event: K, payload: HatchEvents[K]): boolean {
        return instance.emit(event, payload);
    }

    static on<K extends keyof HatchEvents>(event: K, listener: (payload: HatchEvents[K]) => void): void {
        instance.on(event, listener);
    }

    static off<K extends keyof HatchEvents>(event: K, listener: (payload: HatchEvents[K]) => void): void {
        instance.off(event, listener);
    }

    static removeAllListeners(event?: keyof HatchEvents): void {
        if (event === undefined) {
            instance.removeAllListeners();
        } else {
            instance.removeAllListeners(event as string);
        }
    }
}
