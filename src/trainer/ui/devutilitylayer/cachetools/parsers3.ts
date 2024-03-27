import {TransportParser2} from "./TransportParser";
import {CacheTypes} from "./CacheTypes";
import {Transportation} from "../../../../lib/runescape/transportation";
import {TileRectangle} from "../../../../lib/runescape/coordinates";
import {direction} from "../../../../lib/runescape/movement";
import {TileTransform} from "../../../../lib/runescape/coordinates/TileTransform";
import {Transform, Vector2} from "../../../../lib/math";
import {ParsingParameter} from "./ParsingParameters";
import {TileArea} from "../../../../lib/runescape/coordinates/TileArea";
import {EntityTransportationBuilder} from "./util/GeneralEntityTransportationBuilder";
import {MovementBuilder} from "./util/MovementBuilder";
import LocInstance = CacheTypes.LocInstance;
import PP = ParsingParameter;
import rec = ParsingParameter.rec;
import offset = MovementBuilder.offset;
import fixed = MovementBuilder.fixed;
import EntityActionMovement = Transportation.EntityActionMovement;

function parse<GroupT, InstanceT>(id: string,
                                  name: string,
                                  groupPar: ParsingParameter<GroupT>,
                                  instancePar: ParsingParameter<InstanceT>,
                                  apply: (instance: CacheTypes.LocInstance, args: { per_loc: GroupT; per_instance?: InstanceT }) => Promise<Transportation.Transportation[]>) {

  return (new class extends TransportParser2 {
    constructor() {
      super(id, name);

      this.per_loc_group_parameter = groupPar
      this.per_instance_parameter = instancePar
    }

    apply(instance: CacheTypes.LocInstance, args: { per_loc: GroupT; per_instance?: InstanceT }): Promise<Transportation.Transportation[]> {
      return apply(instance, args)
    }
  })
}

function transformWithLoc(transport: Transportation.GeneralEntityTransportation, use: LocInstance): Transportation.GeneralEntityTransportation
function transformWithLoc(transport: Transportation.EntityTransportation, use: LocInstance): Transportation.EntityTransportation
function transformWithLoc(transport: Transportation.DoorTransportation, use: LocInstance): Transportation.DoorTransportation
function transformWithLoc(transport: Transportation.EntityTransportation, use: LocInstance): Transportation.EntityTransportation {
  // Apply rotation
  if (use.rotation != 0) {
    transport = Transportation.transform(transport, TileTransform.normalize(
      Transform.rotation((4 - use.rotation) % 4), // Cache rotation is clockwise, while Transform.rotation is counterclockwise
    ))
  }

  const current_origin = transport.type == "entity"
    ? TileRectangle.bl(transport.clickable_area)
    : transport.position

  transport = Transportation.transform(transport,
    TileTransform.translation(Vector2.sub(use.origin, current_origin), use.plane - current_origin.level),
  )

  if (transport.type == "entity") {
    transport.clickable_area = TileRectangle.extend(transport.clickable_area, 0.5)
  }

  return transport
}

export const parsers3: TransportParser2[] = [
  parse("west-facing-doors", "Standard West Doors", null, null, async (instance) => {

      const door: Transportation.DoorTransportation = {
        type: "door",
        position: instance.origin,
        direction: direction.west,
        name: instance.prototype.name ?? "Door",
      }

      return [transformWithLoc(door, instance)]
    }
  ),
  parse("ignore", "Ignore", null, null, async (instance) => {
      return []
    }
  ),
  parse("ladders", "Ladders", PP.rec({
      across: PP.element("Across", PP.bool()),
      single_side: PP.element("Side", PP.dir(), true),
      up: PP.element("Up", PP.locAction(), true),
      down: PP.element("Down", PP.locAction(), true),
      top: PP.element("Top/Bottom", PP.rec({
        action: PP.element("Action", PP.locAction()),
        level: PP.element("Floor", PP.floor())
      }), true),
    })
    , null, async (instance, {per_loc}) => {
      const builder = EntityTransportationBuilder.from(instance)

      const off = per_loc.single_side && per_loc.across
        ? Vector2.scale(-2, direction.toVector(per_loc.single_side))
        : {x: 0, y: 0}

      const interactive = per_loc.single_side
        ? TileArea.init({...direction.toVector(per_loc.single_side), level: 0})
        : undefined

      if (per_loc.up != null) {
        builder.action({
            index: per_loc.up.id,
            interactive_area: interactive
          },
          offset({...off, level: 1})
            .orientation("toentitybefore")
            .time(3)
        )
      }

      if (per_loc.down != null) {
        builder.action({
            index: per_loc.down.id,
            interactive_area: interactive
          },
          offset({...off, level: -1})
            .orientation("toentitybefore")
            .time(3)
        )
      }

      if (per_loc.top != null) {
        builder.action({
            index: per_loc.top.action.id,
            interactive_area: interactive
          },
          offset({...off, level: per_loc.top.level - instance.box.level})
            .orientation("toentitybefore")
            .time(3)
        )
      }

      return [builder.finish()]
    }),
  parse("simpleremotetransport", "Remote",
    PP.rec({
      action: PP.element("Action", PP.locAction()),
      time: PP.element("Time", PP.int([0, 100]).default(3)),
    }), PP.rec({
      target: PP.element("Target", PP.tileArea()),
    }), async (instance, {per_loc, per_instance}) => {
      const builder = EntityTransportationBuilder.from(instance)

      builder.action({
          index: per_loc.action.id,
        }, fixed(per_instance.target)
      )

      return [builder.finish()]
    }),
  parse("prototypecopyloc", "Prototype",
    rec({
      plane_offset: PP.element("Plane Offset", PP.int([-3, 3]), true),
      actions: PP.element("Actions", PP.list(PP.rec({
        action: PP.element("Action", PP.locAction()),
        area: PP.element("Area", PP.tileArea(), true),
        movements: PP.element("Movements", PP.list(PP.rec({
          valid_from: PP.element("Valid", PP.tileArea(), true),
          orientation: PP.element("Orientation", PP.either({
            simple: PP.choose<EntityActionMovement["orientation"]>({
              toHTML: (v) => c().text(v)
            }, ["bymovement", "toentitybefore", "toentityafter", "keep", "forced"]),
            forced: PP.dir()
          }), true),
          movement: PP.element("Movement", PP.either({
            offset: PP.offset(),
            fixed: PP.tileArea()
          })),
          time: PP.element("Time", PP.int([0, 30]).default(3))
        })))
      })))
    })
    , null,
    async (instance, {per_loc}) => {
      const builder = EntityTransportationBuilder.from(instance)
        .planeOffset(per_loc.plane_offset ?? 0)

      // TODO: This is still broken because offsets and coordinates entered on the map need to be translated relative to the edited loc instance

      for (const action of per_loc.actions) {
        builder.action({
          index: action.action.id,
          interactive_area: action.area
        }, ...action.movements.map(m => {

          let b: MovementBuilder = null

          if (m.movement.fixed) b = fixed(m.movement.fixed)
          else if (m.movement.offset) b = offset(m.movement.offset)

          if (m.orientation) {
            if (m.orientation.simple) b.orientation(m.orientation.simple)
            if (m.orientation.forced) b.forcedOrientation(m.orientation.forced)
          }

          b.time(m.time ?? 3)

          if (m.valid_from) {
            b.restrict(m.valid_from)
          }

          return b
        }))
      }

      return [builder.finish()]
    }
  )
]

export namespace Parsers3 {
  export function getById(id: string): TransportParser2 {
    return parsers3.find(p => p.id == id)
  }
}