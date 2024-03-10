import {GameLayer} from "../../../lib/gamemap/GameLayer";
import {Transportation} from "../../../lib/runescape/transportation";
import {TransportData} from "../../../data/transports";
import {MapEntity} from "../../../lib/gamemap/MapEntity";
import {EntityTransportEntity} from "./entities/EntityTransportEntity";
import {TeleportSpotEntity} from "./entities/TeleportSpotEntity";
import TeleportGroup = Transportation.TeleportGroup;
import Dependencies from "../../dependencies";
import {TeleportAccessEntity} from "./entities/TeleportAccessEntity";

export default class TransportLayer extends GameLayer {
    constructor(interactive: boolean) {
        super();

        this.quad_tree_debug_rendering = false

        TransportData.getAll().then(transports => transports.forEach(trans => {
            if (trans.type == "entity" || trans.type == "door") {
                new EntityTransportEntity({
                    highlightable: true,
                    shortcut: trans,
                    interactive: interactive
                }).addTo(this)
            } else if (trans.type == "teleports") {
                trans.spots.forEach(spot => {
                    new TeleportSpotEntity({
                        highlightable: true,
                        teleport: new TeleportGroup.Spot(trans, spot, trans.access[0], Dependencies.instance().app.teleport_settings),
                        interactive: interactive
                    }).addTo(this)
                })

                trans.access.forEach(access => {
                    if (access.type == "entity") {
                        new TeleportAccessEntity({
                            highlightable: true,
                            teleport: trans,
                            access: access,
                            interactive: interactive
                        }).addTo(this)
                    }
                })
            }
        }))
    }
}

export namespace TransportLayer {

    import TeleportAccess = Transportation.TeleportAccess;
    import TeleportGroup = Transportation.TeleportGroup;
    import EntityTransportation = Transportation.EntityTransportation;

    export type Config = {
        contructors?: {
            teleport_access: (_: TeleportAccess) => MapEntity,
            teleport_spot: (_: TeleportGroup.Spot) => TeleportSpotEntity,
            entity_transport: (_: EntityTransportation) => EntityTransportEntity,
            entity_transport_destination: (_: EntityTransportation) => MapEntity
        },

        transport_policy: "all" | "none",
        teleport_policy: "all" | "none"
    }
}