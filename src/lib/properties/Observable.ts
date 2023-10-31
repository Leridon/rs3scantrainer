import {TypedEmitter} from "skillbertssolver/eventemitter";
import Property from "./Property";

export class Observable<T> extends TypedEmitter<{
    changed: { new: T, old: T }
}> implements Property<T> {
    private value: T

    constructor(initial: T,
                private options: {
                    equal_f?: (a: T, b: T) => boolean,
                    read_only?: boolean
                } = {}
    ) {
        super();

        if (!this.options.equal_f) this.options.equal_f = (a, b) => a == b

        this.value = initial
    }

    private _set(v: T) {
        let old = this.value
        this.value = v
        if (!this.options.equal_f(old, this.value)) this.changed(old)
    }

    equality(f: (a: T, b: T) => boolean): this {
        this.options.equal_f = f
        return this
    }

    set(v: T): this {
        if (this.options.read_only) throw new TypeError()
        this._set(v)
        return this
    }

    setAsync(v: Promise<T>): this {
        v.then(val => this.set(val))
        return this
    }

    get(): T {
        return this.value
    }

    update(f: (v: T) => void) {
        f(this.value)
        this.changed(this.value)
    }

    private changed(old_value: T): this {
        this.emit("changed", {new: this.value, old: old_value})
        return this
    }

    subscribe(handler: (new_value: T, old: T) => any, trigger_once: boolean = false): this {
        this.on("changed", (o) => handler(o.new, o.old))

        if (trigger_once) handler(this.value, undefined)

        return this
    }

    bind_to<U extends T>(other: Observable<U>): this {
        other.subscribe(v => this._set(v))

        this._set(other.get())

        return this
    }

    bind(other: Observable<T>): this {
        this.bind_to(other)
        other.bind_to(this)

        return this
    }

    map<U>(f: (v: T) => U): Observable<U> {
        let derived = new Observable<U>(f(this.value), {read_only: true})

        this.subscribe((v) => derived._set(f(v)))

        return derived
    }

    async mapAsync<U>(f: (v: T) => Promise<U>): Promise<Observable<U>> {
        let derived = new Observable<U>(await f(this.value), {read_only: true})

        this.subscribe(async (v) => derived._set(await f(v)))

        return derived
    }
}

export function observe<T>(v: T): Observable<T> {
    return new Observable<T>(v)
}

type ex<T> = T extends Observable<infer U> ? U : never

export function observe_combined<T extends Record<string, Observable<any>>>(o: T): Observable<{ [key in keyof T]?: ex<T[key]> }> {
    let obs: Observable<{ [key in keyof T]?: ex<T[key]> }> = observe({})

    for (let key in o) {
        o[key].subscribe(v => obs.update(observed => observed[key] = v), true)
    }

    return obs
}