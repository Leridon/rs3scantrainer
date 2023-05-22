export class TypedEmitter<T extends Record<string, any>> {
	private listeners: { [key in keyof T]?: Set<(v: T[key]) => void> } = {};
	on<K extends keyof T>(event: K, listener: (v: T[K]) => void) {
		let listeners = this.listeners[event] ?? (this.listeners[event] = new Set());
		listeners.add(listener);
	}
	once<K extends keyof T>(event: K, listener: (v: T[K]) => void) {
		let listeners = this.listeners[event] ?? (this.listeners[event] = new Set());
		let oncer = (v: T[K]) => {
			listeners.delete(oncer);
			listener(v);
		}
		listeners.add(oncer);
	}
	// promise<K extends keyof T>(event: K, abort: AbortSignal) {
	// 	return new Promise((done, err) => {
	// 		abort.throwIfAborted();
	// 		let listeners = this.listeners[event] ?? (this.listeners[event] = new Set());
	// 		let aborted = (reason: unknown) => {
	// 			listeners.delete(cb);
	// 			abort.removeEventListener("abort", aborted);
	// 			err(reason);
	// 		};
	// 		let cb = (data: T[K]) => {
	// 			listeners.delete(cb);
	// 			abort.removeEventListener("abort", aborted)
	// 			done(data);
	// 		}
	// 		listeners.add(done);
	// 		abort.addEventListener("abort", aborted);
	// 	});
	// }

	off<K extends keyof T>(event: K, listener: (v: T[K]) => void) {
		let listeners = this.listeners[event] ?? (this.listeners[event] = new Set());
		listeners.delete(listener);
	}
	emit<K extends keyof T>(event: K, value: T[K]) {
		let listeners = this.listeners[event] ?? (this.listeners[event] = new Set());
		listeners.forEach(cb => {
			console.log(cb)
			cb(value)
		});
	}
}