/*
    - Does every Behaviour have a parent? YES, except roots
    - Does every Behaviour connect to the application in some way? YES, via its parents.
    - Ressources used by the behaviour must be available via its constructor OR via its parent
    - Is the parent set on construction or on start()? Construction

 */

import {EwentHandlerPool} from "../reactive/EwentHandlerPool";

export default abstract class Behaviour {
    protected handler_pool: EwentHandlerPool = new EwentHandlerPool()
    private _subBehaviours: Behaviour[] = []

    private _started = false

    withSub<T extends Behaviour>(sub: T): T {
        this._subBehaviours.push(sub)

        if (this._started) sub.start()

        return sub
    }

    start(): this {
        if (this._started) throw new TypeError()

        this._started = true

        this.begin()

        this._subBehaviours.forEach(c => c.start())

        return this
    }

    stop() {
        this._subBehaviours.forEach(c => c.stop())

        this.handler_pool.kill()

        if (this._started) this.end()
    }

    isActive(): boolean {
        return this._started
    }

    protected abstract begin()

    protected abstract end()
}

export class SingleBehaviour<T extends Behaviour = Behaviour> extends Behaviour {
    private behaviour: T = null

    protected begin() {
        if (this.behaviour) this.behaviour.start()
    }

    protected end() {
        if (this.behaviour) this.behaviour.stop()
    }

    get(): T {
        return this.behaviour
    }

    set(behaviour: T): this {
        if (this.behaviour) {
            if (this.behaviour.isActive()) this.behaviour.stop()
            this.behaviour = null
        }

        if (behaviour) {
            this.behaviour = behaviour
            if (this.isActive()) behaviour.start()
        }

        return this
    }
}