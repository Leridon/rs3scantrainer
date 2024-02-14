import {MapEntity} from "../../../../lib/gamemap/MapEntity";
import * as leaflet from "leaflet";
import {Vector2} from "../../../../lib/math";
import Widget from "../../../../lib/ui/Widget";
import Properties from "../../widgets/Properties";
import {Transportation} from "../../../../lib/runescape/transportation";
import {identity} from "lodash";
import {C} from "../../../../lib/ui/constructors";

export class TeleportSpotEntity extends MapEntity {

    zoom_sensitivity_layers = MapEntity.default_zoom_scale_layers

    constructor(public config: TeleportSpotEntity.Config) {
        super(config);

        this.floor_sensitive = true
        this.zoom_sensitive = true
    }

    async render_implementation(options: MapEntity.RenderOptions): Promise<Element> {
        const scale = (options.highlight ? 1.5 : (this.zoom_sensitivity_layers.get(options.viewport.zoom).scale))

        const marker = leaflet.marker(Vector2.toLatLong(this.config.teleport.target()), {
            icon: new TeleportSpotEntity.TeleportMapIcon(this.config.teleport, scale, w => {
                if (options.viewport.rect.level != this.config.teleport.target().level) w.css("filter", "grayscale(1) brightness(0.5)")

                return w
            }),
            riseOnHover: true
        }).addTo(this)

        return marker.getElement()
    }

    renderTooltip(): { content: Widget, interactive: boolean } | null {
        let props = new Properties()

        props.named("Group", c().text(this.config.teleport.group.name))
        props.named("Name", c().text(this.config.teleport.spot.name))
        props.header("Timing")
        props.named("Interface", c().text(this.config.teleport.props.menu_ticks + " ticks"))
        props.named("Blocked", c().text(this.config.teleport.props.animation_ticks + " ticks"))

        return {
            content: props,
            interactive: false
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
                    tele.code() ? c().text(tele.code()) : undefined
                ).css("scale", scale.toString()).addClass("ctr-map-teleport-icon")).raw()
            });
        }
    }
}