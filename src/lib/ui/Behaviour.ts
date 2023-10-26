/*
    - Does every Behaviour have a parent? YES, except roots
    - Does every Behaviour connect to the application in some way? YES, via its parents.
    - Ressources used by the behaviour must be available via its constructor OR via its parent
    - Is the parent set on construction or on start()? Construction

 */

export default abstract class Behaviour {
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

        if (this._started) this.end()
    }

    isActive(): boolean {
        return this._started
    }

    protected abstract begin()

    protected abstract end()
}

export class SingleBehaviour<T extends Behaviour = Behaviour> extends Behaviour {
    private behaviour: Behaviour = null

    protected begin() {
        if (this.behaviour) this.behaviour.start()
    }

    protected end() {
        if (this.behaviour) this.behaviour.stop()
    }

    set(behaviour: T): this {
        if (this.behaviour) {
            if (this.behaviour.isActive()) this.behaviour.stop()
        }

        this.behaviour = behaviour

        if (this.behaviour && this.isActive()) this.behaviour.start()

        return this
    }
}