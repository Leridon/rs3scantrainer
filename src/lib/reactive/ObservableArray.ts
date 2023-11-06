import {Observable} from "./Observable";
import {ewent} from "./Ewent";

/**
 * The observed value is considered to change when any of its elements change.
 * In addition, there are several events that allow a more detailed view on changes
 */
export class ObservableArray<T> extends Observable.AbstractObservable<ObservableArray.ObservableArrayValue<T>[]> {
    element_added = ewent<ObservableArray.ObservableArrayValue<T>>()
    element_removed = ewent<ObservableArray.ObservableArrayValue<T>>()
    element_changed = ewent<ObservableArray.ObservableArrayValue<T>>()
    array_changed = ewent<{ order: boolean, set: boolean, data: ObservableArray.ObservableArrayValue<T>[] }>()

    constructor() {
        super();

        this._value = []
    }

    override update(f: (v: ObservableArray.ObservableArrayValue<T>[]) => void) {
        throw new TypeError("Operation not supported! Use setTo or other observable mutations!")
    }

    override set(v: ObservableArray.ObservableArrayValue<T>[]) {
        throw new TypeError("Operation not supported! Use setTo or other modifiers")
    }

    add(v: T): ObservableArray.ObservableArrayValue<T> {
        let e = new ObservableArray.ObservableArrayValue<T>(this, v, this._value.length)

        this._value.push(e)

        this.element_added.trigger(e)
        this.changed.trigger({value: this._value})
        this.array_changed.trigger({order: true, set: true, data: this._value})

        return e
    }

    remove(v: ObservableArray.ObservableArrayValue<T>): void {
        let i = this.value().indexOf(v)

        if (i >= 0) {
            let [e] = this._value.splice(i, 1)

            this.element_removed.trigger(e)
            this.changed.trigger({value: this._value})
            this.array_changed.trigger({order: true, set: true, data: this._value})
            e.removed.trigger(e)
        }
    }

    setTo(data: T[]): this {
        for (let valueElement of this.value()) {
            valueElement.removed.trigger(valueElement)
        }

        this._value = data.map((e, i) => new ObservableArray.ObservableArrayValue<T>(this, e, i))

        this._value.forEach(e => this.element_added.trigger(e))
        this.changed.trigger({value: this._value})

        this.array_changed.trigger({order: true, set: true, data: this._value})

        return this
    }
}

export namespace ObservableArray {
    export class ObservableArrayValue<T> extends Observable.Simple<T> {
        removed = ewent<ObservableArrayValue<T>>()

        constructor(private parent: ObservableArray<T>,
                    value: T,
                    public index: number
        ) {
            super(value);

            this.changed.on(() => {
                this.parent.element_changed.trigger(this)
                this.parent.changed.trigger({value: this.parent.value()})
            })
        }

        remove(): void {
            this.parent?.remove(this)
        }
    }
}