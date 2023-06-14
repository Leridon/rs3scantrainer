import type {ActiveLayer} from "../activeLayer";

export default abstract class LayerInteraction<T extends ActiveLayer> {
    private is_active: boolean

    protected constructor(protected layer: T) {
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
}