import type {ActiveLayer} from "../activeLayer";
import Widget from "../../widgets/Widget";
import TopControl from "../TopControl";
import {TypedEmitter} from "../../../skillbertssolver/eventemitter";

export default abstract class LayerInteraction<T extends ActiveLayer, events extends Record<string, any> = {}> {
    public events: TypedEmitter<events> = new TypedEmitter<events>()

    private is_active: boolean

    constructor(public layer: T) {
    }

    protected top_control: Widget = null

    getTopControl(): Widget {
        if (!this.top_control) this.top_control = this.constructTopControl()

        return this.top_control
    }

    protected constructTopControl(): Widget {
        return new TopControl()
    }

    activate(): this {
        if (!this.is_active) {
            this.layer.setInteraction(this)
            this.is_active = true
        }
        return this
    }

    deactivate(): this {
        if (this.is_active) {
            this.layer.cancelInteraction()
            this.is_active = false
        }
        return this
    }

    abstract start()

    abstract cancel()

    tapEvents(f: ((e: TypedEmitter<events>) => any)): this {
        f(this.events)
        return this
    }
}