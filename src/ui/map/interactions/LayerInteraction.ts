import type {ActiveLayer} from "../activeLayer";
import Widget from "../../widgets/Widget";

export default abstract class LayerInteraction<T extends ActiveLayer> {
    private is_active: boolean

    protected constructor(public layer: T) {
    }

    getTopControl(): Widget {
        return Widget.wrap($(`<div class='nis-map-control'>Test Control for Interaction ${this.constructor.name}</div>`))
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

    get
}