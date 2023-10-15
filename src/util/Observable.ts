import {TypedEmitter} from "../skillbertssolver/eventemitter";

export class Observable<T> extends TypedEmitter<{
    changed: { new: T, old: T }
}> {
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

    subscribe(handler: (new_value: T, old: T) => any): this {
        this.on("changed", (o) => handler(o.new, o.old))
        return this
    }

    map<U>(f: (v: T) => U): Observable<U> {
        let derived = new Observable<U>(f(this.value), {read_only: true})

        this.subscribe((v) => derived._set(f(v)))

        return derived
    }
}

export function observe<T>(v: T): Observable<T> {
    return new Observable<T>(v)
}