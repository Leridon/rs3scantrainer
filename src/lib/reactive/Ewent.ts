import {EwentHandler} from "./EwentHandler";

export class Ewent<T> {
    private trigger_count: number = 0
    private handlers: EwentHandler<T>[] = []

    private clean_pass() {
        this.trigger_count += 1

        if (this.trigger_count > 10) {
            this.handlers = this.handlers.filter(s => s.isAlive())
        }
    }

    public on(handler: (_: T) => any | Promise<any>): EwentHandler<T> {
        this.clean_pass()

        let h = new EwentHandler(handler)
        this.handlers.push(h)

        return h
    }

    public trigger(v: T): Promise<void[]> {
        this.clean_pass()

        return Promise.all(this.handlers.filter(h => h.isAlive()).map(h => h.apply(v)))
    }
}

