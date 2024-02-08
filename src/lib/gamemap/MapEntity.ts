import {ewent, Observable, observe} from "../reactive";
import * as leaflet from "leaflet"
import observe_combined = Observable.observe_combined;
import * as tippy from "tippy.js";
import Widget from "../ui/Widget";
import {followCursor} from "tippy.js";
import GameLayer from "./GameLayer";
import {floor_t} from "../runescape/coordinates";
import {GameMap} from "./GameMap";
import {ZoomLevels} from "./ZoomLevels";

export abstract class MapEntity extends leaflet.FeatureGroup {
    public parent: GameLayer | null = null
    private rendering_lock: boolean = false

    floor_sensitive: boolean = false
    zoom_sensitive: boolean = false

    zoom_sensitivity_layers: ZoomLevels<any>

    highlighted = observe(false)
    opacity = observe(1)

    protected constructor(protected entity_config: MapEntity.SetupOptions) {
        super();

        observe_combined({
            highlight: this.highlighted,
            opacity: this.opacity
        }).subscribe(() => this.render())

        if (entity_config.interactive) {
            this.on("mouseover", () => {
                this.parent?.requestEntityActivation(this, false)
            })

            this.on("mouseout", () => {
                if (this.isActive()) this.parent?.requestEntityActivation(null, false)
            })

            this.on("click", () => {
                this.parent?.requestEntityActivation(this, true)
            })
        }
    }

    isActive(): boolean {
        return this.parent?.getActiveEntity() == this
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

    public renderTooltip(selected: boolean = false): Widget | null {
        return null
    }

    render() {
        this.clearLayers()

        if (!this.parent?.getMap()) return

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
        highlightable?: boolean,
        interactive?: boolean
    }

    export const default_zoom_scale_layers = new ZoomLevels<{ scale: number }>([
        {min: -100, value: {scale: 0.25}},
        {min: 0, value: {scale: 0.5}},
        {min: 1.5, value: {scale: 1}},
    ])
}