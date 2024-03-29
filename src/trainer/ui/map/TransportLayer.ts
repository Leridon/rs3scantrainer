import {GameLayer} from "../../../lib/gamemap/GameLayer";
import {Transportation} from "../../../lib/runescape/transportation";
import {TransportData} from "../../../data/transports";
import {MapEntity} from "../../../lib/gamemap/MapEntity";
import {EntityTransportEntity} from "./entities/EntityTransportEntity";
import {TeleportSpotEntity} from "./entities/TeleportSpotEntity";
import {deps} from "../../dependencies";
import {TeleportAccessEntity} from "./entities/TeleportAccessEntity";
import {RemoteEntityTransportTarget} from "./entities/RemoteEntityTransportTarget";
import TeleportGroup = Transportation.TeleportGroup;
import EntityTransportation = Transportation.EntityTransportation;

export default class TransportLayer extends GameLayer {
  constructor(interactive: boolean) {
    super();

    deps().app.settings.active_teleport_customization.subscribe(customization => {
      console.log("Change registered")

      console.log(customization)

      this.eachEntity(e => {
        if (e instanceof TeleportSpotEntity) {
          e.config.teleport.refresh()

          e.render(true)
        }
      })
    }, false, e => this.handler_pool.bind(e))

    TransportData.getAll().then(transports => transports.forEach(trans => {
      if (trans.type == "entity" || trans.type == "door") {
        new EntityTransportEntity({
          highlightable: true,
          shortcut: trans,
          interactive: interactive
        }).addTo(this)


        if (trans.type == "entity") {

          trans.actions.forEach(action => {
            action.movement.forEach(movement => {
              if (!EntityTransportation.Movement.isLocal(movement)) {
                new RemoteEntityTransportTarget({
                  highlightable: true,
                  interactive: interactive,
                  transport: trans,
                  action: action,
                  movement: movement
                }).addTo(this)
              }
            })
          })
        }
      } else if (trans.type == "teleports") {
        trans.spots.forEach(spot => {
          new TeleportSpotEntity({
            highlightable: true,
            teleport: new TeleportGroup.Spot(trans, spot, trans.access[0]),
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

    this.quad_tree_debug_rendering = false
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