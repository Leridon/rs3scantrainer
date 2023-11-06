import {Observable} from "./Observable";
import {Ewent} from "./Ewent";

export class ObservableArray<T> extends Observable.AbstractObservable<ObservableArray.ObservableArrayValue<T>[]> {
    added = new Ewent<ObservableArray.ObservableArrayValue<T>>()
    removed = new Ewent<ObservableArray.ObservableArrayValue<T>>()
    element_changed = new Ewent<ObservableArray.ObservableArrayValue<T>>()
    any_change = new Ewent<ObservableArray.ObservableArrayValue<T>[]>

    constructor() {
        super();

        this.added.on(() => this.any_change.trigger(this.value()))
        this.removed.on(() => this.any_change.trigger(this.value()))
        this.element_changed.on(() => this.any_change.trigger(this.value()))
        this.changed.on(() => this.any_change.trigger(this.value()))
    }

    override update(f: (v: ObservableArray.ObservableArrayValue<T>[]) => void) {
        throw new TypeError("Operation not supported! Uset setTo or other observable mutations!")
    }

    override set(v: ObservableArray.ObservableArrayValue<T>[]) {
        throw new TypeError("Operation not supported! Uset setTo or other modifiers")
    }

    add(v: T): ObservableArray.ObservableArrayValue<T> {
        let e = new ObservableArray.ObservableArrayValue<T>(this, v)

        this._value.push(e)

        this.trigger_changed(undefined)
        this.added.trigger(e)
        this.any_change.trigger(this.value())

        return e
    }

    remove(v: ObservableArray.ObservableArrayValue<T>): void {
        let i = this.value().indexOf(v)

        if (i >= 0) {
            this.update(d => {
                let [e] = d.splice(i, 1)
                this.removed.trigger(e)
                e.removed.trigger(e)
            })
        }
    }

    setTo(data: T[]): void {

    }
}

export namespace ObservableArray {
    export class ObservableArrayValue<T> extends Observable.Simple<T> {
        removed = new Ewent<ObservableArrayValue<T>>()

        constructor(private parent: ObservableArray<T>,
                    value: T) {
            super(value);
        }

        remove(): void {
            this.parent?.remove(this)
        }

        trigger_changed(old_value: T): Promise<any> {
            super.trigger_changed(old_value);

            return this.parent?.element_changed?.trigger(this)
        }
    }
}