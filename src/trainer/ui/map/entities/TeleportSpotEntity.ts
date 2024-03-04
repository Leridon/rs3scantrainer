import {MapEntity} from "../../../../lib/gamemap/MapEntity";
import * as leaflet from "leaflet";
import {Vector2} from "../../../../lib/math";
import Widget from "../../../../lib/ui/Widget";
import Properties from "../../widgets/Properties";
import {Transportation} from "../../../../lib/runescape/transportation";
import {identity} from "lodash";
import {C} from "../../../../lib/ui/constructors";
import {direction} from "../../../../lib/runescape/movement";
import {MenuEntry} from "../../widgets/ContextMenu";
import {GameMapContextMenuEvent} from "../../../../lib/gamemap/MapEvents";
import vbox = C.vbox;
import entity = C.entity;
import TeleportAccess = Transportation.TeleportAccess;
import {TileArea} from "../../../../lib/runescape/coordinates/TileArea";
import * as assert from "assert";
import {areaPolygon} from "../../polygon_helpers";

export class TeleportSpotEntity extends MapEntity {

    zoom_sensitivity_layers = MapEntity.default_zoom_scale_layers

    constructor(public config: TeleportSpotEntity.Config) {
        super(config);

        this.floor_sensitive = true
        this.zoom_sensitive = true
    }

    async render_implementation(options: MapEntity.RenderOptions): Promise<Element> {
        const scale = (options.highlight ? 1.5 : (this.zoom_sensitivity_layers.get(options.viewport.zoom).scale))

        const marker = leaflet.marker(Vector2.toLatLong(this.config.teleport.centerOfTarget()), {
            icon: new TeleportSpotEntity.TeleportMapIcon(this.config.teleport, scale, w => {
                if (options.viewport.rect.level != this.config.teleport.centerOfTarget().level) w.css("filter", "grayscale(1) brightness(0.5)")

                return w
            }),
            riseOnHover: true
        }).addTo(this)

        if(options.highlight) {
            areaPolygon(this.config.teleport.targetArea())
                .setStyle({
                    fillColor: "lightgreen",
                    color: "lightgreen",
                    stroke: true
                }).addTo(this)
        }

        return marker.getElement()
    }

    async renderTooltip(): Promise<{ content: Widget, interactive: boolean } | null> {
        let props = new Properties()

        const teleport = this.config.teleport

        props.header(`${teleport.group.name} - ${teleport.spot.name}`)
        props.named("Time", `${teleport.props.menu_ticks + teleport.props.animation_ticks} (${teleport.props.menu_ticks} menu + ${teleport.props.animation_ticks} animation)`)
        props.named("Static", teleport.spot.target.size ? "No" : "Yes")

        if (teleport.spot.facing != null) {
            props.named("Orientation", direction.toString(teleport.spot.facing))
        }

        props.named("Access", vbox(
            ...teleport.group.access.map(access => {
                switch (access.type) {
                    case "spellbook":
                        return C.div().text(access.name)
                    case "item":
                    case "entity":
                        return c().append(entity(access.name))
                }

            })
        ))


        return {
            content: props,
            interactive: false
        }
    }


    async contextMenu(event: GameMapContextMenuEvent): Promise<(MenuEntry & { type: "submenu" }) | null> {
        const teleport = this.config.teleport;

        const jumpable_accesses: TeleportAccess[] = teleport.group.access.filter(a => a.type == "entity")

        if (jumpable_accesses.length > 0) {
            event.addForEntity({
                type: "submenu",
                text: "Jump to Access",
                children: jumpable_accesses.map(a => {
                    assert(a.type == "entity")

                    return {
                        type: "basic",
                        text: entity(a.name),
                        handler: () => {
                            this.parent?.getMap()?.fitView(TileArea.toRect(a.area))
                        }
                    }
                })
            })
        }

        return {
            type: "submenu",
            icon: `assets/icons/teleports/${teleport.image().url}`,
            text: teleport.hover(),
            children: []
        }
    }
}

export namespace TeleportSpotEntity {
    import img = C.img;
    import div = C.div;
    export type Config = MapEntity.SetupOptions & {
        teleport: Transportation.TeleportGroup.Spot
    }

    export class TeleportMapIcon extends leaflet.DivIcon {
        constructor(tele: Transportation.TeleportGroup.Spot, scale: number = 1, transformer: (w: Widget) => Widget = identity) {
            let i = img(`./assets/icons/teleports/${tele.image().url}`)

            i.css2({
                "width": tele.image().width ? tele.image().width + "px" : "auto",
                "height": tele.image().height ? tele.image().height + "px" : "auto",
            })

            super({
                iconSize: [0, 0],
                iconAnchor: [0, 0],
                html: transformer(div(
                    i,
                    tele.code() ? C.div().text(tele.code()) : undefined
                ).css("scale", scale.toString()).addClass("ctr-map-teleport-icon")).raw()
            });
        }
    }

    export function accessNameAsWidget(access: TeleportAccess): Widget {
        switch (access.type) {
            case "spellbook":
                return c().text(access.name)
            case "item":
            case "entity":
                return entity(access.name)
        }
    }
}