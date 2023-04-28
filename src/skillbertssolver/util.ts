
/**
 * Used to provide literal typing of map keys while also constraining each value
 */
export function constrainedMap<Q>() {
	return function <T extends { [key: string]: Q }>(v: T) {
		return v as { [k in keyof T]: Q };
	}
}

export type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (...args: any) => Promise<infer R> ? R : any

/**
 * used to get an array with enum typing
 */
export function arrayEnum<Q extends string>(v: Q[]) {
	return v;
}

export function posmod(x: number, mod: number) {
	return ((x % mod) + mod) % mod;
}

export function mapObject<V, K extends string, U>(obj: { [key in K]: V }, cb: (v: V) => U): { [key in K]: U } {
	let r = {} as any;
	for (let k in obj) {
		r[k] = cb(obj[k]);
	}
	return r;
}