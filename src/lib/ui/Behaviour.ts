export default abstract class Behaviour<T extends Behaviour<any> = Behaviour<any>> {

    protected parent: T = null
    protected children: Behaviour<any>[] = []

    private _started = false

    withSub<T extends Behaviour<any>>(sub: T): T {
        this.children.push(sub)

        sub.parent = this

        return sub
    }

    start(): this {
        if (this._started) throw new TypeError()

        this._started = true

        this.begin()

        this.children.forEach(c => c.start())

        return this
    }

    stop() {
        this.children.forEach(c => c.stop())

        this.end()
    }

    protected abstract begin()

    protected abstract end()
}