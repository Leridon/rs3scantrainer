import {Observable, observe} from "../reactive";
import * as leaflet from "leaflet"
import observe_combined = Observable.observe_combined;
import * as tippy from "tippy.js";
import Widget from "../ui/Widget";
import {followCursor} from "tippy.js";
import GameLayer from "./GameLayer";
import {floor_t} from "../runescape/coordinates";
import {GameMap} from "./GameMap";

export abstract class MapEntity extends leaflet.FeatureGroup {
    public parent: GameLayer | null = null
    private rendering_lock: boolean = false

    floor_sensitive: boolean = false

    mouseover = observe(false)
    highlighted = observe(false)
    opacity = observe(1)

    private tooltip_instance: tippy.Instance = null

    protected constructor(protected entity_config: MapEntity.SetupOptions) {
        super();

        observe_combined({
            highlight: this.highlighted,
            opacity: this.opacity
        }).subscribe(() => this.render())

        this.highlighted.subscribe(v => {
            if (!v) this.tooltip_instance?.destroy()
            else {
                let tooltip = this.renderTooltip()

                if (tooltip) {

                    this.tooltip_instance = tippy.default($("body").get()[0], {
                        content: c("<div style='background: rgb(10, 31, 41); border: 2px solid white;padding: 3px'></div>")
                            .append(tooltip).raw(),
                        arrow: true,
                        animation: false,
                        trigger: "manual",
                        zIndex: 10001,
                        delay: 0,
                        followCursor: true,
                        plugins: [followCursor]
                    })

                    this.tooltip_instance.show()
                }
            }
        })

        this.on("mouseover", () => {
            this.mouseover.set(true)
        })

        this.on("mouseout", () => {
            this.mouseover.set(false)
        })

        this.on("click", () => {
            console.log("click")
            console.log(this)
        })

        this.mouseover.subscribe(v => {
            if (!this.rendering_lock && this.entity_config.highlightable) this.highlighted.set(v)
        })
    }

    setHighlight(v: boolean): this {
        if (v && !this.entity_config.highlightable)
            throw new TypeError("Highlight can not be set on this entity")

        this.highlighted.set(v)

        return this
    }

    setOpacity(o: number): this {
        this.opacity.set(o)
        return this
    }

    protected abstract render_implementation(options: MapEntity.RenderOptions): void

    protected renderTooltip(): Widget | null {
        return null
    }

    render() {
        this.clearLayers()

        this.rendering_lock = true

        this.render_implementation({
            highlight: this.highlighted.value(),
            opacity: this.opacity.value(),
            viewport: this.parent.getMap().viewport.value()
        })

        this.rendering_lock = false
    }
}

export namespace MapEntity {
    export type RenderOptions = {
        highlight: boolean,
        opacity: number,
        viewport: GameMap.View
    }

    export type SetupOptions = {
        highlightable?: boolean
    }
}