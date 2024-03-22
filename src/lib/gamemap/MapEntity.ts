import {Observable, observe} from "../reactive";
import * as leaflet from "leaflet"
import observe_combined = Observable.observe_combined;
import Widget from "../ui/Widget";
import {GameLayer} from "./GameLayer";
import {FloorLevels, ZoomLevels} from "./ZoomLevels";
import {GameMapContextMenuEvent} from "./MapEvents";
import {Menu, MenuEntry} from "../../trainer/ui/widgets/ContextMenu";
import {QuadTree} from "../QuadTree";
import {Rectangle} from "../math";
import {floor_t} from "../runescape/coordinates";

export abstract class MapEntity extends leaflet.FeatureGroup implements QuadTree.Element<MapEntity> {
    public tooltip_hook: Observable<Promise<Element>> = observe(null)

    spatial: QuadTree<this>;
    public parent: GameLayer | null = null

    zoom_sensitivity_layers: ZoomLevels<any> = ZoomLevels.none
    floor_sensitivity_layers: FloorLevels<any> = FloorLevels.none

    render_group: Observable<{ floor: number, zoom: number }> = observe({floor: 0, zoom: 0}).equality((a, b) => a.floor == b.floor && a.zoom == b.zoom)
    highlighted = observe(false)
    visible = observe(true)
    opacity = observe(1)
    culled = observe(false)

    private rendering_requested: boolean = false
    protected rendered_props: MapEntity.RenderProps = null
    private desired_render_props: Observable<MapEntity.RenderProps> = observe(null).equality(MapEntity.RenderProps.equals)

    protected constructor(protected entity_config: MapEntity.SetupOptions) {
        super([]);

        if (entity_config.interactive) {
            this.on("mouseover", () => {
                this.parent?.updateHovering(this, true)
            })

            this.on("mouseout", () => {
                this.parent?.updateHovering(this, false)
            })
        }

        observe_combined({
            v: this.visible,
            c: this.culled,
            o: this.opacity,
            h: this.highlighted,
            g: this.render_group
        }).subscribe(() => this.desired_render_props.set(this.getDesiredRenderProps()), true)

        this.desired_render_props.subscribe(() => this.requestRendering())
    }

    remove(): this {
        if (this.parent) {
            this.parent.removeEntity(this)
        } else {
            super.remove()
        }

        return this
    }

    getDesiredRenderProps(): MapEntity.RenderProps {
        const floor_group = this.floor_sensitivity_layers.get(this.render_group.value().floor)
        const zoom_group = this.zoom_sensitivity_layers.get(this.render_group.value().zoom)

        return {
            render_at_all: !floor_group.hidden_here && !zoom_group.hidden_here && this.visible.value() && !this.culled.value(),
            opacity: this.opacity.value(),
            highlight: this.highlighted.value(),
            zoom_group_index: this.render_group.value().zoom,
            floor_group_index: this.render_group.value().floor,
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

    setVisible(v: boolean): this {
        this.visible.set(v)
        return this
    }

    protected abstract render_implementation(props: MapEntity.RenderProps): Promise<Element>

    public async renderTooltip(): Promise<{ content: Widget, interactive: boolean } | null> {
        return null
    }

    requestRendering() {
        if (this.parent && !this.rendering_requested) {
            this.rendering_requested = true
            this.parent.rendering.request(this)
        }
    }

    render(force: boolean = false) {
        if (!force && !this.rendering_requested) return

        this.rendering_requested = false

        const props = this.desired_render_props.value()

        if (!this.parent?.getMap()) return

        if (!force && MapEntity.RenderProps.equals(this.rendered_props, props)) return
        this.rendered_props = props

        this.clearLayers()

        if (!props.render_at_all) return;

        this.tooltip_hook.set(this.render_implementation(props))
    }

    requestActivation(force_interactive: boolean | undefined) {
        return this.parent?.requestEntityActivation(this, force_interactive)
    }

    async resetActivation() {
        if (this.isActive()) {
            await this.parent?.requestEntityActivation(null)
        }
    }

    async contextMenu(event: GameMapContextMenuEvent): Promise<Menu | null> {
        return null
    }

    setCulled(v: boolean) {
        this.culled.set(v)
    }

    setOpacity(v: number) {
        this.opacity.set(v)
    }

    setFloorAndZoom(floor: floor_t, zoom: number) {
        const z = this.zoom_sensitivity_layers.getGroupIndex(zoom)
        const f = this.floor_sensitivity_layers.getGroupIndex(floor)

        this.render_group.set({floor: f, zoom: z})
    }
}

export namespace MapEntity {
    export type SetupOptions = {
        highlightable?: boolean,
        interactive?: boolean
    }

    export const default_zoom_scale_layers = new ZoomLevels<{ scale: number }>([
        {min: -100, value: {scale: 0.25}},
        {min: 0, value: {scale: 0.5}},
        {min: 1.5, value: {scale: 1}},
    ])

    export const default_local_zoom_scale_layers = new ZoomLevels<{ scale: number }>([
        {min: -100, hidden_here: true, value: {scale: 0.25}},
        {min: 0, value: {scale: 0.5}},
        {min: 5, value: {scale: 1}},
    ])

    export type RenderProps = {
        render_at_all: boolean,
        highlight: boolean,
        opacity: number,
        zoom_group_index: number,
        floor_group_index: number
    }

    export namespace RenderProps {
        export function equals(a: RenderProps, b: RenderProps): boolean {
            if (a == null || b == null) return false

            if (!a.render_at_all && !b.render_at_all) return true

            return a.render_at_all == b.render_at_all &&
                a.highlight == b.highlight &&
                a.opacity == b.opacity &&
                a.floor_group_index == b.floor_group_index &&
                a.zoom_group_index == b.zoom_group_index
        }
    }
}