import * as leaflet from "leaflet"
import {Vector2} from "../../math";
import {Teleports} from "../../runescape/teleports";
import {MapEntity} from "../MapEntity";
import {C} from "../../ui/constructors";
import {OpacityGroup} from "../layers/OpacityLayer";
import div = C.div;
import img = C.img;
import ManagedTeleportData = Teleports.ManagedTeleportData;
import full_teleport_id = Teleports.full_teleport_id;
import Widget from "../../ui/Widget";
import Properties from "../../../trainer/ui/widgets/Properties";

export class TeleportEntity extends MapEntity {

    constructor(public config: TeleportEntity.Config) {
        super(config);

        this.render()
    }

    protected render_implementation(options: MapEntity.RenderOptions) {
        leaflet.marker(Vector2.toLatLong(this.config.teleport.spot), {
            icon: new TeleportMapIcon(this.config.teleport, options.highlight ? "ctr-map-teleport-icon-highlighted" : null),
            riseOnHover: true
        }).addTo(this)
    }

    protected renderTooltip(): Widget | null {
        let props = new Properties()

        props.named("Group", c().text(this.config.teleport.group.name))
        props.named("Name", c().text(this.config.teleport.sub.name))
        props.header("Timing")
        props.named("Interface", c().text(this.config.teleport.menu_ticks + " ticks"))
        props.named("Blocked", c().text(this.config.teleport.animation_ticks + " ticks"))

        return props
    }
}

export namespace TeleportEntity {
    export type Config = MapEntity.SetupOptions & {
        teleport: Teleports.flat_teleport
    }
}

export class TeleportMapIcon extends leaflet.DivIcon {
    constructor(tele: Teleports.flat_teleport, cls: string = undefined) {
        let i = img(`./assets/icons/teleports/${typeof tele.icon == "string" ? tele.icon : tele.icon.url}`)

        if (typeof tele.icon != "string") {
            i.css2({
                "width": tele.icon.width ? tele.icon.width + "px" : "auto",
                "height": tele.icon.height ? tele.icon.height + "px" : "auto",
            })
        }

        super({
            iconSize: [0, 0],
            iconAnchor: [0, 0],
            html: div(
                i,
                tele.code ? c().text(tele.code) : undefined
            ).addClass("ctr-map-teleport-icon").addClass(cls).raw()
        });
    }
}

export class TeleportLayer extends OpacityGroup {
    entities: Map<full_teleport_id, TeleportEntity> = new Map<full_teleport_id, TeleportEntity>()

    constructor(public teleports: ManagedTeleportData) {
        super()

        for (let tele of teleports.getAll()) {
            this.entities.set(tele.id, new TeleportEntity({
                highlightable: true,
                teleport: tele
            }).addTo(this))
        }
    }
}