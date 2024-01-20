import {OpacityGroup} from "./layers/OpacityLayer";
import {observe} from "../reactive";

export abstract class GameEntity extends OpacityGroup {

    private rendering: boolean = false

    highlighted = observe(false)
    highlightable: boolean = false

    protected constructor() {
        super();

        this.highlighted.subscribe((v) => {
            this.render()
        })

        this.on("mouseover", () => {
            if (!this.rendering && this.highlightable) this.highlighted.set(true)
        })

        this.on("mouseout", () => {
            if (!this.rendering) this.highlighted.set(false)
        })
    }

    setHighlightable(v: boolean): this {
        this.highlightable = v

        if (this.highlightable) this.highlighted.set(false)

        return this
    }

    protected abstract render_implementation(options: GameEntity.RenderOptions): void

    render() {
        this.clearLayers()

        this.rendering = true

        this.render_implementation({
            highlight: this.highlighted.value()
        })

        this.rendering = false
    }
}

export namespace GameEntity {
    export type RenderOptions = {
        highlight: boolean,
    }
}