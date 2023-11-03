import type {ActiveLayer} from "../../../../lib/gamemap/activeLayer";
import Widget from "../../../../lib/ui/Widget";
import TopControl from "../../../../lib/gamemap/TopControl";
import {TypedEmitter} from "../../../../skillbertssolver/eventemitter";

type InteractionEvents<events extends Record<string, any>> = events & {
    "started": null,
    "stopped": null
}

export default abstract class LayerInteraction<T extends ActiveLayer, events extends Record<string, any> = {}> {
    public events = new TypedEmitter<InteractionEvents<events>>()

    private is_active: boolean

    protected constructor(public layer: T) {
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

    tapEvents(f: ((e: TypedEmitter<InteractionEvents<events>>) => any)): this {
        f(this.events)
        return this
    }
}