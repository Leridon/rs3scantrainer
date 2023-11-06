import {EwentHandlerPool} from "./EwentHandlerPool";

export class EwentHandler<T> {
    private alive: boolean = true

    constructor(private handler: (_: T) => void | Promise<void>) { }

    remove() {
        this.alive = false
        this.handler = null // Remove reference to handler to immediately qualify it for garbage collection
    }

    apply(v: T): void | Promise<void> {
        return this.handler(v)
    }

    isAlive(): boolean {
        return this.alive
    }

    bindTo(pool: EwentHandlerPool): this {
        pool.bind(this)

        return this
    }
}

export namespace EventHandler {
    export class Once<T> extends EwentHandler<T> {
        apply(v: T): void | Promise<void> {
            this.remove()
            return super.apply(v)
        }
    }
}