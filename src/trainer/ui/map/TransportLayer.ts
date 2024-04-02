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
      this.eachEntity(e => {
        if (e instanceof TeleportSpotEntity) {
          e.teleport.refresh()

          e.render(true)
        }
      })
    }, false, e => this.handler_pool.bind(e))

    TransportData.getAll().then(transports => transports.forEach(trans => {
      if (trans.type == "entity" || trans.type == "door") {
        new EntityTransportEntity(trans)
          .setInteractive(interactive).addTo(this)


        if (trans.type == "entity") {

          trans.actions.forEach(action => {
            action.movement.forEach(movement => {
              if (!EntityTransportation.Movement.isLocal(movement)) {
                new RemoteEntityTransportTarget(trans, action, movement)
                  .setInteractive(interactive).addTo(this)
              }
            })
          })
        }
      } else if (trans.type == "teleports") {
        trans.spots.forEach(spot => {
          new TeleportSpotEntity(new TeleportGroup.Spot(trans, spot, trans.access[0]))
            .setInteractive(interactive)
            .addTo(this)
        })

        trans.access.forEach(access => {
          if (access.type == "entity") {
            new TeleportAccessEntity(trans, access)
              .setInteractive(interactive)
              .addTo(this)
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