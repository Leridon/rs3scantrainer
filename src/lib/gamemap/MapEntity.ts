import {Observable, observe} from "../reactive";
import * as leaflet from "leaflet"
import observe_combined = Observable.observe_combined;
import Widget from "../ui/Widget";
import GameLayer from "./GameLayer";
import {GameMap} from "./GameMap";
import {ZoomLevels} from "./ZoomLevels";
import {GameMapContextMenuEvent} from "./MapEvents";
import {MenuEntry} from "../../trainer/ui/widgets/ContextMenu";
import {QuadTree} from "../QuadTree";
import {TileRectangle} from "lib/runescape/coordinates";
import {Rectangle} from "../math";

export abstract class MapEntity extends leaflet.FeatureGroup implements QuadTree.Element<MapEntity> {
    public tooltip_hook: Observable<Promise<Element>> = observe(null)

    spatial: QuadTree<this>;
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
                this.parent?.updateHovering(this, true)
            })

            this.on("mouseout", () => {
                this.parent?.updateHovering(this, false)
            })
        }
    }

    abstract bounds(): Rectangle

    isActive(): boolean {
        return this.parent?.activeEntity() == this
    }

    setHighlight(v: boolean): this {
        if (v && !this.entity_config.highlightable)
            return this

        this.highlighted.set(v)

        return this
    }

    setOpacity(o: number): this {
        this.opacity.set(o)
        return this
    }

    protected abstract render_implementation(options: MapEntity.RenderOptions): Promise<Element>

    public async renderTooltip(): Promise<{ content: Widget, interactive: boolean } | null> {
        return null
    }

    render() {
        this.clearLayers()

        if (!this.parent?.getMap()) return

        this.rendering_lock = true

        this.tooltip_hook.set(this.render_implementation({
            highlight: this.highlighted.value(),
            opacity: this.opacity.value(),
            viewport: this.parent.getMap().viewport.value()
        }))

        this.rendering_lock = false
    }

    requestActivation(force_interactive: boolean | undefined) {
        return this.parent?.requestEntityActivation(this, force_interactive)
    }

    async resetActivation() {
        if (this.isActive()) {
            await this.parent?.requestEntityActivation(null)
        }
    }

    async contextMenu(event: GameMapContextMenuEvent): Promise<(MenuEntry & { type: "submenu" }) | null> {
        return null
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